import User from '../models/user.model.js';
import bcrypt from "bcryptjs"
import { generateToken } from '../lib/jw.token.js';
import cloudinary from '../lib/cloudinary.js';

const signup = async (req,res)=>{
    const {fullname,email,password} = req.body;
    try {
        
        if(!fullname || !email || !password) {
            return res.status(400).json({message: "Please fill all the fields"});
        }

        if(password.length <6) {
            return res.status(400).json({message: "Password must be at least 6 characters long"});
        }


        const user = await User.findOne({email: email});
        if(user) return res.status(400).json({message:"User already exists with this email"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        const newUser = new User({
            fullname: fullname,
            email: email,
            password: hashedPassword
        })

        if(newUser){
            //gonna generate a jwt token here
            await newUser.save();
            generateToken(newUser._id,res);
            return res.status(201).json({message: "User created successfully",
                user: {
                    _id: newUser._id,
                    fullname: newUser.fullname,
                    email: newUser.email,
                    image: newUser.image
                }
            });
        }
    } catch (error) {
        return res.status(500).json({message: "Internal server error"});
    }
}

const login = async (req,res)=>{
    const {email,password} = req.body;
    try {
        if(!email || !password) {
            return res.status(400).json({message: "Please fill all the fields"});
        }
        const user = await User.findOne({email: email});
        if(!user) return res.status(400).json({message:"invalid credentials"});

        const isPasswordCorrect = await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect) return res.status(400).json({message:"invalid credentials"});

        generateToken(user._id,res);
        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                image: user.image
            }
        });
    } catch (error) {
        res.status(500).json({message: "Internal server error"});
    }
}

const logout = (req,res)=>{
    try {
        res.clearCookie('token', {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        });
        return res.status(200).json({message: "User logged out successfully"});
    } catch (error) {
        res.status(500).json({message: "Internal server error"});
    }
}

const updateProfile = async (req,res)=>{
    try {
        
        const{image} = req.body;
        const userId = req.user._id;

        if(!image) {
            return res.status(400).json({message: "Please provide an image"});
        }
        // console.log("🖼️ Image length:", image?.length || 0);
    if (!image || !image.startsWith("data:image")) {
      return res.status(400).json({ message: "Invalid or missing image" });
    }

    console.log("Uploading to Cloudinary...");

        // Upload image to cloudinary
        const uploadImage = await cloudinary.uploader.upload(image)
        //  console.log("✅ Upload successful:", uploadImage.secure_url);

        if(!uploadImage) {
            return res.status(400).json({message: "Image upload failed"});
        }
        const userUpdated = await User.findByIdAndUpdate(userId, {
            image: uploadImage.secure_url 
        }, {new: true});

        res.status(200).json(userUpdated)
    } catch (error) {
        console.error("💥 Cloudinary upload error:", error);
        res.status(500).json({message: "Internal server error"});
    }
}

const checkAuth = (req,res)=>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        res.status(500).json({message: "Internal server error"});
    }
}

export { signup, login, logout , updateProfile , checkAuth }; 