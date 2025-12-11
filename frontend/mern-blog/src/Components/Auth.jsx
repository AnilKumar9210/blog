import React ,{useContext, useState} from "react";
import email from "../assets/email.png"
import google from '../assets/google.png'
import user from '../assets/user.png'
import './Auth.css'
import { useNavigate } from "react-router-dom";
import { appContext } from "../Context/context";
import { ToastContainer, toast } from "react-toastify";


const Auth = () => {
    const [show, setShow] = useState(false);
    const [signin,setSignIn] = useState (false);
    const [details,setDetails] = useState ({email:'',password:'',username:''});

    const {setUserDetails,userDetails,setIsLogin} = useContext (appContext);
    

    const navigate = useNavigate ()

    const handleChange = (e)=> {
      setDetails ({...details,[e.target.name]:e.target.value})
    }

    const handleSignIn = async ()=> {
      try {
        const res = await fetch ('http://localhost:3000/signup',{
          method:"POST",
          headers:{
            "Content-Type": "application/json",
          },
          body:JSON.stringify ({
            fullName:details.username.toLowerCase (),
            email:details.email,
            password:details.password,
          })
        })

        const data = await res.json ()

        if (!res.ok) {
          toast.error (`${data.message}`)
          return;
        }

        setDetails ({email:'',password:'',username:""});

        setSignIn (true)
      } catch (err) {
        console.error(err);
      }
    }


    const handleLogin = async()=> {
      try {
        const res = await fetch ('http://localhost:3000/login',{
          method:"POST",
          headers : {
            "Content-Type":"application/json",
          },
          body : JSON.stringify ({
            email:details.email,
            password:details.password
          })
        })

        const data  = await res.json ()
        console.log(data);

        setUserDetails (data.user);
        if (!res.ok) {
          toast.error (`${data.message}`)
          return;
        }

        localStorage.setItem ('token',data.token);
        localStorage.setItem ('user',JSON.stringify (data.user));
        setIsLogin (true)

        setDetails ({email:'',password:'',username:""});

        navigate ('/');
      } catch (err) {
        console.log(err)
      }
    }


  return (
    <div className="authentication">
      <ToastContainer/>
      {signin ? <h1>Welcome back.</h1>:<h1>Join us today</h1>}
      <div className="login">
        {!signin && <div className="email">
          <img src={user} alt="" />
          <input type="text" name="username" onChange={handleChange} placeholder="Username"/>
        </div>}
        <div className="email">
          <img src={email} alt="" />
          <input type="email" onChange={handleChange} name="email" placeholder="Email" />
        </div>
        <div className="pass">
          <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M8 10V7a4 4 0 1 1 8 0v3h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2-3a2 2 0 1 1 4 0v3h-4V7Zm2 6a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Z" clip-rule="evenodd"/>
</svg>

          <input
            type={show ? "text" : "password"}
            name="password"
            placeholder="Password"
            onChange={handleChange}
            id=""
          />
          <div
            onClick={() => {
              setShow(!show);
            }}
          >
            {!show ? (
              <svg
                class="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  stroke-width="2"
                  d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"
                />
                <path
                  stroke="currentColor"
                  stroke-width="2"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            ) : (
              <svg
                class="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3.933 13.909A4.357 4.357 0 0 1 3 12c0-1 4-6 9-6m7.6 3.8A5.068 5.068 0 0 1 21 12c0 1-3 6-9 6-.314 0-.62-.014-.918-.04M5 19 19 5m-4 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            )}
          </div>
        </div>
        {signin?<button onClick={handleLogin}>Login</button>:<button onClick={handleSignIn}>Sign in </button>}
        {signin && <span>Forgot password,<span className="link">Reset here.</span></span>}
        <div className="line"></div>
        <div className="google">
            <button onClick={()=>{toast.success ("error")}}><img src={google} alt="" /> Continue with google</button>
        </div>
        {signin ?<span>Don't have an account?<span className="link" onClick={()=> {setSignIn(!signin)}}>join us today.</span></span> : <span>Already have an account <span className="link" onClick={()=> setSignIn (!signin)}>login in here</span></span>}
      </div>
    </div>
  );
};

export default Auth;
