import {resend} from '@/lib/resend';
import varificationEmail from '../../emails/varificationEmail'
import { ApiResponse } from '@/types/ApiResponse';

export const sendVerificationEmail = async (
    email: string, 
    username: string, 
    verifyCode: string):Promise<ApiResponse> => {

        try {
            await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: email,
                subject: 'Honest Echoes | Varification Code',
                react: varificationEmail({username, otp: verifyCode}),
              });
              
            return {success: true, message: "Varification email send successfully"}

        } catch (error) {
            console.error("Error sending Varification email ", error);
            
            return {success: false, message: "Error sending Varification email"}
        }
}