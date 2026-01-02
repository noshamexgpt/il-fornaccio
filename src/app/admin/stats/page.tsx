import { getAdminStats } from "../stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function StatsPage() {
    const stats = await getAdminStats();

    return (
        <div className="space-y-8 h-full flex flex-col pt-6">
            <h2 className="text-3xl font-bold font-serif text-white">Statistiques Détaillées</h2>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Chiffre d'affaires (Total)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.totalRevenue.toFixed(2)} €</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Commandes (Auj.)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.todayCount}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Panier Moyen</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {(stats.totalRevenue / (stats.totalCount || 1)).toFixed(2)} €
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Best Sellers */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white">Top Pizzas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {stats.bestSellers.map((item, index) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-sm">
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{item.name}</p>
                                        <p className="text-xs text-slate-400">{item.count} vendues</p>
                                    </div>
                                </div>
                                <div className="text-white font-bold">{item.total.toFixed(2)} €</div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Placeholder for Chart */}
                <Card className="bg-slate-900 border-slate-800 flex items-center justify-center min-h-[300px]">
                    <div className="text-center space-y-2">
                        <p className="text-slate-500">Graphique des ventes (Bientôt disponible)</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
