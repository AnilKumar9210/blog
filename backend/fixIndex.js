import mongoose from "mongoose";
import user from "./Schema/user.js";
import 'dotenv/config';

await mongoose.connect(process.env.DB_LOCATION);

await mongoose.connection.dropCollection("user");   

console.log("Users collection dropped");

mongoose.connection.close();
