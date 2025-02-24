
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
      return await result.response;
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
      throw new Error('No file provided')
    }

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '')
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1,
        topP: 0.1,
        topK: 16,
        maxOutputTokens: 8192,
      }
    })

    const prompt = {
      text: `Você é um agente extrator de dados de recibos de supermercado. Analise esta imagem e extraia os dados EXATAMENTE como mostrado no recibo.

Para cada item, retorne:
1. productName: nome do produto exatamente como está no recibo
2. quantity: quantidade exata do produto (pode ser decimal)
3. unitPrice: preço unitário do produto
4. total: valor total do item exatamente como está no recibo
5. validFormat: true se o total for igual a quantity * unitPrice (com margem de erro de 0.01), false caso contrário

Retorne SOMENTE um JSON com a estrutura:

{
  "store_info": {
    "name": "NOME DO ESTABELECIMENTO"
  },
  "items": [
    {
      "productName": "string",
      "quantity": number,
      "unitPrice": number,
      "total": number,
      "validFormat": boolean
    }
  ],
  "purchase_date": "YYYY-MM-DD"
}

IMPORTANTE:
- Extraia a data da compra exatamente como mostrada no recibo. Deve estar no formato YYYY-MM-DD.
- Mantenha os valores EXATAMENTE como aparecem no recibo
- Não faça cálculos ou correções nos valores
- Use ponto como separador decimal
- Marque validFormat como false se houver qualquer discrepância entre quantity * unitPrice e total
- NÃO inclua nenhuma explicação, apenas o JSON`
    }

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

    console.log('Analisando imagem do recibo...')
    const response = await analyzeWithRetry(model, prompt, imageParts);
    const text = response.text()
    console.log('Análise completa:', text)

    return new Response(
      JSON.stringify({ result: text }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )

  } catch (error) {
    console.error('Erro ao analisar recibo:', error)
    
    let errorMessage = error.message;
    if (error.message.includes('503 Service Unavailable')) {
      errorMessage = 'O serviço está temporariamente sobrecarregado. Por favor, tente novamente em alguns instantes.';
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
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
