import { useContext, useEffect, useState } from 'react'
import './App.css'
import Navbar from './Components/Navbar'
import { Link,Routes,Route } from 'react-router-dom'
import Auth from './Components/Auth'
import Home from './Components/Home'
import CreatePost from './Components/CreatePost'
import Preview from './Components/Preview'
import { appContext } from './Context/context'
import Profile from './Components/Profile'

function App() {

  const {setUserDetails} = useContext (appContext);

  useEffect (()=> {
    const user = localStorage.getItem ('user');
    if (user) {
      setUserDetails (JSON.parse (user));
      console.log(user)
    }
  },[])

  return (
    <>
    <Navbar/>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/auth" element={<Auth/>}/>
      <Route path='/create-post' element={<CreatePost/>}/>
      <Route path='/view-blog' element={<Preview/>} />
      <Route path='/profile' element={<Profile/>} />
    </Routes>
    </>
  )
}

export default App
