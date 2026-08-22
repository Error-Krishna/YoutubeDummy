import express from express
import cors from "cors"
import cookieparser from "cookie-parser"


const app = express();
app.use(cors({
    orgin: process.env.CORS_ORIGIN,
    credentials: true,
})) // "use" is used to access all the middlewares

app.use(express.json({
    limit:"16kb"
}))
app.use(express.urlencoded({
    extended: true,
    limit: "16kb",
}))
app.use(express.static("public"))
app.use(cookieparser())



export { app }