import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import cloudinary from '../lib/cloudinary.js'
import { getReceiverSocketId, io } from '../lib/socket.js';

export const getUsersForSidebar = async (req, res) => {
    try {
      const loggedUserId = req.user._id;
      const filterUsers = await User.find({_id:{$ne:loggedUserId}}).select('-password -__v -createdAt -updatedAt');

      res.status(200).json(filterUsers);
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const getMessages = async (req,res)=>{
    try {
        const {id:userToChatId} = req.params;
        const myId = req.user._id;  

        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: userToChatId },
                { sender: userToChatId, receiver: myId }
            ]
        })
        
        res.status(200).json(messages);
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const sendMessage = async (req,res)=>{
    try {
       const {text,image} = req.body;
       const receiverId = req.params.id;
       const senderId = req.user._id;

       let imageUrl;
       if(image){
        const uploadImage = await cloudinary.uploader.upload(image)
        imageUrl = uploadImage.secure_url;
       }

       const createdMessage = await Message.create({
        senderId,
        receiverId,
        text,
        image: imageUrl
       });

       // Fetch the saved message to ensure all fields (including timestamps) are present
       const newMessage = await Message.findById(createdMessage._id);

       const receiverSocketId = getReceiverSocketId(receiverId)

       if(receiverSocketId){
        io.to(receiverSocketId).emit("newMessage",newMessage);
       }

       res.status(200).json(newMessage);

    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal Server Error"});
    }
}