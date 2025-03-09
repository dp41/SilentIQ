import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from 'next-auth'

export const POST = async (request: Request) => {
    await dbConnect()

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if(!session || !user) {
        return Response.json({
            success: false,
            message: "not authenticated :(",
            status: 401
        })
    }

    const userId = user._id;
    const {acceptMessages} = await request.json();

    try {

        const updatedUser = await UserModel.findByIdAndUpdate(userId, {isAcceptingMessage: acceptMessages}, {new: true})
        
        if(!updatedUser) {
            return Response.json({
                success: false,
                message: "fail to update user status to accept messages!! :(",
                status: 401
            })
        }

        return Response.json({
            success: true,
            message: "Message acceptance status updated successfully :)",
            status: 200,
            updatedUser
        })

    } catch (error) {
        console.log("fail to update user status to accept messages!! :(");
        
        return Response.json({
            success: false,
            message: "fail to update user status to accept messages!! :(",
            status: 500
        })
    }
} 

export const GET = async (request: Request) => {
    await dbConnect()

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if(!session || !user) {
        return Response.json({
            success: false,
            message: "not authenticated :(",
            status: 401
        })
    }

    const userId = user._id;

    try {
        const foundUser = await UserModel.findById(userId);

        if(!foundUser) {
            return Response.json({
                success: false,
                message: "User not found :(",
                status: 404
            })
        }
    
        return Response.json({
            success: true,
            isAcceptingMessage: foundUser.isAcceptingMessage,
            message: "User found :)",
            status: 200
        })
    } catch (error) {
        console.log("error in getting status in accept messages!! :(");
        
        return Response.json({
            success: false,
            message: "error in getting status in accept messages!! :(",
            status: 500
        })
    }
    

}