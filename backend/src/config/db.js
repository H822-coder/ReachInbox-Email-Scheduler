import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const serverInfo = await mongoose.connection.db.admin().command({
          hello: 1
        });

        console.log("MONGODB SERVER IDENTITY:", {
          primary: serverInfo.primary,
          me: serverInfo.me,
          setName: serverInfo.setName
        });

        console.log("MongoDB connected successfully");

        // Connection details for debugging
        console.log("Mongoose connection details:", {
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            database: mongoose.connection.name,
            readyState: mongoose.connection.readyState
        });

    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;