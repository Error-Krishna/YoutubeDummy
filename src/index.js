// require('dotenv').config({path: './env'});

import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: './.env'
})
const port = process.env.PORT || 8000;

connectDB()
//  start the server after connecting the database, why? -> dont let the application accept the traffic with the availaility of the database
.then(() => {
    try {
        const server = app.listen(port, () =>{
        console.log(`Server is running at port: ${port}`)});
    } catch {
        server.on("error", (error) => {
            console.log("ERROR IN SERVER INITIALIZATON", error);
            throw error;
        })
    }
    
})
.catch((err) => {
    console.log("MONGODB CONNECTION FAILED!!!!!!!!!!!: ", err);
})









/*
import express from "express";

const app = express();

( async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERROR", error)
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    } catch (error){
        console.error("ERROR: ", error);
        throw error
    }
} )()


*/