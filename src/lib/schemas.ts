import { z } from "zod";

import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";

export const checkoutSchema = z.object({
    name: z.string().min(2, "Le nom est requis"),
    phone: z.string()
        .refine((val) => isValidPhoneNumber(val, 'BE'), {
            message: "Numéro de téléphone invalide (ex: 0470...)",
        })
        .transform((val) => {
            const parsed = parsePhoneNumber(val, 'BE');
            return parsed ? parsed.number : val;
        }),
    address: z.string().min(5, "L'adresse est requise"),
    instructions: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
