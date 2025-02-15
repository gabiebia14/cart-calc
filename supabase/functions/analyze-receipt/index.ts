
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function analyzeWithRetry(model: any, prompt: any, imageParts: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Tentativa ${attempt} de ${maxRetries}`);
      const result = await model.generateContent([prompt, imageParts]);
      const response = await result.response;
      console.log('Resposta do modelo:', response.text());
      return response;
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
- Use ponto como separador decimal
- Não arredonde valores, mantenha exatamente como está no recibo
- Não inclua símbolos de moeda (R$) nos valores numéricos
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
    const response = await analyzeWithRetry(model, prompt, imageParts);
    const responseText = response.text();
    console.log('Texto da resposta:', responseText);

    let parsedData;
    try {
      // Remove any potential markdown formatting
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
      console.log('JSON limpo:', cleanJson);
      
      parsedData = JSON.parse(cleanJson);
      
      // Validação detalhada da estrutura
      if (!parsedData.store_info?.name) {
        throw new Error('store_info.name não encontrado');
      }
      if (!parsedData.store_info?.date) {
        throw new Error('store_info.date não encontrado');
      }
      if (!Array.isArray(parsedData.items)) {
        throw new Error('items não é um array');
      }
      if (parsedData.items.length === 0) {
        throw new Error('nenhum item encontrado');
      }
      if (typeof parsedData.total !== 'number') {
        throw new Error('total inválido');
      }

      console.log('Análise completa:', JSON.stringify(parsedData, null, 2));
      
      return new Response(
        JSON.stringify({ result: cleanJson }),
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
        details: error.stack // Adiciona stack trace para debug
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
