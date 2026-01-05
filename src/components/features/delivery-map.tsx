"use client";
import { useEffect, useRef, useState } from 'react';
import { Bike, Navigation } from 'lucide-react';

interface DeliveryMapProps {
    customerAddress: string;
    restaurantAddress?: string; // Default: Central Brussels
    driverLat?: number;
    driverLng?: number;
    overrideStartPos?: { lat: number, lng: number }; // For Driver View (Route from Driver -> Customer)
}

export const DeliveryMap = ({ customerAddress, restaurantAddress = "Rue d'Anthée 3A, 5620 Morville, Belgique", driverLat, driverLng, overrideStartPos }: DeliveryMapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const pathRef = useRef<google.maps.LatLng[]>([]);

    // Animation Refs
    const animationFrameRef = useRef<number>(0);
    const progressRef = useRef<number>(0); // 0 to 1

    const [eta, setEta] = useState<string>("Calcul...");
    const [distance, setDistance] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    // Smooth Animation for Real GPS
    const animateMarkerTo = (newLat: number, newLng: number) => {
        if (!markerRef.current) return;

        const startPos = markerRef.current.getPosition();
        if (!startPos) {
            markerRef.current.setPosition(new window.google.maps.LatLng(newLat, newLng));
            return;
        }

        const startLat = startPos.lat();
        const startLng = startPos.lng();
        const startTime = performance.now();
        const duration = 1000; // 1 second smooth transition

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);

            const currentLat = startLat + (newLat - startLat) * ease;
            const currentLng = startLng + (newLng - startLng) * ease;

            const newPos = new window.google.maps.LatLng(currentLat, currentLng);
            markerRef.current?.setPosition(newPos);
            // Optional: Rotate car to face movement? (Requires more math, skip for now to avoid "n'importe comment")

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };

        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Effect: Handle Real-Time Driver Movement
    useEffect(() => {
        if (driverLat && driverLng && markerRef.current && googleMapRef.current) {
            // Stop any route simulation
            progressRef.current = 0;

            // Smoothly move to new position
            animateMarkerTo(driverLat, driverLng);

            // Pan to keep driver in view if we are tracking them
            if (overrideStartPos) {
                googleMapRef.current.panTo(new window.google.maps.LatLng(driverLat, driverLng));
            }
        }
    }, [driverLat, driverLng, overrideStartPos]);


    useEffect(() => {
        // Initialize Map
        const initMap = async () => {
            // Wait for Google Maps to be available
            if (!window.google || !window.google.maps) {
                // Retry if not ready (simple polling)
                const checkGoogle = setInterval(() => {
                    if (window.google && window.google.maps) {
                        clearInterval(checkGoogle);
                        initMap();
                    }
                }, 500);
                return;
            }

            if (!mapRef.current) return;

            // Create Map Instance (Styled Dark Mode)
            const map = new window.google.maps.Map(mapRef.current, {
                zoom: 13,
                center: overrideStartPos || { lat: 50.8503, lng: 4.3517 }, // Default
                disableDefaultUI: true,
                styles: [
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                    {
                        featureType: "administrative.locality",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#d59563" }],
                    },
                    {
                        featureType: "road",
                        elementType: "geometry",
                        stylers: [{ color: "#38414e" }],
                    },
                    {
                        featureType: "road",
                        elementType: "geometry.stroke",
                        stylers: [{ color: "#212a37" }],
                    },
                    {
                        featureType: "road",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#9ca5b3" }],
                    },
                    {
                        featureType: "water",
                        elementType: "geometry",
                        stylers: [{ color: "#17263c" }],
                    },
                ],
            });
            googleMapRef.current = map;

            // Directions Service
            const directionsService = new window.google.maps.DirectionsService();
            const directionsRenderer = new window.google.maps.DirectionsRenderer({
                map,
                suppressMarkers: true, // We will use custom markers
                polylineOptions: {
                    strokeColor: "#D4AF37", // Gold/Bronze
                    strokeWeight: 5,
                    strokeOpacity: 0.8,
                },
            });
            directionsRendererRef.current = directionsRenderer;

            // 1. Geocode addresses first to ensure we have coordinates
            const geocoder = new window.google.maps.Geocoder();
            let startLoc = overrideStartPos || { lat: 50.8503, lng: 4.3517 };
            let endLoc = { lat: 50.8411, lng: 4.3550 };  // Default nearby

            try {
                // simple utility to geocode
                const geocode = (address: string): Promise<google.maps.LatLngLiteral> => {
                    return new Promise((resolve, reject) => {
                        geocoder.geocode({ address }, (results, status) => {
                            if (status === "OK" && results && results[0]) {
                                resolve({
                                    lat: results[0].geometry.location.lat(),
                                    lng: results[0].geometry.location.lng()
                                });
                            } else {
                                reject(status);
                            }
                        });
                    });
                };

                // Attempt to geocode
                const promises = [geocode(customerAddress)];
                if (!overrideStartPos) {
                    promises.unshift(geocode(restaurantAddress));
                }

                const results = await Promise.allSettled(promises);

                // Logic to unpack depending on if we requested 1 or 2
                if (!overrideStartPos) {
                    if (results[0].status === 'fulfilled') startLoc = results[0].value;
                    if (results[1].status === 'fulfilled') endLoc = results[1].value;
                } else {
                    if (results[0].status === 'fulfilled') endLoc = results[0].value;
                }

            } catch (e) { console.log('Geocoding error (non-fatal)', e); }

            // Re-center map to bounds
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(startLoc);
            bounds.extend(endLoc);
            map.fitBounds(bounds);


            // Calculate Route
            try {
                const result = await directionsService.route({
                    origin: startLoc,
                    destination: endLoc,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                });

                if (result.routes.length > 0) {
                    directionsRenderer.setDirections(result);

                    const route = result.routes[0];
                    const leg = route.legs[0];
                    if (leg && leg.duration && leg.distance) {
                        setEta(leg.duration.text);
                        setDistance(leg.distance.text);
                    }

                    // Extract path for animation
                    // @ts-ignore - overview_path exists but TS might complain depending on types
                    pathRef.current = route.overview_path;

                    // Add Custom Markers
                    // Restaurant Marker
                    new window.google.maps.Marker({
                        position: leg.start_location,
                        map,
                        label: "🍕", // Simple emoji or use custom icon
                        title: "Il Fornaccio",
                    });

                    // Customer Marker
                    new window.google.maps.Marker({
                        position: leg.end_location,
                        map,
                        label: "🏠",
                        title: "Vous",
                    });

                    // Create Moving Scooter Marker
                    markerRef.current = new window.google.maps.Marker({
                        position: leg.start_location,
                        map,
                        icon: {
                            path: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z",
                            scale: 1.5,
                            fillColor: "#eab308", // Yellow-500
                            fillOpacity: 1,
                            strokeColor: "#000",
                            strokeWeight: 1,
                            anchor: new window.google.maps.Point(11, 11),
                        },
                        // Scooter icon
                        title: "Livreur",
                        zIndex: 100,
                    });

                    // Start Animation Loop
                    startAnimation();
                }

            } catch (err) {
                console.warn("Maps Route Error (Fallback engaged):", err);
                // Fallback: Create a synthetic straight/curved path

                // Decode or use simple coordinates if geocoding failed too, 
                // but assumption is we have at least the map centered or default coords.
                // For this fallback, we'll assume we can at least get endpoints or use map center.
                // Since actual geocoding might have worked for the markers but route blocked:
                // We'll define a simple path from "Restaurant" (approx Brussels center) to "Customer" (slightly offset)
                // In a real fallback, we might not have coords if geocoding failed. 
                // But let's assume we can get coords from the markers if they were set, or defaults.

                // Use Geocoded Locations from above
                const startPos = startLoc;
                const endPos = endLoc;

                // Create a slightly curved path for visual flair
                const midLat = (startPos.lat + endPos.lat) / 2 + 0.001;
                const midLng = (startPos.lng + endPos.lng) / 2 + 0.001;

                const fakePath = [
                    new window.google.maps.LatLng(startPos.lat, startPos.lng),
                    new window.google.maps.LatLng(midLat, midLng), // curve point
                    new window.google.maps.LatLng(endPos.lat, endPos.lng)
                ];

                pathRef.current = fakePath;

                // Manual Markers for fallback
                new window.google.maps.Marker({ position: startPos, map, label: "🍕" });
                new window.google.maps.Marker({ position: endPos, map, label: "🏠" });

                markerRef.current = new window.google.maps.Marker({
                    position: startPos,
                    map,
                    icon: {
                        path: "M19.5 9.5c.3 0 .5-.2.5-.5s-.2-.5-.5-.5h-2.2c-.3 0-.5.2-.5.5s.2.5.5.5H19.5z M18 8c0 .8.2 1.6.6 2.3l-2.6 1.3V14h-3v-1.5c0-.8-.7-1.5-1.5-1.5H9c-.8 0-1.5.7-1.5 1.5V14h-1v-4.5c0-.8.7-1.5 1.5-1.5H10v-1h3v1h1.5l1.6-.8C15.2 6.5 14 5.4 14 4c0-2.2 1.8-4 4-4s4 1.8 4 4c0 1.9-1.3 3.4-3 3.9V8h-1zm-3.5 8c0-.8-.7-1.5-1.5-1.5H5.4l.9-1.7c.2-.4.7-.6 1.1-.6h3.1c.3 0 .5-.2.5-.5s-.2-.5-.5-.5H7.4c-1.1 0-2.1.6-2.6 1.6l-1 1.9H2.5c-.8 0-1.5.7-1.5 1.5V18h11v-1.5V16zm4.5 4c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z m0-4c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1z M6.5 20c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z m0-4c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1z",
                        scale: 1.5,
                        fillColor: "#eab308",
                        fillOpacity: 1,
                        strokeColor: "#000",
                        strokeWeight: 1,
                        anchor: new window.google.maps.Point(11, 11),
                    },
                    title: "Livreur",
                    zIndex: 100,
                });

                // Draw line for fallback
                new window.google.maps.Polyline({
                    path: fakePath,
                    geodesic: true,
                    strokeColor: "#D4AF37",
                    strokeOpacity: 0.8,
                    strokeWeight: 5,
                    map: map,
                });

                startAnimation();
                setEta("15 min");
                setDistance("2.5 km");
            }
        };

        initMap();

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [customerAddress, restaurantAddress]);


    const startAnimation = () => {
        // If we have real driver data, don't start simulation
        if (driverLat && driverLng) return;

        if (!pathRef.current || pathRef.current.length === 0) return;

        const animate = () => {
            progressRef.current += 0.001; // Speed control (0.1% per frame approx)
            if (progressRef.current > 1) progressRef.current = 0; // Loop

            // Calc position based on polyline path
            // Simple interpolation along the array of points
            const totalPoints = pathRef.current.length;
            const floatIndex = progressRef.current * (totalPoints - 1);
            const index = Math.floor(floatIndex);
            const nextIndex = Math.min(index + 1, totalPoints - 1);
            const percentBetween = floatIndex - index;

            const p1 = pathRef.current[index];
            const p2 = pathRef.current[nextIndex];

            if (p1 && p2 && markerRef.current) {
                const lat = p1.lat() + (p2.lat() - p1.lat()) * percentBetween;
                const lng = p1.lng() + (p2.lng() - p1.lng()) * percentBetween;
                const newPos = new window.google.maps.LatLng(lat, lng);
                markerRef.current.setPosition(newPos);
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();
    };

    return (
        <div className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 group">

            {/* Map Container */}
            <div ref={mapRef} className="w-full h-full bg-slate-900" />

            {/* Error Overlay */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                    <p className="text-red-400 font-bold">{error}</p>
                </div>
            )}

            {/* Info Overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-md p-4 rounded-xl border border-slate-700 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center animate-pulse border border-green-500/50">
                        <Bike className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <p className="font-bold text-white flex items-center gap-2">
                            Livreur en route
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </p>
                        <p className="text-xs text-gray-400">Arrivée estimée: <span className="text-primary font-mono font-bold text-sm ml-1">{eta}</span></p>
                    </div>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-500 flex items-center justify-end gap-1"><Navigation className="w-3 h-3" /> Distance</p>
                    <p className="text-sm text-white font-mono">{distance}</p>
                </div>
            </div>
        </div>
    );
};
