import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const POST = async (request: Request) => {
    await dbConnect();
  
try {
    const {username, code} = await request.json();

    const decodedUsername = decodeURIComponent(username);

    const user = await UserModel.findOne({username});

    if(!user){
        return Response.json({
            success: false,
            message: "User not found",
            status: 500,
          });
    }
    
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpire = new Date(user.verifyCodeExpiry) > new Date()

    if(isCodeValid && isCodeNotExpire){
        user.isVerified = true
        await user.save();
        return Response.json({
            success: true,
            message: "Account Verified Successfully",
            status: 200,
          });
    }

    else if(!isCodeNotExpire){
        return Response.json({
            success: false,
            message: "Verification code has expired, please signup again to get a new code",
            status: 400,
          });
    } else{
        return Response.json({
            success: false,
            message: "Incorrect Verification code",
            status: 400,
          });
    }

  } catch (error) {
    console.log("Verification code error", error);

    return Response.json({
      success: false,
      message: "Verification code error",
      status: 500,
    });
  }
};
