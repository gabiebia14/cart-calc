
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function normalizeWithRetry(model: any, prompt: string, productName: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${maxRetries} to normalize: "${productName}"`);
      const result = await model.generateContent(prompt + productName);
      return await result.response.text();
    } catch (error) {
      console.error(`Error in attempt ${attempt}:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      const waitTime = attempt * 2000;
      console.log(`Waiting ${waitTime}ms before next attempt...`);
      await sleep(waitTime);
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { productName } = await req.json()

    if (!productName || typeof productName !== 'string') {
      throw new Error('Product name is required and must be a string')
    }

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '')
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1,
        topP: 0.1,
        topK: 16,
        maxOutputTokens: 100,
      }
    })

    const prompt = `Normalize the following product name by standardizing it to a searchable form, but ALWAYS preserve full brand names and product identifiers. 
    Remove package sizes and minor adjectives, but keep ALL brand names completely intact.
    Return ONLY the normalized name, nothing else. Keep it clean but recognizable.
    
    Examples:
    "Leite integral Parmalat 1L" → "leite parmalat"
    "Arroz branco tipo 1 Tio João 5kg" → "arroz tio joão"
    "Coca Cola 2L" → "coca cola"
    "Macarrão espaguete Barilla 500g" → "macarrão espaguete barilla"
    "Papel higiênico Mili 30m" → "papel higiênico mili"
    "Café em pó Pilão torrado e moído 500g" → "café pilão"
    
    Now normalize this product name: `

    const normalizedName = await normalizeWithRetry(model, prompt, productName);
    
    // Clean up the response and make sure it's a simple string
    const cleanedNormalizedName = normalizedName
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/^\s+|\s+$/g, '')  // Trim whitespace
      .toLowerCase();              // Convert to lowercase

    console.log(`Normalized "${productName}" to "${cleanedNormalizedName}"`);

    return new Response(
      JSON.stringify({ normalizedName: cleanedNormalizedName }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )

  } catch (error) {
    console.error('Error normalizing product name:', error)
    
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
