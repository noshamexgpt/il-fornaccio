import { AdminSidebar } from "@/components/admin/sidebar";
import { checkAuth } from "@/app/actions"; // Assuming we want global auth check here or per page

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // Optional: Global admin check here if not already handled by middleware/page

    return (
        <div className="min-h-screen bg-slate-950 flex text-white">
            <AdminSidebar />
            <main className="flex-1 p-8 overflow-y-auto h-screen">
                {children}
            </main>
        </div>
    );
}
