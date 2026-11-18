export interface PlaceholderBoxRule {
  fieldKey: string;
  boxWidthMm: number;
  boxHeightMm: number;
  maxFontSizePt: number;
  minFontSizePt: number;
  defaultTrackingEm: number;
  minTrackingEm: number;
  fontWeight?: 'normal' | 'bold';
  uppercase?: boolean;
}

export interface FittedTextResult {
  text: string;
  fittedFontSizePt: number;
  fittedTrackingEm: number;
  estimatedWidthMm: number;
  estimatedHeightMm: number;
  wasScaledDown: boolean;
  wasTruncated: boolean;
}

const PT_TO_MM = 0.352778;

function estimateGlyphWidthRatio(char: string, isBold: boolean): number {
  const boldBoost = isBold ? 1.06 : 1.0;
  if (char === ' ') return 0.30 * boldBoost;
  if ('iIl1!|.,:;'.includes(char)) return 0.32 * boldBoost;
  if ('fjt()[]-'.includes(char)) return 0.38 * boldBoost;
  if ('WMQ@#%&'.includes(char)) return 0.86 * boldBoost;
  if (char >= 'A' && char <= 'Z') return 0.68 * boldBoost;
  if (char >= '0' && char <= '9') return 0.60 * boldBoost;
  return 0.56 * boldBoost;
}

export function measureTextWidthMm(
  text: string,
  fontSizePt: number,
  trackingEm: number,
  isBold: boolean
): number {
  if (!text) return 0;
  const fontSizeMm = fontSizePt * PT_TO_MM;
  let totalEm = 0;

  for (let i = 0; i < text.length; i++) {
    totalEm += estimateGlyphWidthRatio(text[i], isBold);
    if (i < text.length - 1) {
      totalEm += trackingEm;
    }
  }

  return totalEm * fontSizeMm;
}

export function fitVariableTextToBox(
  rawText: string,
  rule: PlaceholderBoxRule
): FittedTextResult {
  const normalized = (rawText ?? '').trim();
  const formattedText = rule.uppercase ? normalized.toUpperCase() : normalized;

  if (!formattedText) {
    return {
      text: '',
      fittedFontSizePt: rule.maxFontSizePt,
      fittedTrackingEm: rule.defaultTrackingEm,
      estimatedWidthMm: 0,
      estimatedHeightMm: 0,
      wasScaledDown: false,
      wasTruncated: false,
    };
  }

  const isBold = rule.fontWeight === 'bold';
  const heightCeilingPt = (rule.boxHeightMm / 1.15) / PT_TO_MM;
  const effectiveMaxPt = Math.max(
    rule.minFontSizePt,
    Math.min(rule.maxFontSizePt, Math.floor(heightCeilingPt * 10) / 10)
  );

  const widthAtDefault = measureTextWidthMm(
    formattedText,
    effectiveMaxPt,
    rule.defaultTrackingEm,
    isBold
  );

  if (widthAtDefault <= rule.boxWidthMm) {
    return {
      text: formattedText,
      fittedFontSizePt: effectiveMaxPt,
      fittedTrackingEm: rule.defaultTrackingEm,
      estimatedWidthMm: Math.round(widthAtDefault * 100) / 100,
      estimatedHeightMm: Math.round(effectiveMaxPt * PT_TO_MM * 100) / 100,
      wasScaledDown: effectiveMaxPt < rule.maxFontSizePt,
      wasTruncated: false,
    };
  }

  const widthAtMinTracking = measureTextWidthMm(
    formattedText,
    effectiveMaxPt,
    rule.minTrackingEm,
    isBold
  );

  if (widthAtMinTracking <= rule.boxWidthMm && formattedText.length > 1) {
    const ratio = (rule.boxWidthMm - widthAtMinTracking) / (widthAtDefault - widthAtMinTracking);
    const interpolatedTracking =
      Math.round((rule.minTrackingEm + ratio * (rule.defaultTrackingEm - rule.minTrackingEm)) * 1000) / 1000;

    return {
      text: formattedText,
      fittedFontSizePt: effectiveMaxPt,
      fittedTrackingEm: interpolatedTracking,
      estimatedWidthMm: Math.round(
        measureTextWidthMm(formattedText, effectiveMaxPt, interpolatedTracking, isBold) * 100
      ) / 100,
      estimatedHeightMm: Math.round(effectiveMaxPt * PT_TO_MM * 100) / 100,
      wasScaledDown: false,
      wasTruncated: false,
    };
  }

  const scaleFactor = rule.boxWidthMm / widthAtMinTracking;
  const candidatePt = Math.floor(effectiveMaxPt * scaleFactor * 10) / 10;

  if (candidatePt >= rule.minFontSizePt) {
    const finalWidth = measureTextWidthMm(formattedText, candidatePt, rule.minTrackingEm, isBold);
    return {
      text: formattedText,
      fittedFontSizePt: candidatePt,
      fittedTrackingEm: rule.minTrackingEm,
      estimatedWidthMm: Math.round(finalWidth * 100) / 100,
      estimatedHeightMm: Math.round(candidatePt * PT_TO_MM * 100) / 100,
      wasScaledDown: true,
      wasTruncated: false,
    };
  }

  let clipped = formattedText;
  while (
    clipped.length > 1 &&
    measureTextWidthMm(`${clipped}…`, rule.minFontSizePt, rule.minTrackingEm, isBold) > rule.boxWidthMm
  ) {
    clipped = clipped.slice(0, -1);
  }
  const finalString = `${clipped}…`;

  return {
    text: finalString,
    fittedFontSizePt: rule.minFontSizePt,
    fittedTrackingEm: rule.minTrackingEm,
    estimatedWidthMm: Math.round(
      measureTextWidthMm(finalString, rule.minFontSizePt, rule.minTrackingEm, isBold) * 100
    ) / 100,
    estimatedHeightMm: Math.round(rule.minFontSizePt * PT_TO_MM * 100) / 100,
    wasScaledDown: true,
    wasTruncated: true,
  };
}