// app/api/generate-product/route.ts
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { ProductSchema } from '../../../lib/productSchema'; 

// Allow 60 seconds for scraping
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    // 1. Check API Key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google API Key is missing. Check .env.local" }, 
        { status: 500 }
      );
    }

    const { prompt } = await req.json();
    console.log("🚀 Input Prompt:", prompt);

    // 2. EXTRACT URL & SCRAPE DIRECTLY (No AI Tools needed)
    // We find the first URL in the prompt to scrape it.
    const urlMatch = prompt.match(/(https?:\/\/[^\s]+)/);
    const url = urlMatch ? urlMatch[0] : null;
    let scrapedImages: string[] = [];

    if (url) {
      console.log(`🔍 Detected URL: ${url} - Scraping now...`);
      try {
        const scraperResponse = await fetch('https://image-links-scrapper.vercel.app/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        
        if (scraperResponse.ok) {
          const data = await scraperResponse.json();
          if (Array.isArray(data.images)) {
            scrapedImages = data.images;
            console.log(`✅ Scraper found ${scrapedImages.length} images`);
          }
        } else {
          console.error("❌ Scraper failed:", scraperResponse.status);
        }
      } catch (err) {
        console.error("❌ Scraper error:", err);
      }
    }

    // 3. GENERATE OBJECT (Standard, Stable Mode)
    // We pass the scraped data directly to the prompt.
    const result = await generateObject({
      model: google('gemini-1.5-flash-001'), 
      schema: ProductSchema,
      prompt: `
        SOURCE URL: ${url || 'None'}
        USER REQUEST: ${prompt}
        
        SCRAPED IMAGES FOUND: 
        ${JSON.stringify(scrapedImages)}

        INSTRUCTIONS:
        1. Use the 'SCRAPED IMAGES' above to populate the 'gallery' field.
        2. Analyze the 'SOURCE URL' (if provided) to infer details like price, name, and description.
        3. If no specific details are found, generate realistic placeholder data for furniture.
        4. 'categories' must be an ARRAY (e.g. ["Bedroom", "Bed"]).
        5. 'long_description' must use HTML tags (<b>, <ul>, <li>).
      `,
    });

    // 4. Return the result
    return NextResponse.json(result.object);

  } catch (error: any) {
    console.error("🔥 FATAL ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Unknown Server Error" }, 
      { status: 500 }
    );
  }
}