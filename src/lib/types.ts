export interface InkEntry {
  id: number;
  pen_id: number;
  ink_name: string;
  inked_date: string;
  notes: string;
  created_at: string;
}

export interface Pen {
  id: number;
  brand: string;
  model: string;
  color: string;
  nib_size: string;
  nib_material: string;
  nib_type: string;
  fill_system: string;
  date_purchased: string;
  purchase_price: number | null;
  purchase_location: string;
  current_ink: string;
  condition: string;
  notes: string;
  image_url: string;
  rating: number;
  is_daily_carry: number;
  provenance: string;
  storage_location: string;
  created_at: string;
  updated_at: string;
}

export interface InkBottle {
  id: number;
  name: string;
  brand: string;
  color_description: string;
  type: string;
  bottle_size_ml: number | null;
  remaining_pct: number;
  notes: string;
  swatch_url: string;
  created_at: string;
}

export interface WishlistItem {
  id: number;
  brand: string;
  model: string;
  notes: string;
  url: string;
  estimated_price: number | null;
  priority: "low" | "medium" | "high" | "grail";
  acquired: number;
  created_at: string;
}

export interface MaintenanceEntry {
  id: number;
  pen_id: number;
  type: string;
  notes: string;
  date: string;
  created_at: string;
}

export interface WritingSample {
  id: number;
  pen_id: number;
  ink_name: string;
  paper: string;
  notes: string;
  image_url: string;
  created_at: string;
}
