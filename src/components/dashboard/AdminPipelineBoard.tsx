'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Cpu,
  Download,
  FilePlus2,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { OrderRecord, PipelineStage } from '@/types/database';

const PIPELINE_STAGES: PipelineStage[] = [
  'QUOTE',
  'ORDER',
  'ARTWORK',
  'PROOF',
  'PRODUCTION',
  'COMPLETED',
];

export function AdminPipelineBoard({ orders }: { orders: OrderRecord[] }) {
  const router = useRouter();
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [proofNote, setProofNote] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);

  const runAdminAction = async (payload: Record<string, unknown>, orderId: string) => {
    setBusyOrderId(orderId);
    setBanner(null);
    try {
      const res = await fetch('/api/production/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Operation failed');

      if (data.result) {
        setBanner(
          `Generated ${data.result.filesCount} press-ready file(s) in folder: ${data.result.folderName}`
        );
      } else {
        setBanner('Pipeline updated successfully.');
      }
      router.refresh();
    } catch (err: unknown) {
      setBanner(err instanceof Error ? err.message : 'Admin error');
    } finally {
      setBusyOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      {banner && (
        <div className="border border-[#141413] bg-[#141413] px-4 py-3 font-mono text-xs text-white">
          {banner}
        </div>
      )}

      {/* Stage Summary Counters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
        {PIPELINE_STAGES.map((stage) => {
          const count = orders.filter((o) => o.stage === stage).length;
          return (
            <div key={stage} className="border border-[#141413] bg-white p-3.5">
              <span className="font-mono text-[10px] font-bold text-[#141413]/55">
                {stage}
              </span>
              <p className="mt-1 font-heading text-2xl font-bold">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Full Job Queue */}
      <div className="space-y-4">
        {orders.map((order) => {
          const isBusy = busyOrderId === order.id;
          return (
            <div key={order.id} className="border border-[#141413] bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#141413]/15 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-bold">
                      {order.order_number}
                    </span>
                    <span className="bg-[#141413] px-2.5 py-0.5 font-mono text-[11px] font-bold text-white">
                      {order.stage}
                    </span>
                    {order.proof_approved ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-800 px-2.5 py-0.5 font-mono text-[11px] font-bold text-white">
                        <CheckCircle2 className="h-3 w-3" />
                        PROOF APPROVED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-[#E85D04] px-2.5 py-0.5 font-mono text-[11px] font-bold text-white">
                        <Lock className="h-3 w-3" />
                        PROOF LOCKED
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 font-mono text-xs text-[#141413]/75">
                    {order.division_slug} • {order.material_name} • {order.width_mm}×
                    {order.height_mm}mm • Qty: {order.quantity}
                    {order.csv_row_count > 0 && ` (${order.csv_row_count} CSV rows)`}
                  </p>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span>Move Stage:</span>
                  <select
                    value={order.stage}
                    disabled={isBusy}
                    onChange={(e) =>
                      runAdminAction(
                        { action: 'UPDATE_STAGE', stage: e.target.value },
                        order.id
                      )
                    }
                    className="border border-[#141413] bg-[#F5F4F0] px-2.5 py-1.5 font-bold"
                  >
                    {PIPELINE_STAGES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Studio Controls: Upload Proof Revision & Generate Press Files */}
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
                <div className="flex flex-col gap-2 sm:flex-row lg:col-span-7">
                  <input
                    type="text"
                    value={proofNote[order.id] ?? ''}
                    onChange={(e) =>
                      setProofNote((prev) => ({ ...prev, [order.id]: e.target.value }))
                    }
                    placeholder="Pre-press note for next proof version (e.g. Adjusted bleed & tracking)..."
                    className="flex-1 border border-[#141413]/25 bg-[#F5F4F0] px-3 py-2 text-xs"
                  />
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() =>
                      runAdminAction(
                        {
                          action: 'UPLOAD_NEW_PROOF',
                          adminMessage: proofNote[order.id] || '',
                        },
                        order.id
                      )
                    }
                    className="inline-flex items-center justify-center gap-1.5 border border-[#141413] bg-white px-4 py-2 font-mono text-xs font-bold hover:bg-[#141413] hover:text-white transition-colors"
                  >
                    <FilePlus2 className="h-3.5 w-3.5 text-[#E85D04]" />
                    Issue Next Proof
                  </button>
                </div>

                <div className="flex items-center justify-end gap-3 lg:col-span-5">
                  <button
                    type="button"
                    disabled={!order.proof_approved || isBusy}
                    onClick={() =>
                      runAdminAction({ action: 'GENERATE_FILES' }, order.id)
                    }
                    className="inline-flex items-center gap-2 bg-[#E85D04] px-4 py-2 font-mono text-xs font-bold text-white hover:bg-[#cf5102] disabled:cursor-not-allowed disabled:bg-[#141413]/25 transition-colors"
                  >
                    {isBusy ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Cpu className="h-3.5 w-3.5" />
                    )}
                    {order.proof_approved
                      ? 'Generate 300/600 DPI Print Files'
                      : 'Locked Until Proof Sign-Off'}
                  </button>
                </div>
              </div>

              {/* Production Manifest Output */}
              {order.production_files_generated && order.production_manifest?.length > 0 && (
                <div className="mt-4 border-t border-[#141413]/15 bg-[#F5F4F0] p-3.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900">
                      <Download className="mr-1.5 inline h-3.5 w-3.5" />
                      Production Folder Ready: {order.production_folder_name} (
                      {order.production_manifest.length} file sets)
                    </span>
                    <span className="text-[11px] text-[#141413]/65">
                      Stored in Supabase bucket: production-files
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}