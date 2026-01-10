import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { ProductSchema } from '../../../lib/productSchema';

export const maxDuration = 60;

// --- WEBSITE STRUCTURE (The Rulebook) ---
const WEBSITE_TAXONOMY = {
  "Sofa": ["Sofa bed", "Corner sofa", "Corner Sofa Bed", "Recliner", "Armchair"],
  "Beds": ["Divan", "Velvet", "High gloss", "Bunk bed"],
  "Wardrobes": ["Sliding", "Two door", "Three/Four door", "High gloss"],
  "Dining": ["Table", "Marble table set", "Chair", "Budget sets"],
  "Bedroom sets": ["Table", "High gloss set", "Velvet sets", "Budget sets"],
  "Mattress": ["Orthopedic", "Blue foam", "Spring", "Pocket spring", "Latex", "Majestic"],
  "TV Stand": [],
  "Armchair": []
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Google API Key is missing." }, { status: 500 });
    }

    const { prompt } = await req.json();
    console.log("🚀 Input Prompt:", prompt);

    // 1. EXTRACT URL
    const urlMatch = prompt.match(/(https?:\/\/[^\s]+)/);
    const url = urlMatch ? urlMatch[0] : null;
    let scrapedImages: string[] = [];

    // 2. EXTERNAL SCRAPER
    if (url) {
      console.log(`🔍 Detected URL: ${url} - Calling External Scraper...`);
      try {
        const scraperResponse = await fetch('https://image-links-scrapper.vercel.app/scrape/api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
          cache: 'no-store'
        });

        if (scraperResponse.ok) {
          const data = await scraperResponse.json();
          if (data.success && Array.isArray(data.data)) {
            
            // --- FILTER OUT LOGOS & JUNK ---
            const allImages = data.data.map((img: any) => img.cleanUrl || img.url);
            
            scrapedImages = allImages.filter((link: string) => {
              const lower = link.toLowerCase();
              return !lower.includes('logo') && 
                     !lower.includes('icon') && 
                     !lower.includes('favicon') &&
                     !lower.includes('loader') &&
                     !lower.includes('placeholder') &&
                     !lower.includes('svg'); 
            });

            console.log(`✅ Scraper found ${allImages.length} raw images -> Filtered to ${scrapedImages.length} clean images`);
          }
        }
      } catch (err) {
        console.warn("⚠️ Scraper connection error:", err);
      }
    }

    // 3. LOW COST CONTEXT
    const lowCostContext = scrapedImages.slice(0, 2);

    // 4. GENERATE CONTENT
    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: ProductSchema,
      prompt: `
        You are an expert furniture product database assistant for 'SelectionFurniture'.
        
        CONTEXT DATA:
        - SOURCE URL: ${url || 'None'}
        - USER REQUEST: ${prompt}
        - VISUAL SAMPLES: ${JSON.stringify(lowCostContext)}

        - **OFFICIAL WEBSITE MENU STRUCTURE (TAXONOMY):** ${JSON.stringify(WEBSITE_TAXONOMY, null, 2)}

        STRICT RULES:
        1. **CATEGORIZATION (CRITICAL):** - **'categories'**: Must pick exactly ONE key from the 'OFFICIAL WEBSITE MENU STRUCTURE' (e.g. "Sofa" or "Beds"). You may add one secondary category if necessary, but prioritize the official list.
           - **'subcategories'**: Must pick matching items from the list above (e.g. if Category is "Beds", subcategory MUST be "Divan" or "Velvet"). keep it under 5 items total.

        2. **GALLERY:** Return an EMPTY array []. (I will inject real images via code).
        
        3. **DESCRIPTION:** Write a professional description, long_description HTML(<ul>, <b>). No Markdown.
        4. **DETAILS:** Infer Name, Price (GBP), and specs from the URL.
      `,
    });

    // 5. COST MONITORING
    if (result.usage) {
      const { promptTokens, completionTokens, totalTokens } = result.usage;
      const totalCost = ((promptTokens / 1000000) * 0.10 * 0.8) + ((completionTokens / 1000000) * 0.40 * 0.8);
      console.log(`💰 Cost: £${totalCost.toFixed(6)} | Tokens: ${totalTokens}`);
    }

    // 6. FREE INJECTION
    const finalData = {
      ...result.object,
      gallery: scrapedImages.slice(0, 15)
    };

    return NextResponse.json(finalData);

  } catch (error: any) {
    console.error("🔥 FATAL ERROR:", error);
    return NextResponse.json({ error: "Generation Failed", details: error.message }, { status: 500 });
  }
}