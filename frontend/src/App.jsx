import './app.css';
import {Routes,Route,Navigate} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Navbar from './component/Navbar';
import Setting from './pages/Setting';
import SignUp from './pages/SignUp';

import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';
import { useEffect } from 'react';  
import {Loader} from 'lucide-react'
import { Toaster } from 'react-hot-toast';

function App() {

  const {authUser,checkAuth,isCheckingAuth}  = useAuthStore();
  const {theme} = useThemeStore();
  useEffect(()=>{
    checkAuth();
  },[checkAuth])

  // console.log({authUser});

  if(isCheckingAuth){
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader className='w-10 h-10 animate-spin text-blue-500' />
      </div>
    )
  }

  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route path='/' element={authUser ? <Home /> : <Navigate to="/login"/>} />
        <Route path='/login' element={authUser ? <Navigate to = "/" /> : <Login/>} />
        <Route path='/profile' element={authUser ? <Profile /> : <Navigate to="/login" />} />
        <Route path='/settings' element={<Setting />} />
        <Route path='/signup' element={authUser ? <Navigate to="/" /> : <SignUp />} />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
