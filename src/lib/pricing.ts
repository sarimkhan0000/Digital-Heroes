export interface VolumeTier {
  minQuantity: number;
  discountPercent: number;
  label: string;
}

export const VOLUME_DISCOUNT_TIERS: VolumeTier[] = [
  { minQuantity: 1000, discountPercent: 40, label: '1,000+ units (40% OFF)' },
  { minQuantity: 500, discountPercent: 30, label: '500+ units (30% OFF)' },
  { minQuantity: 250, discountPercent: 22, label: '250+ units (22% OFF)' },
  { minQuantity: 100, discountPercent: 15, label: '100+ units (15% OFF)' },
  { minQuantity: 50, discountPercent: 8, label: '50+ units (8% OFF)' },
  { minQuantity: 1, discountPercent: 0, label: 'Standard Run' },
];

export interface PricingInput {
  widthMm: number;
  heightMm: number;
  minWidthMm: number;
  maxWidthMm: number;
  minHeightMm: number;
  maxHeightMm: number;
  quantity: number;
  minQuantity: number;
  baseSetupFee: number;
  baseRatePerSqCm: number;
  materialMultiplier: number;
  vatRate?: number;
}

export interface PricingBreakdown {
  isValid: boolean;
  validationErrors: string[];
  areaSqCm: number;
  rawUnitPriceExVat: number;
  discountPercent: number;
  tierLabel: string;
  discountedUnitPriceExVat: number;
  setupFeeExVat: number;
  subtotalExVat: number;
  vatRate: number;
  vatAmount: number;
  totalIncVat: number;
  effectiveUnitPriceIncVat: number;
  nextTierHint: {
    targetQuantity: number;
    discountPercent: number;
    additionalUnitsNeeded: number;
  } | null;
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundUnit(value: number): number {
  return Math.round((value + Number.EPSILON) * 10000) / 10000;
}

export function getVolumeTier(quantity: number): VolumeTier {
  const safeQty = Math.max(1, Math.floor(quantity));
  return (
    VOLUME_DISCOUNT_TIERS.find((tier) => safeQty >= tier.minQuantity) ??
    VOLUME_DISCOUNT_TIERS[VOLUME_DISCOUNT_TIERS.length - 1]
  );
}

export function calculateProductPrice(input: PricingInput): PricingBreakdown {
  const validationErrors: string[] = [];
  const vatRate = input.vatRate ?? 0.2;

  if (!Number.isFinite(input.widthMm) || input.widthMm < input.minWidthMm || input.widthMm > input.maxWidthMm) {
    validationErrors.push(`Width must be between ${input.minWidthMm}mm and ${input.maxWidthMm}mm.`);
  }
  if (!Number.isFinite(input.heightMm) || input.heightMm < input.minHeightMm || input.heightMm > input.maxHeightMm) {
    validationErrors.push(`Height must be between ${input.minHeightMm}mm and ${input.maxHeightMm}mm.`);
  }
  if (!Number.isInteger(input.quantity) || input.quantity < input.minQuantity) {
    validationErrors.push(`Minimum order quantity for this division is ${input.minQuantity} units.`);
  }

  const safeWidth = Math.max(1, input.widthMm || 0);
  const safeHeight = Math.max(1, input.heightMm || 0);
  const safeQty = Math.max(1, Math.floor(input.quantity || 1));

  const areaSqCm = Math.round(((safeWidth * safeHeight) / 100) * 100) / 100;
  const rawUnitPriceExVat = roundUnit(areaSqCm * input.baseRatePerSqCm * input.materialMultiplier);

  const currentTier = getVolumeTier(safeQty);
  const discountFactor = 1 - currentTier.discountPercent / 100;
  const discountedUnitPriceExVat = roundUnit(rawUnitPriceExVat * discountFactor);

  const setupFeeExVat = roundCurrency(input.baseSetupFee);
  const productionRunExVat = discountedUnitPriceExVat * safeQty;
  const subtotalExVat = roundCurrency(setupFeeExVat + productionRunExVat);
  const vatAmount = roundCurrency(subtotalExVat * vatRate);
  const totalIncVat = roundCurrency(subtotalExVat + vatAmount);
  const effectiveUnitPriceIncVat = roundUnit(totalIncVat / safeQty);

  const sortedAsc = [...VOLUME_DISCOUNT_TIERS].sort((a, b) => a.minQuantity - b.minQuantity);
  const nextTier = sortedAsc.find((t) => t.minQuantity > safeQty) ?? null;

  return {
    isValid: validationErrors.length === 0,
    validationErrors,
    areaSqCm,
    rawUnitPriceExVat,
    discountPercent: currentTier.discountPercent,
    tierLabel: currentTier.label,
    discountedUnitPriceExVat,
    setupFeeExVat,
    subtotalExVat,
    vatRate,
    vatAmount,
    totalIncVat,
    effectiveUnitPriceIncVat,
    nextTierHint: nextTier
      ? {
          targetQuantity: nextTier.minQuantity,
          discountPercent: nextTier.discountPercent,
          additionalUnitsNeeded: nextTier.minQuantity - safeQty,
        }
      : null,
  };
}