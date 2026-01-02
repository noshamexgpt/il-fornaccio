import Link from "next/link";
import { Facebook, Instagram, MapPin, Phone, Clock } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full bg-slate-950 border-t border-slate-800 text-slate-300 py-12">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* Brand */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold font-serif text-orange-500">Il Fornaccio</h3>
                    <p className="text-sm text-slate-400">
                        L'authentique pizza napolitaine, cuite au feu de bois avec passion et tradition.
                    </p>
                </div>

                {/* Links */}
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Navigation</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/" className="hover:text-orange-400 transition-colors">Accueil</Link></li>
                        <li><Link href="/menu" className="hover:text-orange-400 transition-colors">La Carte</Link></li>
                        <li><Link href="/about" className="hover:text-orange-400 transition-colors">À Propos</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Contact</h4>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-orange-500 shrink-0" />
                            <span>
                                12 Rue de la Pizza,<br />
                                75011 Paris
                            </span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-orange-500 shrink-0" />
                            <span>01 23 45 67 89</span>
                        </li>
                    </ul>
                </div>

                {/* Hours */}
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Horaires</h4>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-orange-500 shrink-0" />
                            <div>
                                <p>Mar - Dim : 12h-14h30 / 19h-22h30</p>
                                <p className="text-slate-500">Fermé le Lundi</p>
                            </div>
                        </li>
                    </ul>
                    <div className="flex gap-4 pt-2">
                        <Link href="#" className="hover:text-orange-500 transition-colors">
                            <Facebook className="w-6 h-6" />
                        </Link>
                        <Link href="#" className="hover:text-orange-500 transition-colors">
                            <Instagram className="w-6 h-6" />
                        </Link>
                    </div>
                </div>

            </div>

            <div className="container mx-auto px-4 mt-8 pt-8 border-t border-slate-900 text-center text-xs text-slate-600">
                <p>&copy; {new Date().getFullYear()} Il Fornaccio. Tous droits réservés.</p>
            </div>
        </footer>
    );
}
