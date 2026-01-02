import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Euro, ShoppingBag, Trophy, TrendingUp } from "lucide-react";

interface AdminStatsProps {
    stats: {
        dailyRevenue: number;
        dailyCount: number;
        totalRevenue: number;
        totalCount: number;
        bestSellerName: string;
        bestSellerCount: number;
    }
}

export function AdminStats({ stats }: AdminStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-900 border-slate-800 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">
                        CA du Jour
                    </CardTitle>
                    <Euro className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.dailyRevenue.toFixed(2)}€</div>
                    <p className="text-xs text-slate-400">
                        {stats.dailyCount} commandes aujourd'hui
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">
                        Commandes Totales
                    </CardTitle>
                    <ShoppingBag className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalCount}</div>
                    <p className="text-xs text-slate-400">
                        Depuis le lancement
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">
                        Pizza Star
                    </CardTitle>
                    <Trophy className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    {stats.bestSellerCount > 0 ? (
                        <>
                            <div className="text-2xl font-bold truncate" title={stats.bestSellerName}>
                                {stats.bestSellerName}
                            </div>
                            <p className="text-xs text-slate-400">
                                Vendue {stats.bestSellerCount} fois
                            </p>
                        </>
                    ) : (
                        <div className="text-sm text-slate-500 italic">Pas encore de données</div>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">
                        CA Total
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)}€</div>
                    <p className="text-xs text-slate-400">
                        Performance globale
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
