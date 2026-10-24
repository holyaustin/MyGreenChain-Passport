export interface ProductData {
  productName: string;
  manufacturer: string;
  carbonFootprint: bigint;
  productionDate: bigint;
  sustainabilityScore: bigint;
  materialComposition: string;
  originCountry: string;
  isRecycled: boolean;
  recycledDate: bigint;
  currentOwner: string;
}

export interface LifecycleEvent {
  eventType: string;
  timestamp: bigint;
  location: string;
  additionalCO2: bigint;
  description: string;
}

export interface ProductFormData {
  productName: string;
  manufacturer: string;
  carbonFootprint: number;
  sustainabilityScore: number;
  materialComposition: string;
  originCountry: string;
  description?: string;
}

export interface SustainabilityMetrics {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  color: string;
  message: string;
}
