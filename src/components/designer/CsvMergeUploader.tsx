'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface CsvMergeUploaderProps {
  divisionSlug: string;
  onCsvParsed: (payload: {
    storagePath: string;
    headers: string[];
    rows: Record<string, string>[];
    previewRow: Record<string, string> | null;
  }) => void;
}

export function CsvMergeUploader({ divisionSlug, onCsvParsed }: CsvMergeUploaderProps) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [previewIdx, setPreviewIdx] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    try {
      const csvText = await file.text();
      const results = Papa.parse<Record<string, string>>(csvText, {
        header: true,
        skipEmptyLines: true,
      });

      const parsedRows = results.data ?? [];
      const parsedHeaders = results.meta.fields ?? [];

      if (parsedRows.length === 0 || parsedHeaders.length === 0) {
        setError('CSV file appears empty or missing column headers.');
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let storagePath = `inline/${Date.now()}_${file.name}`;
      if (user) {
        const uploadPath = `${user.id}/${divisionSlug}/csv_${Date.now()}_${file.name}`;
        const { error: uploadErr } = await supabase.storage
          .from('customer-artwork')
          .upload(uploadPath, file, { upsert: true });
        if (!uploadErr) storagePath = uploadPath;
      }

      setHeaders(parsedHeaders);
      setRows(parsedRows);
      setPreviewIdx(0);
      onCsvParsed({
        storagePath,
        headers: parsedHeaders,
        rows: parsedRows,
        previewRow: parsedRows[0] ?? null,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV');
    }
  };

  return (
    <div className="border border-[#141413] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FileSpreadsheet className="h-5 w-5 text-[#E85D04]" />
          <div>
            <h4 className="font-heading text-sm font-bold">
              Variable-Data CSV Roster Merge
            </h4>
            <p className="text-xs text-[#141413]/65">
              Upload athlete/participant CSV (e.g. columns: <code className="font-mono">NUMBER, NAME</code>). Each row generates a fitted print file.
            </p>
          </div>
        </div>

        <label className="cursor-pointer border border-[#141413] bg-[#F5F4F0] px-3.5 py-2 font-mono text-xs font-bold hover:bg-[#141413] hover:text-white transition-colors">
          Upload .CSV
          <input type="file" accept=".csv,text/csv" onChange={handleCsvUpload} className="hidden" />
        </label>
      </div>

      {rows.length > 0 && (
        <div className="mt-4 border-t border-[#141413]/15 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
              {rows.length} records loaded • Placeholders:{' '}
              {headers.map((h) => `{{${h}}}`).join(', ')}
            </span>

            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span>Preview Row:</span>
              <select
                value={previewIdx}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setPreviewIdx(idx);
                  onCsvParsed({
                    storagePath: '',
                    headers,
                    rows,
                    previewRow: rows[idx] ?? null,
                  });
                }}
                className="border border-[#141413]/25 bg-[#F5F4F0] px-2 py-1"
              >
                {rows.slice(0, 50).map((r, i) => (
                  <option key={i} value={i}>
                    Row #{i + 1}: {Object.values(r).slice(0, 2).join(' — ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-xs font-semibold text-red-700">{error}</p>}
    </div>
  );
}