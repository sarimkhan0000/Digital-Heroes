'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Eye,
  ImagePlus,
  Layers,
  Move,
  RotateCw,
  Trash2,
  Type,
} from 'lucide-react';
import { ProductDivision } from '@/types/database';

export interface CanvasElement {
  id: string;
  type: 'text' | 'image';
  content: string; // Text string or DataURL image
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  rotationDeg: number;
  fontSizePt: number;
  fontFamily: string;
  color: string;
  fontWeight: 'normal' | 'bold';
  laserRole?: 'ENGRAVE' | 'CUT';
}

export interface CanvasDesignPayload {
  backgroundColor: string;
  elements: CanvasElement[];
  previewDataUrl?: string;
}

interface PrintCanvasEditorProps {
  division: ProductDivision;
  widthMm: number;
  heightMm: number;
  csvPreviewRow?: Record<string, string> | null;
  onChange: (payload: CanvasDesignPayload) => void;
}

export function PrintCanvasEditor({
  division,
  widthMm,
  heightMm,
  csvPreviewRow,
  onChange,
}: PrintCanvasEditorProps) {
  const safeInset = Number(division.safe_margin_mm);
  const bleed = Number(division.bleed_mm);

  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [proofPreviewMode, setProofPreviewMode] = useState<boolean>(false);
  const [elements, setElements] = useState<CanvasElement[]>(() => {
    const initialW = Math.max(20, widthMm - safeInset * 2 - 10);
    return [
      {
        id: 'el-primary',
        type: 'text',
        content: division.supports_csv_merge ? '{{NUMBER}}' : 'DIGITAL HEROES',
        xMm: safeInset + 5,
        yMm: Math.max(safeInset + 4, heightMm * 0.28),
        widthMm: initialW,
        heightMm: 18,
        rotationDeg: 0,
        fontSizePt: division.supports_csv_merge ? 36 : 20,
        fontFamily: 'Space Grotesk',
        color: '#141413',
        fontWeight: 'bold',
        laserRole: 'ENGRAVE',
      },
      ...(division.supports_csv_merge
        ? [
            {
              id: 'el-secondary',
              type: 'text' as const,
              content: '{{NAME}}',
              xMm: safeInset + 5,
              yMm: Math.max(safeInset + 24, heightMm * 0.62),
              widthMm: initialW,
              heightMm: 12,
              rotationDeg: 0,
              fontSizePt: 14,
              fontFamily: 'JetBrains Mono',
              color: '#E85D04',
              fontWeight: 'bold' as const,
              laserRole: 'ENGRAVE' as const,
            },
          ]
        : []),
    ];
  });

  const [selectedId, setSelectedId] = useState<string>('el-primary');
  const draggingRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    origXMm: number;
    origYMm: number;
  } | null>(null);

  // Clamp element strictly inside printable safe zone
  const clampElement = (el: CanvasElement): CanvasElement => {
    const minX = safeInset;
    const minY = safeInset;
    const maxW = Math.max(8, widthMm - safeInset * 2);
    const maxH = Math.max(6, heightMm - safeInset * 2);

    const clampedW = Math.min(Math.max(8, el.widthMm), maxW);
    const clampedH = Math.min(Math.max(6, el.heightMm), maxH);
    const clampedX = Math.min(Math.max(minX, el.xMm), widthMm - safeInset - clampedW);
    const clampedY = Math.min(Math.max(minY, el.yMm), heightMm - safeInset - clampedH);

    return {
      ...el,
      xMm: Math.round(clampedX * 10) / 10,
      yMm: Math.round(clampedY * 10) / 10,
      widthMm: Math.round(clampedW * 10) / 10,
      heightMm: Math.round(clampedH * 10) / 10,
    };
  };

  // Re-clamp all elements whenever user resizes product dimensions
  useEffect(() => {
    setElements((prev) => prev.map(clampElement));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widthMm, heightMm, safeInset]);

  // Notify parent of serialized design state
  useEffect(() => {
    onChange({
      backgroundColor: division.monochrome_preview ? '#FFFFFF' : bgColor,
      elements,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgColor, elements, division.monochrome_preview]);

  const selectedElement = elements.find((el) => el.id === selectedId) ?? null;

  const updateElement = (id: string, patch: Partial<CanvasElement>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? clampElement({ ...el, ...patch }) : el))
    );
  };

  const addTextLayer = () => {
    const newId = `text-${Date.now()}`;
    const newEl = clampElement({
      id: newId,
      type: 'text',
      content: 'CUSTOM SPEC TEXT',
      xMm: safeInset + 4,
      yMm: safeInset + 4,
      widthMm: Math.min(60, widthMm - safeInset * 2),
      heightMm: 12,
      rotationDeg: 0,
      fontSizePt: 14,
      fontFamily: 'Inter',
      color: '#141413',
      fontWeight: 'bold',
      laserRole: 'ENGRAVE',
    });
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newId);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const newId = `img-${Date.now()}`;
      const newEl = clampElement({
        id: newId,
        type: 'image',
        content: reader.result as string,
        xMm: safeInset + 4,
        yMm: safeInset + 4,
        widthMm: Math.min(35, widthMm - safeInset * 2),
        heightMm: Math.min(35, heightMm - safeInset * 2),
        rotationDeg: 0,
        fontSizePt: 12,
        fontFamily: 'Inter',
        color: '#141413',
        fontWeight: 'normal',
      });
      setElements((prev) => [...prev, newEl]);
      setSelectedId(newId);
    };
    reader.readAsDataURL(file);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setElements((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId('');
  };

  // Scale canvas preview cleanly to fit container (max 520px width, max 380px height)
  const scalePxPerMm = Math.min(500 / Math.max(widthMm, 1), 360 / Math.max(heightMm, 1));
  const stageWidthPx = Math.round(widthMm * scalePxPerMm);
  const stageHeightPx = Math.round(heightMm * scalePxPerMm);
  const bleedPx = Math.round(bleed * scalePxPerMm);
  const safePx = Math.round(safeInset * scalePxPerMm);

  const handlePointerDown = (e: React.PointerEvent, el: CanvasElement) => {
    if (proofPreviewMode) return;
    e.stopPropagation();
    setSelectedId(el.id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    draggingRef.current = {
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      origXMm: el.xMm,
      origYMm: el.yMm,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dxMm = (e.clientX - draggingRef.current.startX) / scalePxPerMm;
    const dyMm = (e.clientY - draggingRef.current.startY) / scalePxPerMm;
    updateElement(draggingRef.current.id, {
      xMm: draggingRef.current.origXMm + dxMm,
      yMm: draggingRef.current.origYMm + dyMm,
    });
  };

  const handlePointerUp = () => {
    draggingRef.current = null;
  };

  const resolveDisplayText = (raw: string) => {
    if (!csvPreviewRow) return raw;
    return raw.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const matchedKey = Object.keys(csvPreviewRow).find(
        (k) => k.toLowerCase() === key.toLowerCase()
      );
      return matchedKey ? csvPreviewRow[matchedKey] : `{{${key}}}`;
    });
  };

  return (
    <div className="border border-[#141413] bg-white">
      {/* Top Designer Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141413] bg-[#F5F4F0] px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={addTextLayer}
            disabled={proofPreviewMode}
            className="inline-flex items-center gap-1.5 border border-[#141413] bg-white px-3 py-1.5 text-xs font-semibold hover:bg-[#141413] hover:text-white disabled:opacity-40 transition-colors"
          >
            <Type className="h-3.5 w-3.5"/>
            Add Text
          </button>

          <label className="inline-flex cursor-pointer items-center gap-1.5 border border-[#141413] bg-white px-3 py-1.5 text-xs font-semibold hover:bg-[#141413] hover:text-white transition-colors">
            <ImagePlus className="h-3.5 w-3.5"/>
            Upload Logo
            <input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoUpload} className="hidden" />
          </label>

          {!division.monochrome_preview && (
            <label className="inline-flex items-center gap-1.5 border border-[#141413]/25 bg-white px-2.5 py-1 text-xs font-mono">
              <span>Stock BG:</span>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-5 w-6 cursor-pointer border-0 bg-transparent"
              />
            </label>
          )}
        </div>

        <button
          type="button"
          onClick={() => setProofPreviewMode((p) => !p)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 font-mono text-xs font-bold transition-colors ${
            proofPreviewMode
              ? 'bg-[#E85D04] text-white'
              : 'border border-[#141413] bg-[#141413] text-white hover:bg-[#E85D04] hover:border-[#E85D04]'
          }`}
        >
          <Eye className="h-3.5 w-3.5"/>
          {proofPreviewMode ? 'Exit Proof Preview' : 'Real-Time Proof Preview'}
        </button>
      </div>

      {/* Interactive Artboard Stage */}
      <div
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="paper-surface relative flex min-h-[430px] flex-col items-center justify-center overflow-hidden p-8 select-none"
      >
        {/* Dimension Header Readout */}
        <div className="mb-4 flex items-center gap-4 font-mono text-[11px] text-[#141413]/70">
          <span>
            TRIM: <strong>{widthMm} × {heightMm} mm</strong>
          </span>
          {bleed > 0 && (
            <span className="text-[#E85D04]">BLEED: +{bleed}mm</span>
          )}
          <span>SAFE INSET: {safeInset}mm</span>
        </div>

        {/* Outer Bleed Boundary */}
        <div
          style={{
            padding: proofPreviewMode ? 0 : `${bleedPx}px`,
            backgroundColor: division.monochrome_preview ? '#FFFFFF' : bgColor,
          }}
          className={`relative transition-all ${
            proofPreviewMode
              ? 'shadow-xl ring-1 ring-[#141413]/20'
              : bleed > 0
              ? 'border border-dashed border-[#E85D04]'
              : ''
          }`}
        >
          {/* Trim Boundary */}
          <div
            style={{
              width: `${stageWidthPx}px`,
              height: `${stageHeightPx}px`,
              filter: division.monochrome_preview ? 'grayscale(100%) contrast(250%)' : 'none',
            }}
            className={`relative overflow-hidden ${
              proofPreviewMode ? '' : 'border border-[#141413]'
            }`}
          >
            {/* Safe-Zone Bounding Box Guide */}
            {!proofPreviewMode && (
              <div
                style={{
                  top: `${safePx}px`,
                  left: `${safePx}px`,
                  right: `${safePx}px`,
                  bottom: `${safePx}px`,
                }}
                className={`pointer-events-none absolute border border-dashed ${
                  division.layer_mode === 'ENGRAVE_BOX'
                    ? 'border-[#E85D04] bg-[#E85D04]/5'
                    : 'border-[#141413]/40'
                }`}
              >
                <span className="absolute -top-3.5 left-1 font-mono text-[8px] uppercase text-[#141413]/50">
                  {division.layer_mode === 'ENGRAVE_BOX'
                    ? 'Locked Engraving Box'
                    : division.layer_mode === 'CONTOUR'
                    ? 'MTB Contour Safe Zone'
                    : 'Clamped Safe Zone'}
                </span>
              </div>
            )}

            {/* Division-Specific Contour Overlay (MTB Boards) */}
            {division.layer_mode === 'CONTOUR' && !proofPreviewMode && (
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polygon
                  points="8,4 92,4 98,50 78,96 22,96 2,50"
                  fill="none"
                  stroke="#E85D04"
                  strokeWidth="0.8"
                  strokeDasharray="2 1"
                />
              </svg>
            )}

            {/* Draggable Clamped Elements */}
            {elements.map((el) => {
              const isSelected = el.id === selectedId && !proofPreviewMode;
              const effectiveColor =
                division.monochrome_preview
                  ? '#141413'
                  : division.layer_mode === 'CUT_ENGRAVE'
                  ? el.laserRole === 'CUT'
                    ? '#DC2626'
                    : '#141413'
                  : el.color;

              return (
                <div
                  key={el.id}
                  onPointerDown={(e) => handlePointerDown(e, el)}
                  style={{
                    position: 'absolute',
                    left: `${el.xMm * scalePxPerMm}px`,
                    top: `${el.yMm * scalePxPerMm}px`,
                    width: `${el.widthMm * scalePxPerMm}px`,
                    height: `${el.heightMm * scalePxPerMm}px`,
                    transform: `rotate(${el.rotationDeg}deg)`,
                    cursor: proofPreviewMode ? 'default' : 'grab',
                  }}
                  className={`flex items-center justify-center ${
                    isSelected ? 'ring-1 ring-[#E85D04] bg-[#E85D04]/5' : ''
                  }`}
                >
                  {el.type === 'text' ? (
                    <span
                      style={{
                        fontSize: `${Math.max(8, el.fontSizePt * 0.3527 * scalePxPerMm)}px`,
                        fontFamily: el.fontFamily,
                        color: effectiveColor,
                        fontWeight: el.fontWeight,
                        lineHeight: 1.1,
                      }}
                      className="w-full truncate text-center"
                    >
                      {resolveDisplayText(el.content)}
                    </span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={el.content}
                      alt="Uploaded design graphic"
                      className="h-full w-full object-contain pointer-events-none"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mode Legend Footer */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 font-mono text-[10px] text-[#141413]/65">
          {division.monochrome_preview && (
            <span className="font-bold text-[#141413]">
              • 600 DPI 1-Bit Monochrome Ink Simulation Active
            </span>
          )}
          {division.layer_mode === 'CUT_ENGRAVE' && (
            <span className="font-bold text-[#DC2626]">
              • Laser Layer Mode: Red (#DC2626) = Vector Cut | Black = Raster Engrave
            </span>
          )}
          {!proofPreviewMode && (
            <span className="inline-flex items-center gap-1">
              <Move className="h-3 w-3"/> Drag elements inside safe zone (auto-clamped)
            </span>
          )}
        </div>
      </div>

      {/* Selected Element Inspector Panel */}
      {selectedElement && !proofPreviewMode && (
        <div className="border-t border-[#141413] bg-[#F5F4F0] p-4">
          <div className="flex items-center justify-between pb-3">
            <span className="font-mono text-xs font-bold uppercase">
              Element Inspector ({selectedElement.type})
            </span>
            <button
              type="button"
              onClick={deleteSelected}
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5"/>
              Remove
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            {selectedElement.type === 'text' && (
              <>
                <div className="sm:col-span-2">
                  <label className="block font-mono text-[10px] uppercase text-[#141413]/65">
                    Text Content {division.supports_csv_merge && '(Use {{COLUMN}} for CSV)'}
                  </label>
                  <input
                    type="text"
                    value={selectedElement.content}
                    onChange={(e) =>
                      updateElement(selectedElement.id, { content: e.target.value })
                    }
                    className="mt-1 w-full border border-[#141413]/25 bg-white px-2.5 py-1.5 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#141413]/65">
                    Font Size (pt)
                  </label>
                  <input
                    type="number"
                    min={6}
                    max={120}
                    value={selectedElement.fontSizePt}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        fontSizePt: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full border border-[#141413]/25 bg-white px-2.5 py-1.5 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#141413]/65">
                    {division.layer_mode === 'CUT_ENGRAVE' ? 'Laser Layer' : 'Ink Color'}
                  </label>
                  {division.layer_mode === 'CUT_ENGRAVE' ? (
                    <select
                      value={selectedElement.laserRole ?? 'ENGRAVE'}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          laserRole: e.target.value as 'ENGRAVE' | 'CUT',
                        })
                      }
                      className="mt-1 w-full border border-[#141413]/25 bg-white px-2 py-1.5 font-mono text-xs"
                    >
                      <option value="ENGRAVE">Raster Engrave (Black)</option>
                      <option value="CUT">Vector Cut (Red)</option>
                    </select>
                  ) : (
                    <input
                      type="color"
                      disabled={division.monochrome_preview}
                      value={selectedElement.color}
                      onChange={(e) =>
                        updateElement(selectedElement.id, { color: e.target.value })
                      }
                      className="mt-1 h-8 w-full cursor-pointer border border-[#141413]/25 bg-white"
                    />
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block font-mono text-[10px] uppercase text-[#141413]/65">
                Box Width (mm)
              </label>
              <input
                type="number"
                value={selectedElement.widthMm}
                onChange={(e) =>
                  updateElement(selectedElement.id, { widthMm: Number(e.target.value) })
                }
                className="mt-1 w-full border border-[#141413]/25 bg-white px-2.5 py-1.5 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-[#141413]/65">
                Box Height (mm)
              </label>
              <input
                type="number"
                value={selectedElement.heightMm}
                onChange={(e) =>
                  updateElement(selectedElement.id, { heightMm: Number(e.target.value) })
                }
                className="mt-1 w-full border border-[#141413]/25 bg-white px-2.5 py-1.5 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-[#141413]/65">
                Rotation (deg)
              </label>
              <div className="mt-1 flex items-center gap-1.5">
                <RotateCw className="h-3.5 w-3.5 text-[#141413]/60"/>
                <input
                  type="number"
                  min={-180}
                  max={180}
                  value={selectedElement.rotationDeg}
                  onChange={(e) =>
                    updateElement(selectedElement.id, {
                      rotationDeg: Number(e.target.value),
                    })
                  }
                  className="w-full border border-[#141413]/25 bg-white px-2.5 py-1.5 font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-end">
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#141413]/65">
                <Layers className="h-3 w-3 text-[#E85D04]"/>
                Pos: {selectedElement.xMm}, {selectedElement.yMm}mm
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}