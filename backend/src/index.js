import express from 'express';
import { app,server } from './lib/socket.js';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import 'dotenv/config';
import connectDB from './lib/db.js';
import cookieParser from 'cookie-parser'
import cors from 'cors';
import path from 'path';


const PORT = process.env.PORT || 5001;

const __dirname = path.resolve();

app.use(express.json({limit: '10mb'}));
app.use(cookieParser({limit: '10mb', extended: true}));
// Middleware to enable CORS
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,// Allow credentials (cookies, authorization headers, etc.)
}))
// Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true }));


app.use("/api/auth",authRoutes);
app.use("/api/message",messageRoutes);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));

    app.get("/*", (req, res) => {
     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}

server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    connectDB()
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Database connection error:', err));
})