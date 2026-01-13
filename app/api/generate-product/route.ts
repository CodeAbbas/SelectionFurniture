import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { ProductSchema } from '../../../lib/productSchema';

export const maxDuration = 60;

// --- WEBSITE STRUCTURE (The Rulebook) ---
const WEBSITE_TAXONOMY = {
  Sofa: ["Sofa bed", "Corner sofa", "Corner Sofa Bed", "Recliner", "Armchair"],
  Beds: ["Divan", "Velvet", "High gloss", "Bunk bed"],
  Wardrobes: ["Sliding", "Two door", "Three/Four door", "High gloss"],
  Dining: ["Table", "Marble table set", "Chair", "Budget sets"],
  "Bedroom sets": ["Table", "High gloss set", "Velvet sets", "Budget sets"],
  Mattress: ["Orthopedic", "Blue foam", "Spring", "Pocket spring", "Latex", "Majestic"],
  "TV Stand": [],
  Armchair: []
};

export async function POST(req: Request) {
  try {
    // 🔐 API key check
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({ error: "Google API Key is missing." }, { status: 500 });
    }

    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    console.log("🚀 Input Prompt:", prompt);

    // 1️⃣ Extract URL
    const urlMatch = prompt.match(/(https?:\/\/[^\s]+)/);
    const url = urlMatch ? urlMatch[0] : null;

    let scrapedImages: string[] = [];

    // 2️⃣ External scraper with timeout
    if (url) {
      console.log(`🔍 Detected URL: ${url}`);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      try {
        const scraperResponse = await fetch(
          'https://image-links-scrapper.vercel.app/scrape/api',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
            signal: controller.signal,
            cache: 'no-store'
          }
        );

        if (scraperResponse.ok) {
          const data = await scraperResponse.json();

          if (data.success && Array.isArray(data.data)) {
            const allImages = data.data.map((img: any) => img.cleanUrl || img.url);

            scrapedImages = allImages.filter((link: string) => {
              const lower = link.toLowerCase();
              return (
                !lower.includes('logo') &&
                !lower.includes('icon') &&
                !lower.includes('favicon') &&
                !lower.includes('loader') &&
                !lower.includes('placeholder') &&
                !lower.includes('svg')
              );
            });

            console.log(`🖼️ Images: ${scrapedImages.length} usable`);
          }
        }
      } catch (err) {
        console.warn("⚠️ Scraper failed:", err);
      } finally {
        clearTimeout(timeout);
      }
    }

    // 3️⃣ Low-cost visual context
    const visualContext = scrapedImages.slice(0, 2);

    // 4️⃣ AI generation (schema-safe)
    let result;
    try {
      result = await generateObject({
        model: google('gemini-2.5-flash'),
        schema: ProductSchema,
        prompt: `
You are an expert furniture product database assistant for "SelectionFurniture".

CONTEXT:
- Source URL: ${url || 'None'}
- User prompt: ${prompt}
- Visual samples: ${JSON.stringify(visualContext)}

OFFICIAL TAXONOMY:
${JSON.stringify(WEBSITE_TAXONOMY, null, 2)}

STRICT RULES:
1. categories:
   - Choose EXACTLY one main category from the taxonomy keys.
   - Optional second category only if absolutely relevant.
2. subcategories:
   - Must belong to the chosen category.
   - Max 3.
3. gallery:
   - ALWAYS return an empty array [].
4. description:
   - Plain text, professional, max 200 chars.
5. long_description:
   - VALID HTML ONLY.
   - Must include <ul><li><b>Feature</b>: text</li></ul>
6. price:
   - Number in GBP.
7. Do NOT invent categories or subcategories.
        `.trim(),
      });
    } catch (err) {
      console.error("❌ Gemini schema validation failed:", err);
      return NextResponse.json(
        { error: "AI generation failed due to schema mismatch." },
        { status: 422 }
      );
    }

    // 5️⃣ Cost monitoring (USD — honest)
    if (result.usage) {
      const { promptTokens, completionTokens, totalTokens } = result.usage;
      const costUSD =
        (promptTokens / 1_000_000) * 0.10 +
        (completionTokens / 1_000_000) * 0.40;

      console.log(`💰 Cost: $${costUSD.toFixed(6)} | Tokens: ${totalTokens}`);
    }

    // 6️⃣ Inject gallery safely (override AI)
    const aiObject = { ...result.object };
    delete (aiObject as any).gallery;

    const finalData = {
      ...aiObject,
      gallery: scrapedImages.slice(0, 15)
    };

    return NextResponse.json(finalData);

  } catch (error: any) {
    console.error("🔥 FATAL ERROR:", error);
    return NextResponse.json(
      { error: "Generation Failed", details: error.message },
      { status: 500 }
    );
  }
}