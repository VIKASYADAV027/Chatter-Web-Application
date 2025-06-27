import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    fullname:{
        type: String,
        required : true,
    },
    password:{
        type:String,
        required: true,
        minlength:6,
    },
    image:{
        type: String,
        default:"",
    },
},
    {timestamps:true}
)

const User = mongoose.model('User',UserSchema)
export default User;