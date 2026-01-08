import { google } from '@ai-sdk/google';
import { generateObject, tool } from 'ai';
import { z } from 'zod';
import { ProductSchema } from '../../../lib/productSchema';

// Allow 60 seconds for scraping and generation
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    console.log("🚀 Starting generation for:", prompt);

    const result = await generateObject({
      // USE THIS EXACT MODEL STRING:
      // This is the specific stable version '001'. 
      // It avoids the "404 Not Found" issues of the aliases.
      model: google('gemini-1.5-flash-001'), 
      
      schema: ProductSchema,
      system: `
        You are an expert product database assistant for 'SelectionFurniture'.
        
        RULES:
        1. ALWAYS use the 'scrapeImages' tool first.
        2. If the tool finds images, put them in 'gallery'.
        3. 'categories' must be an ARRAY (e.g. ["Bedroom", "Bed"]).
        4. 'long_description' must use HTML tags (<b>, <ul>, <li>).
        5. 'subcategories' can be an array or string.
      `,
      prompt: prompt,
      tools: {
        scrapeImages: tool({
          description: 'Scrapes image URLs from a provided product page URL',
          parameters: z.object({
            url: z.string().describe('The full URL of the product page'),
          }),
          execute: async ({ url }) => {
            console.log(`🔍 Scraping URL: ${url}`);
            try {
              const scraperResponse = await fetch('https://image-links-scrapper.vercel.app/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
              });

              if (!scraperResponse.ok) {
                console.error(`❌ Scraper API Error: ${scraperResponse.status}`);
                return { images: [] };
              }

              const data = await scraperResponse.json();
              const images = Array.isArray(data.images) ? data.images : [];
              console.log(`✅ Found ${images.length} images`);
              return { images };

            } catch (error) {
              console.error('❌ Scraping Failed:', error);
              return { images: [] }; // Return empty to keep AI alive
            }
          },
        }),
      },
    });

    return result.toJsonResponse();

  } catch (error: any) {
    // This logs the REAL error to your VS Code terminal
    console.error("🔥 FATAL ERROR:", error);
    
    // Return a readable error to the frontend
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}