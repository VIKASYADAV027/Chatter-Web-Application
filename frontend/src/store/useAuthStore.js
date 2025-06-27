import {create} from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import {io} from 'socket.io-client'

const BASE_URL = "http://localhost:5001"

export const useAuthStore = create((set,get)=>({
    authUser: null,
    isSigningUp : false,
    isLoggingIn : false,
    isUpdatingProfile : false,

    isCheckingAuth:true,
    onlineUsers : [],
    socket:null,

    checkAuth: async () =>{
        try {
            const res = await axiosInstance.get('/auth/check');
            set({authUser:res.data})
            get().connectSocket();
        } catch (error) {
            set({authUser:null})
            console.error("Error checking authentication:", error);
        }
        finally{
            set({isCheckingAuth:false})
        }
    },

    SignUp: async (data)=>{
        set({isSigningUp:true});
        try {
            const res = await axiosInstance.post('/auth/signup', data);
            toast.success("Sign up successful");
            set({authUser:res.data});
            get().connectSocket();
            toast.success("Welcome to our platform!");
        } catch (error) {
            console.error("Error during sign up:", error);
            toast.error("Sign up failed");
        }
        finally {
            set({isSigningUp:false});
        }
    },

    Logout: async () =>{
        try {
            await axiosInstance.post('/auth/logout');
            set({authUser:null});
            toast.success("Logout successful");
            get.disconnectSocket();
        } catch (error) {
            console.error("Error during logout:", error);
            toast.error("Logout failed");
        }
    }
    ,
    login: async (data) => {
        set({ isLoggingIn: true });
        try {
        const res = await axiosInstance.post("/auth/login", data);
        set({ authUser: res.data });
        toast.success("Logged in successfully");
        get.connectSocket();
        } catch (error) {
        toast.error(error.response.data.message);
        } finally {
        set({ isLoggingIn: false });
        }
    },

    updateProfile: async (data)=>{
        set({isUpdatingProfile:true})
        try {
            const res = await axiosInstance.put('auth/update-profile',data);
            set({authUser:res.data});
            toast.success("Profile updated successfully");  
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Profile update failed");
        }
        finally {
            set({isUpdatingProfile:false})
        }
    },

    connectSocket : async ()=>{
        const {authUser} = get();

        if(!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL,{
            query:{
                userId:authUser._id
            }
        });
        socket.connect();
        set({socket:socket});

        socket.on("getOnlineUsers",(userIds)=>{
            set({onlineUsers:userIds})
        })
    },

    disconnectSocket : ()=>{
        if(get().socket?.connected) get().socket?.disconnect();
    }
}))