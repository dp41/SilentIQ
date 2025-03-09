import mongoose from "mongoose";

type connectionObject = {
    //? added because value is optional 
    isConnected?: number;
}

const connection: connectionObject = {}

const dbConnect = async (): Promise<void> => {

    if(connection.isConnected){
        console.log('Database is already connected');
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGOOSE_URI || '')

        connection.isConnected = db.connections[0].readyState
        console.log('Database is connected');
        
    } catch (error) {
        console.error(error);
        process.exit(1)
    }
}

export default dbConnect;