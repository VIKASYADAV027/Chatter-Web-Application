import express from 'express';
import { app,server } from './lib/socket.js';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import 'dotenv/config';
import connectDB from './lib/db.js';
import cookieParser from 'cookie-parser'
import cors from 'cors';


const PORT = process.env.PORT || 5001;
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

server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    connectDB()
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Database connection error:', err));
})