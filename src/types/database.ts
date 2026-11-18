export type UserRole = 'customer' | 'admin';

export type ProductDivisionSlug =
  | 'labels-stickers'
  | 'race-event-numbers'
  | 'mtb-boards'
  | 'stamps'
  | 'trophies'
  | 'laser-cut-work';

export type PipelineStage =
  | 'QUOTE'
  | 'ORDER'
  | 'ARTWORK'
  | 'PROOF'
  | 'PRODUCTION'
  | 'COMPLETED';

export type ProofStatus = 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED';
export type ArtworkSourceType = 'CANVAS_DESIGN' | 'UPLOADED_FILE';

export interface ProductDivision {
  id: string;
  slug: ProductDivisionSlug;
  name: string;
  tagline: string;
  description: string;
  min_width_mm: number;
  max_width_mm: number;
  min_height_mm: number;
  max_height_mm: number;
  default_width_mm: number;
  default_height_mm: number;
  bleed_mm: number;
  safe_margin_mm: number;
  output_dpi: number;
  base_setup_fee: number;
  base_rate_per_sq_cm: number;
  min_quantity: number;
  supports_csv_merge: boolean;
  monochrome_preview: boolean;
  layer_mode: 'STANDARD' | 'CONTOUR' | 'MONOCHROME' | 'ENGRAVE_BOX' | 'CUT_ENGRAVE';
  gallery_images: string[];
  is_active: boolean;
}

export interface DivisionMaterial {
  id: string;
  division_id: string;
  code: string;
  name: string;
  spec_summary: string;
  price_multiplier: number;
  is_active: boolean;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  company_name: string | null;
  vat_number: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

export interface OrderRecord {
  id: string;
  order_number: string;
  user_id: string;
  division_id: string;
  material_id: string;
  division_slug: ProductDivisionSlug;
  material_name: string;
  width_mm: number;
  height_mm: number;
  orientation: 'portrait' | 'landscape';
  quantity: number;
  source_type: ArtworkSourceType;
  canvas_json: Record<string, unknown> | null;
  uploaded_artwork_path: string | null;
  csv_storage_path: string | null;
  csv_row_count: number;
  csv_column_mapping: Record<string, string> | null;
  unit_price_ex_vat: number;
  setup_fee_ex_vat: number;
  discount_percent: number;
  subtotal_ex_vat: number;
  vat_rate: number;
  vat_amount: number;
  total_inc_vat: number;
  currency: string;
  is_paid: boolean;
  stage: PipelineStage;
  proof_approved: boolean;
  approved_proof_id: string | null;
  approved_at: string | null;
  production_folder_name: string | null;
  production_files_generated: boolean;
  production_manifest: Array<{
    rowIndex?: number;
    label: string;
    pdfPath: string;
    pngPath: string;
  }>;
  customer_notes: string | null;
  admin_notes: string | null;
  created_at: string;
}

export interface OrderProof {
  id: string;
  order_id: string;
  version_number: number;
  proof_file_path: string;
  preview_image_url: string;
  status: ProofStatus;
  admin_message: string | null;
  customer_feedback: string | null;
  created_at: string;
  reviewed_at: string | null;
}