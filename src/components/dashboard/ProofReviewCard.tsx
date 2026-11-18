'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, FileWarning, Lock, ShieldCheck } from 'lucide-react';
import { OrderProof } from '@/types/database';

interface ProofReviewCardProps {
  orderId: string;
  orderNumber: string;
  proofs: OrderProof[];
  proofApproved: boolean;
}

export function ProofReviewCard({
  orderId,
  orderNumber,
  proofs,
  proofApproved,
}: ProofReviewCardProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestProof = proofs[0] ?? null;

  const handleDecision = async (decision: 'APPROVED' | 'CHANGES_REQUESTED') => {
    if (!latestProof) return;
    if (decision === 'CHANGES_REQUESTED' && !feedback.trim()) {
      setError('Please enter revision notes before requesting changes.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/proofs/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proofId: latestProof.id,
          orderId,
          decision,
          feedback: feedback.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to submit proof decision');

      setFeedback('');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Review error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-[#141413] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141413] bg-[#F5F4F0] px-6 py-4">
        <div>
          <h2 className="font-heading text-lg font-bold">
            Digital Proof Approval Gate — {orderNumber}
          </h2>
          <p className="text-xs text-[#141413]/70">
            Production files remain locked until you explicitly sign off the active proof version.
          </p>
        </div>

        {proofApproved ? (
          <span className="inline-flex items-center gap-1.5 bg-emerald-800 px-3 py-1 font-mono text-xs font-bold text-white">
            <ShieldCheck className="h-4 w-4" />
            APPROVED FOR PRESS
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 bg-[#E85D04] px-3 py-1 font-mono text-xs font-bold text-white">
            <Lock className="h-3.5 w-3.5" />
            AWAITING SIGN-OFF
          </span>
        )}
      </div>

      {latestProof ? (
        <div className="p-6">
          <div className="flex items-center justify-between font-mono text-xs pb-3">
            <span>
              Active Specimen: <strong>Proof v{latestProof.version_number}</strong>
            </span>
            <span className="uppercase font-bold text-[#E85D04]">
              Status: {latestProof.status}
            </span>
          </div>

          {/* Live Rendered Digital Proof Sheet */}
          <div className="border border-[#141413]/20 bg-[#F5F4F0] p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={latestProof.preview_image_url}
              alt={`Digital Proof v${latestProof.version_number}`}
              className="mx-auto max-h-[380px] w-auto border border-[#141413]/15 bg-white"
            />
          </div>

          {latestProof.admin_message && (
            <div className="mt-4 border-l-2 border-[#141413] bg-[#F5F4F0] px-4 py-2.5 text-xs">
              <span className="font-mono font-bold uppercase text-[#141413]/60">
                Studio Pre-Press Note:{' '}
              </span>
              <span>{latestProof.admin_message}</span>
            </div>
          )}

          {latestProof.status === 'PENDING' && (
            <div className="mt-6 border-t border-[#141413]/15 pt-5">
              <label className="block font-mono text-xs font-bold uppercase text-[#141413]/75">
                Sign-Off Notes or Requested Changes
              </label>
              <textarea
                rows={2}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Optional approval note, or mandatory instructions if requesting changes..."
                className="mt-1.5 w-full border border-[#141413]/25 bg-[#F5F4F0] p-3 text-xs focus:border-[#141413] focus:bg-white focus:outline-none"
              />

              {error && (
                <p className="mt-2 text-xs font-semibold text-red-700">{error}</p>
              )}

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDecision('APPROVED')}
                  className="flex flex-1 items-center justify-center gap-2 bg-emerald-800 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-900 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {submitting ? 'Unlocking Production...' : `Approve Proof v${latestProof.version_number} & Release to Print`}
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDecision('CHANGES_REQUESTED')}
                  className="flex items-center justify-center gap-2 border border-[#141413] bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#141413] hover:bg-[#141413] hover:text-white disabled:opacity-50 transition-colors"
                >
                  <FileWarning className="h-4 w-4 text-[#E85D04]" />
                  Request Changes
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-[#141413]/65">
          Pre-press team is preparing your digital proof v1.
        </div>
      )}
    </div>
  );
}