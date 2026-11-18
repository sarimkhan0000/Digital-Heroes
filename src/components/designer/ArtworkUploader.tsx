'use client';

import { useState } from 'react';
import { CheckCircle2, FileUp, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ArtworkUploaderProps {
  divisionSlug: string;
  uploadedPath: string | null;
  onUploaded: (storagePath: string, fileName: string) => void;
}

const ACCEPTED_EXTENSIONS = ['.pdf', '.svg', '.ai', '.png'];

export function ArtworkUploader({
  divisionSlug,
  uploadedPath,
  onUploaded,
}: ArtworkUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lower = file.name.toLowerCase();
    const isValid = ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
    if (!isValid) {
      setError('Unsupported format. Please upload PDF, SVG, AI, or high-res PNG.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Please sign in first to upload production artwork.');
        setUploading(false);
        return;
      }

      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${user.id}/${divisionSlug}/${Date.now()}_${cleanName}`;

      const { error: uploadError } = await supabase.storage
        .from('customer-artwork')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      setFileName(file.name);
      onUploaded(path, file.name);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-[#141413] bg-white p-8">
      <div className="border border-dashed border-[#141413]/40 bg-[#F5F4F0] p-10 text-center">
        <FileUp className="mx-auto h-9 w-9 text-[#E85D04]"/>
        <h3 className="mt-3 font-heading text-lg font-bold">
          Upload Print-Ready Artwork
        </h3>
        <p className="mx-auto mt-1 max-w-md text-xs text-[#141413]/70">
          Accepted formats: <strong>PDF, SVG, AI, PNG</strong> (300–600 DPI recommended, fonts outlined, bleed included).
        </p>

        <label className="mt-5 inline-flex cursor-pointer items-center gap-2 bg-[#141413] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#E85D04] transition-colors">
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin"/>
              Uploading to Vault...
            </>
          ) : (
            <span>Select Artwork File</span>
          )}
          <input
            type="file"
            accept=".pdf,.svg,.ai,.png,application/pdf,image/svg+xml,image/png"
            onChange={handleFile}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {uploadedPath && (
          <div className="mt-5 inline-flex items-center gap-2 border border-emerald-700 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-700"/>
            <span>Attached: {fileName ?? uploadedPath.split('/').pop()}</span>
          </div>
        )}

        {error && (
          <p className="mt-4 text-xs font-semibold text-red-700">{error}</p>
        )}
      </div>
    </div>
  );
}