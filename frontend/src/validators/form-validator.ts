import { z } from 'zod';

export const formSchema = z.object({
    file: z.any()
});

export type FormType = z.infer<typeof formSchema>;
