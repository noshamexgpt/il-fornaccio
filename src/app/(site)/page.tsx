import Image from "next/image";
import { Hero } from "@/components/sections/hero";
import { MenuGrid } from "@/components/features/menu-grid";
import { prisma } from "@/lib/db";

export default async function Home() {
  const pizzas = await prisma.pizza.findMany({
    where: { isAvailable: true },
    orderBy: { basePrice: 'asc' }
  });

  return (
    <div className="bg-background">
      <Hero />

      {/* Menu Section */}
      <section id="menu" className="py-24 container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-primary font-medium tracking-widest uppercase text-sm">Notre Carte</h2>
          <h3 className="text-4xl md:text-5xl font-serif font-bold text-foreground">Les Signatures</h3>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <MenuGrid pizzas={pizzas} />
      </section>

      {/* About Section (Placeholder) */}
      <section id="about" className="py-24 bg-muted/10 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">
            <div className="w-full md:w-1/2 relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/pizzaiolo-gerard.png"
                alt="Gerard Annicchiarico - Pizzaiolo"
                fill
                className="object-cover"
              />
            </div>
            <div className="w-full md:w-1/2 space-y-6 text-left">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground">
                L'Authenticité <br />
                <span className="text-primary italic">au feu de bois.</span>
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Chez Il Fornaccio, le temps est notre ingrédient le plus précieux. Notre secret réside dans une pâte
                  qui repose pendant <strong>72 heures</strong>. Cette lente fermentation est la clé d'une pizza légère,
                  aérienne et parfaitement digeste.
                </p>
                <p>
                  Nous perpétuons la tradition dans le respect de l'art : nos pizzas sont cuites au <strong>feu de bois</strong>
                  dans un véritable four napolitain, offrant ce goût fumé inimitable et cette croûte croustillante.
                </p>
                <p>
                  Pas de compromis sur la qualité : nous sélectionnons rigoureusement des ingrédients d'exception,
                  importés d'Italie ou issus de producteurs locaux passionnés. Simplement le goût du vrai.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
