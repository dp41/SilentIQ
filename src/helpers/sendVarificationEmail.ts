import {resend} from '@/lib/resend';
import verificationEmail from '../../emails/verificationEmail'
import { ApiResponse } from '@/types/ApiResponse';

export const sendVerificationEmail = async (
    email: string, 
    username: string, 
    verifyCode: string):Promise<ApiResponse> => {

        try {
            await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: email,
                subject: 'SilentIQ | Verification Code',
                react: verificationEmail({username, otp: verifyCode}),
              });
              
            return {success: true, message: "Verification email send successfully"}

        } catch (error) {
            console.error("Error sending Verification email ", error);
            
            return {success: false, message: "Error sending Verification email"}
        }
}