"use client";

import { useEffect, useRef, useState, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AddressAutocompleteProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onAddressSelect?: (address: string) => void;
}

declare global {
    interface Window {
        google: any;
        initGooglePlaces?: () => void;
    }
}

export const AddressAutocomplete = forwardRef<HTMLInputElement, AddressAutocompleteProps>(
    ({ className, onAddressSelect, onChange, ...props }, ref) => {
        const inputRef = useRef<HTMLInputElement>(null);
        const autoCompleteRef = useRef<any>(null);
        const [isReady, setIsReady] = useState(false);

        // Merge refs to support both internal usage (Google Maps) and external usage (React Hook Form)
        const setRefs = (element: HTMLInputElement | null) => {
            inputRef.current = element;
            if (typeof ref === "function") {
                ref(element);
            } else if (ref) {
                (ref as React.MutableRefObject<HTMLInputElement | null>).current = element;
            }
        };

        useEffect(() => {
            // Simple polling to wait for Google Maps Global Object
            const checkGoogle = () => {
                const exists = !!(window.google && window.google.maps && window.google.maps.places);
                if (exists) {
                    setIsReady(true);
                    return true;
                }
                return false;
            };

            if (checkGoogle()) return;

            const interval = setInterval(() => {
                if (checkGoogle()) {
                    clearInterval(interval);
                }
            }, 300);

            return () => clearInterval(interval);
        }, []);

        useEffect(() => {
            if (isReady && inputRef.current && !autoCompleteRef.current) {
                try {
                    autoCompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                        componentRestrictions: { country: "be" },
                        fields: ["formatted_address", "geometry"],
                        types: ["address"],
                    });

                    autoCompleteRef.current.addListener("place_changed", () => {
                        console.log("Creating place_changed listener fired");
                        const place = autoCompleteRef.current.getPlace();
                        console.log("Place selected:", place);

                        if (place.formatted_address) {
                            // Manually trigger change event to ensure React Form hooks capture it if needed
                            if (inputRef.current) {
                                inputRef.current.value = place.formatted_address;
                                inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
                                inputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                            }

                            if (onAddressSelect) {
                                console.log("Calling onAddressSelect with:", place.formatted_address);
                                onAddressSelect(place.formatted_address);
                            }
                        } else {
                            console.log("No formatted address in place object");
                        }
                    });
                } catch (e) {
                    console.error("Autocomplete init error:", e);
                }
            }
        }, [isReady, onAddressSelect]);

        return (
            <div className="relative w-full">
                <Input
                    ref={setRefs}
                    className={cn("bg-background", className)}
                    autoComplete="off"
                    onChange={onChange}
                    {...props}
                />
            </div>
        );
    }
);
AddressAutocomplete.displayName = "AddressAutocomplete";
