import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";

export const POST = async (request: Request) => {
  await dbConnect();

  const { username, content, sentiment } = await request.json();
  console.log(content)
  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      return Response.json({
        success: false,
        message: "User not Found :(",
        status: 400,
      });
    }

    if (!user.isAcceptingMessage) {
      return Response.json({
        success: false,
        message: "User not accepting messages :(",
        status: 403,
      });
    }

    const newMessage = {content: content, sentiment: sentiment, createdAt: new Date()}

    user.message.push(newMessage as Message);
    await user.save();

    return Response.json({
        success: true,
        message: "Message send successfully :)",
        status: 403,
      });
  } catch (error) {
    console.log("Error in sending Message :(", error);
        
    return Response.json({
        success: false,
        message: "Error in sending Message :(",
        status: 500
    })
  }
};
