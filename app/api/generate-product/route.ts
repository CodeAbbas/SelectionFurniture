import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { ProductSchema } from '../../../lib/productSchema'; 

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google API Key is missing." }, 
        { status: 500 }
      );
    }

    const { prompt } = await req.json();
    console.log("🚀 Input Prompt:", prompt);

    // 1. EXTRACT URL
    const urlMatch = prompt.match(/(https?:\/\/[^\s]+)/);
    const url = urlMatch ? urlMatch[0] : null;
    let scrapedImages: string[] = [];

    // 2. SCRAPE (FIXED)
    if (url) {
      console.log(`🔍 Detected URL: ${url} - Scraping now...`);
      try {
        // FIX 1: Correct Endpoint URL (/scrape/api)
        const scraperResponse = await fetch('https://image-links-scrapper.vercel.app/scrape/api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
          // Add no-cache to ensure fresh results
          cache: 'no-store' 
        });
        
        if (scraperResponse.ok) {
          const data = await scraperResponse.json();
          console.log("Scraper Raw Response:", data); // Helpful for debugging

          // FIX 2: Correct Property Access (data.data)
          if (data.success && Array.isArray(data.data)) {
            // We map to cleanUrl to give the AI a cleaner list of strings
            scrapedImages = data.data.map((img: any) => img.cleanUrl);
            console.log(`✅ Scraper found ${scrapedImages.length} images`);
          }
        } else {
          console.error("❌ Scraper failed:", scraperResponse.status);
        }
      } catch (err) {
        console.error("❌ Scraper connection error:", err);
      }
    }

    // 3. GENERATE WITH AI
    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: ProductSchema,
      prompt: `
        SOURCE URL: ${url || 'None'}
        USER REQUEST: ${prompt}
        
        SCRAPED IMAGES FOUND (Prioritize these for the 'gallery'): 
        ${JSON.stringify(scrapedImages)}

        INSTRUCTIONS:
        1. If 'SCRAPED IMAGES FOUND' is not empty, use them for the 'gallery' field.
        2. Analyze the URL/Request to infer price, name, and description.
        3. If no specific details are found, generate realistic placeholder data.
        4. 'categories' must be an ARRAY.
        5. 'long_description' must use HTML tags (<b>, <ul>, <li>).
      `,
    });

    return NextResponse.json(result.object);

  } catch (error: any) {
    console.error("🔥 FATAL ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Unknown Server Error" }, 
      { status: 500 }
    );
  }
}