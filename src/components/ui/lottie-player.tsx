
"use client";

import { useEffect, useState, useRef } from "react";
import Lottie from "lottie-react";

interface LottiePlayerProps {
    src: string;
    className?: string;
    loop?: boolean;
    autoplay?: boolean;
    speed?: number;
}

export const LottiePlayer = ({ src, className, loop = true, autoplay = true, speed = 1 }: LottiePlayerProps) => {
    const [animationData, setAnimationData] = useState<any>(null);

    useEffect(() => {
        const fetchAnimation = async () => {
            try {
                const response = await fetch(src);
                if (response.ok) {
                    const data = await response.json();
                    setAnimationData(data);
                } else {
                    console.error(`Failed to load Lottie: ${src}`);
                }
            } catch (error) {
                console.error("Error loading Lottie JSON:", error);
            }
        };
        fetchAnimation();
    }, [src]);

    useEffect(() => {
        if (animationData) {
            // Lottie-react doesn't expose a simple ref-less speed prop in this version easily without lottieRef.
            // But checking docs, we can pass lottieRef to control it.
            // A simpler way for this component wrapper: use the 'lottieRef'.
        }
    }, [speed, animationData]);

    // Actually, lottie-react component accepts 'speed' if we use the hook or ref. 
    // Let's switch to using 'useLottie' hook or just passing ref.
    // Simplifying: The user just wants it slower. 

    // Rewrite to use lottieRef for speed control
    const lottieRef = useRef<any>(null);

    useEffect(() => {
        if (lottieRef.current) {
            lottieRef.current.setSpeed(speed);
        }
    }, [speed, animationData]);

    if (!animationData) {
        return <div className="w-full h-full animate-pulse bg-white/5 rounded-xl" />;
    }

    return (
        <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            loop={loop}
            autoplay={autoplay}
            className={className}
        />
    );
};
