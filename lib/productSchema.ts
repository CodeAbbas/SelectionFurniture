import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().describe("Unique ID (e.g., 'bed-001', 'mattress-005')"),
  name: z.string(),
  
  // Categorization
  categories: z.array(z.string()).describe("Main categories, e.g. ['Bedroom', 'Bed']"),
  
  // Allow BOTH singular and plural to handle your mixed data structure safely
  subcategory: z.union([z.string(), z.array(z.string())]).optional(),
  subcategories: z.union([z.string(), z.array(z.string())]).optional().describe("Specific subcat, e.g. ['Ottoman', 'Lift up']"),
  
  description: z.string().describe("Short summary for grid view"),
  long_description: z.string().describe("HTML formatted details with <b>, <ul>, <li>. Do NOT use markdown."),
  
  price: z.number(),
  original_price: z.number().optional(),
  currency: z.string().default('GBP'),
  
  rating: z.number().min(0).max(5).default(5),
  
  // The crucial part: The Gallery Array
  gallery: z.array(z.string()).describe("Array of high-res image URLs"),
  
  badges: z.array(z.object({
    text: z.string(),
    color: z.string(),
    type: z.string().optional()
  })).optional(),
  
  is_new_arrival: z.boolean().default(false),
  is_best_seller: z.boolean().default(false),
  actions: z.array(z.string()).default(["heart", "eye", "repeat", "bag"])
});