import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

export const protectRoute = async (req, res, next)=>{
    try {
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({message:"unauthorized no token is provided"})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded){
            return res.status(401).json({message:"unauthorized invalid token"})
        }
        const user = await User.findById(decoded.userId).select('-password');
        if(!user){
            return res.status(404).json({message:"user not found"})
        }
        req.user = user;
        next();

    } catch (error) {
        res.status(500).json({message:"internal server error", error: error.message});
    }

}