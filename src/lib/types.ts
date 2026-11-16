export type UnitSystem = 'india' | 'us' | 'uk';
export interface Measurements { chest: number; waist: number; hip: number; shoulder: number; height: number } // all cm
export type Occasion = 'wedding' | 'festival' | 'office' | 'casual' | 'date' | 'sangeet';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type Category = 'kurta' | 'sherwani' | 'lehenga' | 'saree' | 'western' | 'fusion';
export type Gender = 'women' | 'men' | 'unisex';
export interface Prefs {
  occasion: Occasion; time: TimeOfDay; formality: number; // 1 relaxed .. 5 formal
  budget: [number, number]; categories: Category[];
}
export interface Brand { name: string; sizeChart: SizeRow[]; }
export interface SizeRow { size: string; chest: number; waist: number; hip: number; shoulder: number }
export interface Product {
  id: string; name: string; brand: string; category: Category; gender: Gender; price: number; mrp: number;
  source: 'Myntra' | 'Amazon Fashion' | 'Ajio' | 'Nykaa Fashion' | 'Tata CLiQ'; url: string;
  colors: [string, string]; accent: string; fabric: string; occasions: Occasion[]; formality: number;
  garment: GarmentSpec; rating: number; tags: string[];
}
export interface GarmentSpec {
  kind: 'kurta' | 'sherwani' | 'lehenga' | 'saree' | 'dress' | 'shirt-trouser' | 'suit' | 'anarkali' | 'kurta-pyjama' | 'jeans-top';
  length: number; // 0..1 hem position relative to body (0=hip,1=ankle)
}
