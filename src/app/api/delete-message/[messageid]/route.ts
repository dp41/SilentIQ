import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
import { User } from 'next-auth';
import { authOptions } from "../../auth/[...nextauth]/options";

export const DELETE = async (request: Request,{ params }: { params: { messageid: string } }) => {
    const messageid = params.messageid;
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if(!session || !user) {
        return Response.json({
            success: false,
            message: "not authenticated :(",
            status: 401
        })
    }


    try {
        const updateResult = await UserModel.updateOne(
            {_id: user._id},
            {$pull: {message: {_id: messageid}}}
        );

        if(updateResult.modifiedCount === 0){
            return Response.json({
                message: "Message not found or already deleted!!",
                status: 404
            })
        }
        return Response.json({
            message: "Message deleted successfully!!",
            status: 200
        })


    } catch (error) {
        console.error('Error deleting message:', error);
        return Response.json(
          { message: 'Error deleting message', success: false },
          { status: 500 }
        );
    }
}