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
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      }
    })

    const prompt = {
      text: "Você é um agente extrator de dados de recibos de supermercado. Analise esta imagem de recibo e retorne um array JSON com os itens encontrados. Para cada item inclua: productName (string), quantity (number), unitPrice (number), total (number), e validFormat (boolean). Use ponto como separador decimal."
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    const base64 = btoa(String.fromCharCode(...bytes))

    const imageParts = {
      inlineData: {
        data: base64,
        mimeType: file.type
      }
    }

    const result = await model.generateContent([prompt, imageParts])
    const response = await result.response
    const text = response.text()

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