import { SustainabilityMetrics } from './types';

export function calculateSustainabilityScore(data: {
  carbonFootprint: number;
  materialComposition: string;
  originCountry: string;
  isRecycled?: boolean;
}): number {
  let score = 100;

  // Carbon footprint penalty (max -40 points)
  // Assuming average product is ~10kg CO2
  const carbonPenalty = Math.min(40, (data.carbonFootprint / 10000) * 10);
  score -= carbonPenalty;

  // Material composition bonus
  const sustainableMaterials = [
    'organic',
    'recycled',
    'bamboo',
    'hemp',
    'cork',
    'sustainable',
    'bio',
    'eco'
  ];
  const materialLower = data.materialComposition.toLowerCase();
  const hasSustainableMaterial = sustainableMaterials.some(m =>
    materialLower.includes(m)
  );
  if (hasSustainableMaterial) {
    score += 15;
  }

  // Non-sustainable materials penalty
  const unsustainableMaterials = ['plastic', 'pvc', 'synthetic', 'polyester'];
  const hasUnsustainableMaterial = unsustainableMaterials.some(m =>
    materialLower.includes(m)
  );
  if (hasUnsustainableMaterial) {
    score -= 20;
  }

  // Local production bonus
  const localCountries = ['Portugal', 'Spain', 'Italy', 'Germany', 'France'];
  if (localCountries.includes(data.originCountry)) {
    score += 5;
  }

  // Recycled status bonus
  if (data.isRecycled) {
    score += 10;
  }

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getSustainabilityMetrics(score: number): SustainabilityMetrics {
  if (score >= 90) {
    return {
      score,
      grade: 'A+',
      color: 'text-green-600',
      message: 'Outstanding environmental performance'
    };
  } else if (score >= 80) {
    return {
      score,
      grade: 'A',
      color: 'text-green-500',
      message: 'Excellent sustainability practices'
    };
  } else if (score >= 70) {
    return {
      score,
      grade: 'B',
      color: 'text-blue-500',
      message: 'Good environmental standards'
    };
  } else if (score >= 60) {
    return {
      score,
      grade: 'C',
      color: 'text-yellow-500',
      message: 'Moderate environmental impact'
    };
  } else if (score >= 50) {
    return {
      score,
      grade: 'D',
      color: 'text-orange-500',
      message: 'Needs environmental improvement'
    };
  } else {
    return {
      score,
      grade: 'F',
      color: 'text-red-500',
      message: 'Poor environmental performance'
    };
  }
}

export function formatCO2(grams: number | bigint): string {
  const g = typeof grams === 'bigint' ? Number(grams) : grams;

  if (g >= 1000000) {
    return `${(g / 1000000).toFixed(2)} tons`;
  } else if (g >= 1000) {
    return `${(g / 1000).toFixed(2)} kg`;
  } else {
    return `${g} g`;
  }
}

export function formatDate(timestamp: bigint | number): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function generateQRCodeURL(tokenId: number | string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/product/${tokenId}`;
}
