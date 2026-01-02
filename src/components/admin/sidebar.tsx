"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Pizza, Users, BarChart3, Settings } from "lucide-react";

export function AdminSidebar() {
    const pathname = usePathname();

    const links = [
        { href: "/admin", label: "Tableau de Bord", icon: LayoutDashboard },
        { href: "/admin/menu", label: "Menu / Carte", icon: Pizza },
        { href: "/admin/ingredients", label: "Ingrédients", icon: Pizza }, // Using Pizza icon for now or we can import another one like Egg or Carrot
        { href: "/admin/clients", label: "Clients", icon: Users },
        { href: "/admin/stats", label: "Statistiques", icon: BarChart3 },
    ];

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen sticky top-0">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                    🔥 Il Fornaccio
                </h1>
                <p className="text-xs text-slate-500 mt-1">Admin Panel</p>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-orange-500/10 text-orange-500"
                                    : "hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <link.icon className="w-5 h-5" />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                    <Settings className="w-5 h-5" />
                    Paramètres
                </button>
            </div>
        </aside>
    );
}
