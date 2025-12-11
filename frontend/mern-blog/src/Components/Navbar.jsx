import React, { useContext, useEffect, useState } from "react";
import "./Navbar.css";
import logo from "../assets/quill.png";
import search from "../assets/search.png";
import { useNavigate } from "react-router-dom";
import { appContext } from "../Context/context";
import user from '../assets/user.png'

const Navbar = () => {
  const navigate = useNavigate();

  const {isLogin,setIsLogin} = useContext (appContext);

 

  const handlePostNav = ()=> {
    if (isLogin) {
      navigate ('/create-post')
    } else {
      navigate ('/auth')
    }
  }

  const handleLogout = ()=> {
    // console.log(localStorage.getItem ('token')) 
    localStorage.removeItem ('token');
    setIsLogin (false)
  }



  return (
    <nav>
      <div className="main-bar">
        <img src={logo} alt="" className="logo" />
        <div className="auth">
          <button className="write" onClick={handlePostNav}>
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
                d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
              />
            </svg>
            write
          </button>
          {!isLogin ? <button
            className="sign-in"
            onClick={() => {
              navigate("/auth");
            }}
          >
            Sign up
          </button> : <img src={user} alt="user" onClick={()=>{navigate ('profile')}}/>}
        </div>
      </div>
      <div className="search">
        <input type="text" name="search" placeholder="search here" />
        <img src={search} alt="" className="search-logo" />
      </div>
    </nav>
  );
};

export default Navbar;
