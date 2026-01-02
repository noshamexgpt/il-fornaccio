"use client";

import { login } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const result = await login(formData);

        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
        }
        // If success, the action redirects automatically.
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <Card className="w-full max-w-sm bg-slate-900 border-slate-800 text-white">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-slate-800 p-3 rounded-full w-fit mb-4">
                        <Lock className="w-6 h-6 text-orange-500" />
                    </div>
                    <CardTitle className="text-2xl font-serif text-white">Espace Chef</CardTitle>
                    <CardDescription className="text-slate-400">
                        Veuillez entrer le code secret
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                name="password"
                                placeholder="••••••"
                                required
                                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-orange-500"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
                        <Button type="submit" disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                            {isLoading ? "Vérification..." : "Déverrouiller"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
