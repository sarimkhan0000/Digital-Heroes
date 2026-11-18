import Link from "next/link";

const PRODUCTS = [
  {
    slug: "custom-posters",
    title: "Custom Posters & Wall Art",
    category: "Wall Art",
    price: "$29.99",
    description: "Museum-grade archival prints on heavyweight matte or glossy paper.",
    badge: "Best Seller",
  },
  {
    slug: "business-cards",
    title: "Premium Business Cards",
    category: "Stationery",
    price: "$19.99",
    description: "Thick 350gsm cardstock with velvet soft-touch or high-gloss finish.",
    badge: "Popular",
  },
  {
    slug: "banners-signage",
    title: "Vinyl Banners & Signage",
    category: "Large Format",
    price: "$49.99",
    description: "Weather-resistant heavy-duty vinyl banners with reinforced grommets.",
    badge: "Outdoor Ready",
  },
  {
    slug: "flyers-brochures",
    title: "Marketing Flyers & Brochures",
    category: "Marketing",
    price: "$34.99",
    description: "Vibrant full-color promotional prints folded to your exact specs.",
    badge: "Fast Delivery",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F5F4F0] text-[#141413]">
      {/* Navbar */}
      <header className="bg-white border-b border-[#141413]/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold tracking-tight text-[#141413]">
            DIGITAL <span className="text-[#E85D04]">HEROES</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/dashboard" className="text-[#141413]/80 hover:text-[#141413] transition-colors">
              Dashboard
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-[#141413] text-white rounded hover:bg-black transition-colors"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#141413] text-white py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block px-3 py-1 bg-[#E85D04]/20 text-[#E85D04] text-xs font-bold uppercase tracking-wider rounded-full mb-4">
            Next-Gen Web-to-Print Platform
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Bring Your Designs to Life with <span className="text-[#E85D04]">Precision Print</span>
          </h1>
          <p className="mt-6 text-lg text-white/75 max-w-2xl mx-auto">
            Configure custom dimensions, choose premium finishes, and order studio-quality prints delivered straight to your door.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/configure/custom-posters"
              className="px-8 py-3.5 bg-[#E85D04] text-white font-semibold rounded-lg hover:bg-[#d15203] transition-colors shadow-lg"
            >
              Start Designing Now
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3.5 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
            >
              Track Your Orders
            </Link>
          </div>
        </div>
      </section>

      {/* Product Catalog */}
      <main className="max-w-7xl mx-auto py-16 px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-[#141413]">Print Divisions</h2>
            <p className="text-sm text-[#141413]/70 mt-1">
              Select a product category below to customize size, material, and quantity
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((item) => (
            <div
              key={item.slug}
              className="bg-white border border-[#141413]/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#141413]/50">
                    {item.category}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-[#E85D04]/10 text-[#E85D04] rounded-full">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#141413] mb-2">{item.title}</h3>
                <p className="text-sm text-[#141413]/70 leading-relaxed mb-6">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#141413]/10 flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#141413]/50 block">Starts at</span>
                  <span className="text-lg font-extrabold text-[#141413]">{item.price}</span>
                </div>
                <Link
                  href={`/configure/${item.slug}`}
                  className="px-4 py-2 bg-[#141413] text-white text-sm font-medium rounded-lg hover:bg-[#E85D04] transition-colors"
                >
                  Configure →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#141413]/10 py-8 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-[#141413]/60">
          <p>© {new Date().getFullYear()} Digital Heroes. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/login" className="hover:text-[#141413]">Login</Link>
            <Link href="/dashboard" className="hover:text-[#141413]">Dashboard</Link>
            <Link href="/checkout" className="hover:text-[#141413]">Checkout</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}