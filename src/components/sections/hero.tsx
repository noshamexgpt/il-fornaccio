"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Hero() {
    return (
        <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
            {/* Video Background */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-black">
                <video
                    key="clean-video-v1"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                >
                    <source src="/hero-browser.mp4" type="video/mp4" />
                </video>



                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/60" />
            </div>

            {/* Content */}
            <div className="container relative z-10 px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-6"
                >
                    <h2 className="text-primary font-medium tracking-widest uppercase text-sm md:text-base">
                        Authentique & Traditionnelle
                    </h2>
                    <h1 className="text-4xl md:text-7xl lg:text-8xl font-serif font-bold text-white tracking-tight text-balance">
                        Il Fornaccio
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
                        L'excellence de la pizza au feu de bois. Une pâte maturée 72h, des ingrédients
                        d'exception, une cuisson parfaite.
                    </p>

                    <div className="pt-8 flex flex-col md:flex-row gap-4 justify-center items-center">
                        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-transform hover:scale-105 active:scale-95">
                            Commander maintenant
                        </Button>
                        <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 text-lg px-8 py-6 rounded-full transition-transform hover:scale-105 active:scale-95">
                            Découvrir le menu
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
                    <div className="w-1 h-3 bg-primary rounded-full" />
                </div>
            </motion.div>
        </section>
    );
}
