
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      model: "gemini-pro-vision",
      generationConfig: {
        temperature: 0.4,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      }
    })

    const prompt = {
      text: `Você é um agente extrator de dados de recibos de supermercado. Analise esta imagem de recibo e retorne um array JSON com os itens encontrados. Para cada item inclua:
      - productName (string): nome do produto
      - quantity (number): quantidade comprada
      - unitPrice (number): preço unitário
      - total (number): preço total
      - validFormat (boolean): indica se a linha foi processada corretamente
      
      Use ponto como separador decimal. Se houver erro nos cálculos (ex: quantity * unitPrice ≠ total), marque validFormat como false.
      
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

    console.log('Analyzing receipt image...')
    const result = await model.generateContent([prompt, imageParts])
    const response = await result.response
    const text = response.text()
    console.log('Analysis complete:', text)

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
    console.error('Error analyzing receipt:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
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
