import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ divisionSlug: string }>;
}

const DIVISIONS: Record<string, { title: string; description: string; basePrice: number }> = {
  'custom-posters': {
    title: 'Custom Posters & Wall Art',
    description: 'High-resolution archival prints on matte or glossy museum-grade paper.',
    basePrice: 29.99,
  },
  'business-cards': {
    title: 'Premium Business Cards',
    description: 'Thick 350gsm cardstock with matte, gloss, or soft-touch lamination.',
    basePrice: 19.99,
  },
  'banners-signage': {
    title: 'Vinyl Banners & Signage',
    description: 'Weather-resistant indoor and outdoor vinyl banners with custom grommets.',
    basePrice: 49.99,
  },
  'flyers-brochures': {
    title: 'Marketing Flyers & Brochures',
    description: 'Vibrant full-color promotional prints folded to your exact specifications.',
    basePrice: 34.99,
  },
};

async function ConfigureContent({ params }: PageProps) {
  const { divisionSlug } = await params;

  const division = DIVISIONS[divisionSlug] || {
    title: divisionSlug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    description: 'Customize your print specifications, dimensions, and quantity below.',
    basePrice: 24.99,
  };

  if (!divisionSlug) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 border border-[#141413]/10 shadow-sm rounded-lg">
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm font-medium text-[#141413]/60 hover:text-[#141413] transition-colors"
        >
          ← Back to Catalog
        </Link>
        <h1 className="text-3xl font-bold text-[#141413] mt-2">{division.title}</h1>
        <p className="text-sm text-[#141413]/75 mt-1">{division.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#141413]/10">
        <div className="bg-[#F5F4F0] rounded-lg p-6 flex flex-col items-center justify-center min-h-[260px] border border-dashed border-[#141413]/20">
          <p className="text-sm font-semibold text-[#141413]">Print Preview Area</p>
          <p className="text-xs text-[#141413]/60 mt-1 text-center">
            Configure your dimensions and upload artwork to preview
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#141413] mb-1">Select Size</label>
            <select className="w-full px-3 py-2 border border-[#141413]/20 rounded bg-white text-sm text-[#141413] focus:outline-none focus:border-[#141413]">
              <option value="small">Standard Small (12&quot; x 18&quot;)</option>
              <option value="medium">Medium (18&quot; x 24&quot;)</option>
              <option value="large">Large Format (24&quot; x 36&quot;)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#141413] mb-1">Finish / Material</label>
            <select className="w-full px-3 py-2 border border-[#141413]/20 rounded bg-white text-sm text-[#141413] focus:outline-none focus:border-[#141413]">
              <option value="matte">Archival Matte Finish</option>
              <option value="gloss">High-Gloss Photo Finish</option>
              <option value="canvas">Textured Cotton Canvas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#141413] mb-1">Quantity</label>
            <input
              type="number"
              min={1}
              defaultValue={1}
              className="w-full px-3 py-2 border border-[#141413]/20 rounded text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
            />
          </div>

          <div className="pt-4 border-t border-[#141413]/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#141413]/60">Starting Price</p>
              <p className="text-2xl font-extrabold text-[#141413]">${division.basePrice.toFixed(2)}</p>
            </div>
            <Link
              href="/checkout"
              className="px-6 py-3 bg-[#E85D04] text-white font-semibold text-sm rounded hover:bg-[#d15203] transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfigurePage(props: PageProps) {
  return (
    <div className="min-h-screen bg-[#F5F4F0] py-12 px-4">
      <Suspense fallback={<div className="text-center py-12 text-[#141413] font-medium">Loading configurator...</div>}>
        <ConfigureContent {...props} />
      </Suspense>
    </div>
  );
}