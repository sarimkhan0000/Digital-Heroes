import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#141413]">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-[#141413]/75">
          Logged in as: <span className="font-semibold">{session.user.email}</span>
        </p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 border border-[#141413]/10 shadow-sm">
            <h3 className="text-lg font-bold text-[#141413]">Total Orders</h3>
            <p className="text-2xl font-extrabold mt-2 text-[#E85D04]">--</p>
          </div>
          <div className="bg-white p-6 border border-[#141413]/10 shadow-sm">
            <h3 className="text-lg font-bold text-[#141413]">Active Users</h3>
            <p className="text-2xl font-extrabold mt-2 text-[#141413]">--</p>
          </div>
          <div className="bg-white p-6 border border-[#141413]/10 shadow-sm">
            <h3 className="text-lg font-bold text-[#141413]">System Status</h3>
            <p className="text-sm font-semibold mt-2 text-emerald-600">Operational</p>
          </div>
        </div>
      </div>
    </div>
  );
}