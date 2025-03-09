import { z } from 'zod'

export const messageSchema = z.object({
   content: z.string()
   .min(5,{message: 'Content must be atleast 5 characters'})
   .max(300,{message: 'Content not more than 300 characters'})
})