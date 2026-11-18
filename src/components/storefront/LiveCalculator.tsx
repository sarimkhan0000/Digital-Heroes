'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calculator, Check, RotateCw, ArrowRight } from 'lucide-react';
import { DivisionMaterial, ProductDivision } from '@/types/database';
import { calculateProductPrice } from '@/lib/pricing';

interface LiveCalculatorProps {
  divisions: ProductDivision[];
  materials: DivisionMaterial[];
}

export function LiveCalculator({ divisions, materials }: LiveCalculatorProps) {
  const router = useRouter();
  const [selectedSlug, setSelectedSlug] = useState<string>(divisions[0]?.slug ?? 'labels-stickers');

  const activeDivision = useMemo(
    () => divisions.find((d) => d.slug === selectedSlug) ?? divisions[0],
    [divisions, selectedSlug]
  );

  const divisionMaterials = useMemo(
    () => materials.filter((m) => m.division_id === activeDivision?.id),
    [materials, activeDivision]
  );

  const [materialId, setMaterialId] = useState<string>(divisionMaterials[0]?.id ?? '');
  const [widthMm, setWidthMm] = useState<number>(activeDivision?.default_width_mm ?? 80);
  const [heightMm, setHeightMm] = useState<number>(activeDivision?.default_height_mm ?? 50);
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [quantity, setQuantity] = useState<number>(100);

  const handleDivisionChange = (slug: string) => {
    setSelectedSlug(slug);
    const nextDiv = divisions.find((d) => d.slug === slug);
    if (nextDiv) {
      setWidthMm(nextDiv.default_width_mm);
      setHeightMm(nextDiv.default_height_mm);
      setOrientation(nextDiv.default_width_mm >= nextDiv.default_height_mm ? 'landscape' : 'portrait');
      setQuantity(Math.max(nextDiv.min_quantity, 100));
      const nextMats = materials.filter((m) => m.division_id === nextDiv.id);
      if (nextMats[0]) setMaterialId(nextMats[0].id);
    }
  };

  const handleSwapOrientation = () => {
    setWidthMm(heightMm);
    setHeightMm(widthMm);
    setOrientation((prev) => (prev === 'landscape' ? 'portrait' : 'landscape'));
  };

  const activeMaterial =
    divisionMaterials.find((m) => m.id === materialId) ?? divisionMaterials[0];

  const pricing = useMemo(() => {
    if (!activeDivision || !activeMaterial) return null;
    return calculateProductPrice({
      widthMm,
      heightMm,
      minWidthMm: Number(activeDivision.min_width_mm),
      maxWidthMm: Number(activeDivision.max_width_mm),
      minHeightMm: Number(activeDivision.min_height_mm),
      maxHeightMm: Number(activeDivision.max_height_mm),
      quantity,
      minQuantity: activeDivision.min_quantity,
      baseSetupFee: Number(activeDivision.base_setup_fee),
      baseRatePerSqCm: Number(activeDivision.base_rate_per_sq_cm),
      materialMultiplier: Number(activeMaterial.price_multiplier),
    });
  }, [activeDivision, activeMaterial, widthMm, heightMm, quantity]);

  const handleLaunchStudio = () => {
    if (!activeDivision) return;
    const matParam = activeMaterial ? `&m=${activeMaterial.id}` : '';
    router.push(`/configure/${activeDivision.slug}?w=${widthMm}&h=${heightMm}&q=${quantity}${matParam}`);
  };

  if (!activeDivision || !pricing) return null;

  return (
    <div className="border border-[#141413] bg-white p-6 sm:p-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#141413]/15 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center bg-[#141413] text-[#E85D04]">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight">
              Instant Parameter-Driven Quote Engine
            </h2>
            <p className="text-xs text-[#141413]/65">
              Zero SKU bloat — live area, material multiplier, volume tiers &amp; VAT telemetry
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left Controls */}
        <div className="space-y-6 lg:col-span-7">
          <div>
            <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#141413]/70">
              01 // Select Manufacturing Division
            </label>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {divisions.map((div) => (
                <button
                  key={div.id}
                  type="button"
                  onClick={() => handleDivisionChange(div.slug)}
                  className={`flex items-center justify-between border px-3.5 py-2.5 text-left text-xs font-bold transition-all ${
                    div.slug === selectedSlug
                      ? 'border-[#E85D04] bg-[#E85D04] text-white shadow-sm'
                      : 'border-[#141413]/15 bg-[#F5F4F0] text-[#141413] hover:border-[#141413]'
                  }`}
                >
                  <span className="truncate">{div.name}</span>
                  {div.slug === selectedSlug && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#141413]/70">
              02 // Substrate &amp; Stock Multiplier
            </label>
            <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {divisionMaterials.map((mat) => {
                const selected = mat.id === activeMaterial?.id;
                return (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => setMaterialId(mat.id)}
                    className={`border p-3.5 text-left transition-all ${
                      selected
                        ? 'border-[#141413] bg-[#141413] text-white'
                        : 'border-[#141413]/15 bg-[#F5F4F0] text-[#141413] hover:border-[#141413]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-[#E85D04]">
                        {mat.code}
                      </span>
                      <span className="bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold">
                        {Number(mat.price_multiplier).toFixed(2)}× RATE
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-bold">{mat.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-[#141413]/70">
                03 // Custom Trim Dimensions &amp; Batch Run
              </label>
              <button
                type="button"
                onClick={handleSwapOrientation}
                className="inline-flex items-center gap-1.5 border border-[#141413]/20 bg-[#F5F4F0] px-2.5 py-1 font-mono text-[11px] font-semibold hover:border-[#E85D04] hover:text-[#E85D04]"
              >
                <RotateCw className="h-3 w-3" />
                {orientation.toUpperCase()} (SWAP)
              </button>
            </div>

            <div className="mt-2.5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="border border-[#141413]/15 bg-[#F5F4F0] p-3">
                <label className="block font-mono text-[10px] font-bold uppercase text-[#141413]/60">
                  Trim Width (mm)
                </label>
                <input
                  type="number"
                  value={widthMm}
                  min={activeDivision.min_width_mm}
                  max={activeDivision.max_width_mm}
                  onChange={(e) => setWidthMm(Number(e.target.value))}
                  className="mt-1 w-full bg-transparent font-mono text-lg font-bold text-[#141413] focus:outline-none"
                />
              </div>

              <div className="border border-[#141413]/15 bg-[#F5F4F0] p-3">
                <label className="block font-mono text-[10px] font-bold uppercase text-[#141413]/60">
                  Trim Height (mm)
                </label>
                <input
                  type="number"
                  value={heightMm}
                  min={activeDivision.min_height_mm}
                  max={activeDivision.max_height_mm}
                  onChange={(e) => setHeightMm(Number(e.target.value))}
                  className="mt-1 w-full bg-transparent font-mono text-lg font-bold text-[#141413] focus:outline-none"
                />
              </div>

              <div className="border border-[#141413]/15 bg-[#F5F4F0] p-3">
                <label className="block font-mono text-[10px] font-bold uppercase text-[#141413]/60">
                  Batch Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  min={activeDivision.min_quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="mt-1 w-full bg-transparent font-mono text-lg font-bold text-[#141413] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Telemetry & Checkout Terminal */}
        <div className="flex flex-col justify-between bg-[#141413] p-6 sm:p-7 text-white lg:col-span-5">
          <div>
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                  CALIBRATED ESTIMATE
                </span>
                <p className="font-heading text-base font-bold text-white">
                  {activeDivision.name}
                </p>
              </div>
              <span className="bg-[#E85D04] px-2.5 py-1 font-mono text-xs font-bold text-white">
                {pricing.tierLabel}
              </span>
            </div>

            <dl className="mt-5 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between">
                <dt className="text-white/60">Net Subtotal (ex VAT):</dt>
                <dd className="font-bold">£{pricing.subtotalExVat.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/60">Standard VAT (20%):</dt>
                <dd>£{pricing.vatAmount.toFixed(2)}</dd>
              </div>
            </dl>

            <div className="mt-5 border border-white/10 bg-white/5 p-4">
              <div className="flex items-baseline justify-between">
                <span className="font-heading text-xs uppercase tracking-widest text-white/70">
                  Total Payable (inc. VAT)
                </span>
                <span className="font-mono text-3xl font-bold tracking-tight text-white">
                  £{pricing.totalIncVat.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLaunchStudio}
            className="mt-6 flex w-full items-center justify-center gap-2 bg-[#E85D04] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#d15203]"
          >
            Launch Web-to-Print Studio
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}