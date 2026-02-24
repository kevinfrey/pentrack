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
  created_at: string;
  updated_at: string;
}
