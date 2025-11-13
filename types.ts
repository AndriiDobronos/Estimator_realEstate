
export interface PropertyDetails {
  type: string;
  location: string;
  area: number;
  rooms: number;
  condition: string;
  description: string;
}

export interface EstimationResult {
  estimated_price_uah: number;
  price_range_uah: string;
  justification: string;
}
