import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().describe("Unique ID (e.g., 'bed-001', 'sofa-001', 'wardrobe-001')"),
  name: z.string(),
  
  // Strict Category Limits
  categories: z.array(z.string())
    .max(3) 
    .describe("Main Category from website menu (e.g. 'Sofa', 'Beds'). Max 3."),
  
  // Strict Subcategory Limits
  subcategories: z.union([
    z.string(), 
    z.array(z.string()).max(3)
  ]).optional().describe("Specific types (e.g. 'Divan', 'Corner sofa') /. Max 3."),
  
  description: z.string(),
  long_description: z.string(),
  
  price: z.number(),
  original_price: z.number().optional(),
  currency: z.string().default('GBP'),
  
  rating: z.number().min(0).max(5).default(5),
  
  gallery: z.array(z.string()).max(15),
  
  badges: z.array(z.object({
    text: z.string(),
    color: z.string(),
    type: z.string().optional()
  })).max(3).optional(),
  
  is_new_arrival: z.boolean().default(false),
  is_best_seller: z.boolean().default(false),
  actions: z.array(z.string()).default(["heart", "eye", "repeat", "bag"])
});