
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function parseNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  // Remove R$ e converte vírgula para ponto
  return Number(value.replace('R$', '').replace(',', '.').trim());
}

function validateReceipt(data: any) {
  if (!data.store_info?.name) {
    throw new Error('Nome do estabelecimento não encontrado');
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new Error('Lista de itens inválida');
  }

  // Processa o total e itens
  if (typeof data.total === 'string') {
    data.total = parseNumber(data.total);
  }

  data.items = data.items.map((item: any) => ({
    ...item,
    quantity: parseNumber(item.quantity),
    unitPrice: parseNumber(item.unitPrice),
    total: parseNumber(item.total)
  }));

  return data;
}

async function analyzeWithRetry(model: any, prompt: any, imageParts: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Tentativa ${attempt} de ${maxRetries}`);
      const result = await model.generateContent([prompt, imageParts]);
      
      if (!result || !result.response) {
        throw new Error('Resposta vazia do modelo');
      }

      const response = result.response;
      const text = response.text();
      
      if (!text) {
        throw new Error('Texto vazio na resposta');
      }

      console.log(`Resposta obtida na tentativa ${attempt}:`, text);
      return text;
    } catch (error) {
      console.error(`Erro na tentativa ${attempt}:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      const waitTime = attempt * 2000;
      console.log(`Aguardando ${waitTime}ms antes da próxima tentativa...`);
      await sleep(waitTime);
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      throw new Error('Nenhum arquivo fornecido')
    }

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '')
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1,
        topP: 0.1,
        topK: 1,
        maxOutputTokens: 8192,
      }
    })

    const prompt = {
      text: `Analise esta imagem de recibo de supermercado e retorne um objeto JSON com:

1. store_info:
   - name: nome do estabelecimento exatamente como aparece no recibo
   - date: data da compra no formato YYYY-MM-DD

2. items: array de itens onde cada item deve conter:
   - productName: nome do produto em maiúsculas exatamente como está no recibo
   - quantity: número decimal usando ponto como separador
   - unitPrice: preço unitário (se não estiver explícito, calcule dividindo o total pela quantidade)
   - total: valor total do item exatamente como mostrado no recibo
   - validFormat: true se todos os valores foram extraídos corretamente e quantity * unitPrice = total (com margem de erro de 0.01)

3. total: valor total da compra exatamente como mostrado no recibo

Regras importantes:
- Preserve EXATAMENTE a grafia original dos produtos
- Mantenha os valores numéricos como strings, incluindo o símbolo R$ quando presente
- Não arredonde valores, mantenha exatamente como está no recibo
- Inclua todos os itens do recibo, mesmo que repetidos

Retorne apenas o JSON, sem explicações adicionais.`
    }

    // Convert file to base64 more efficiently
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    const chunks: string[] = []
    for (let i = 0; i < bytes.length; i += 1024) {
      chunks.push(String.fromCharCode(...bytes.slice(i, i + 1024)))
    }
    const base64 = btoa(chunks.join(''))

    const imageParts = {
      inlineData: {
        data: base64,
        mimeType: file.type
      }
    }

    console.log('Iniciando análise do recibo...')
    const responseText = await analyzeWithRetry(model, prompt, imageParts);

    if (!responseText) {
      throw new Error('Resposta vazia do modelo');
    }

    try {
      // Remove qualquer formatação markdown e limpa o texto
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      console.log('JSON recebido:', cleanJson);
      
      let parsedData = JSON.parse(cleanJson);
      console.log('JSON parseado:', parsedData);

      // Valida e processa os números
      parsedData = validateReceipt(parsedData);
      console.log('Dados processados:', parsedData);
      
      return new Response(
        JSON.stringify({ result: JSON.stringify(parsedData) }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          }
        }
      )
    } catch (parseError) {
      console.error('Erro ao processar JSON:', parseError);
      console.error('Texto que causou erro:', responseText);
      throw new Error(`Erro ao processar dados do recibo: ${parseError.message}`);
    }

  } catch (error) {
    console.error('Erro ao analisar recibo:', error);
    
    let errorMessage = error.message;
    if (error.message.includes('503 Service Unavailable')) {
      errorMessage = 'O serviço está temporariamente sobrecarregado. Por favor, tente novamente em alguns instantes.';
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.stack
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    )
  }
})
