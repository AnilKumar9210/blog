import React, { useContext, useEffect, useReducer, useState } from "react";
import "./Navbar.css";
import logo from "../assets/quill.png";
import search from "../assets/search.png";
import { useNavigate } from "react-router-dom";
import { appContext } from "../Context/context";
import debouncing from "./Debounce";

const Navbar = () => {
  const navigate = useNavigate();

  const {isLogin,setIsLogin,userDetails,setProfile} = useContext (appContext);

  const [query,setQuery] = useState ("");
  const [getUser,setGetUser] = useState (false)

  const [results,setResults]= useState ({blogs:[],users:[]});

  const deDebounceQuery = debouncing (query,300);

  // useEffect (()=>{navigate ('/auth')},[])


  useEffect (()=> {
    const fetchSearch = async ()=> {

      if (deDebounceQuery.trim () === "") {
        setResults ({blogs:[],users:[]});
        return;
      }

      const res = await fetch (`http://localhost:3000/search?query=${deDebounceQuery}`,{
        method:"GET",
        headers : {
          "Content-Type":"application/json"
        }
      });
      const data = await res.json ()
      console.log(data)
      setResults (data)
    }

    fetchSearch ()
  },[deDebounceQuery])

 

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
          </button> : <div className="width">

          <img src={userDetails?.profile_pic} alt="user" onClick={()=>{
            navigate (`/profile/${userDetails._id}`,)}}/>
            </div>
            }
        </div>
      </div>
      <div className="search">
        <input type="text" name="search" placeholder="search here" onChange={(e)=> {
          setGetUser (true);
          if (e.target.value === "") setGetUser (false)
          console.log(e.target.value)
          setQuery (e.target.value)}} />
        <img src={search} alt="" className="search-logo" />
        {(getUser) &&<div className="search-results">
          {results.users.length > 0 && <div className="user-results">
          <h5>users : </h5>
            {results.users.map ((user)=>(
            <span>@{user.personal_info.userName}</span>
            ))}
          </div>}
          {results.blogs.length > 0 && <div className="blogs-results">
          <h5>posts :</h5>
            {results.blogs.map ((blog)=>(
            <span>{blog.title}</span>
            ))}
          </div>}
        </div>}
      </div>
    </nav>
  );
};

export default Navbar;
