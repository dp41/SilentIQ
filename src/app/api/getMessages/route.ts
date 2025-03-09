import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from 'next-auth'
import mongoose from "mongoose";


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

    const userId = new mongoose.Types.ObjectId(user._id);
    

    try {
        const user = await UserModel.aggregate([
            { $match: { _id: userId } },
            { $unwind: '$message' },
            { $sort: { 'message.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: '$message' } } },
          ]).exec();

        if(!user || user.length === 0) {
            return Response.json({
                success: false,
                message: "User not Found :(",
                status: 400
            })
        }

        return Response.json({
            success: true,
            messages: user[0].messages,
            status: 200
        })
    } catch (error) {
        console.log("Error in getting Messages :(", error);
        
        return Response.json({
            success: false,
            message: "Error in getting Messages :(",
            status: 500
        })
    }
}