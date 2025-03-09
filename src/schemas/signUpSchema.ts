import {z} from 'zod'

export const usernameValidation = z.string().min(2,'Username must be at least 2 characters').max(10, 'Username not more than 10 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username not contain special charaters');

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message:'Invalid Email address'}),
    password: z.string().min(6,{message: 'Password must be at least 6 characters'})

})