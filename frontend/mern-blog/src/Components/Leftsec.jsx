import React, { useContext, useEffect, useState } from "react";
import "./Leftsec.css";
import {motion} from 'framer-motion'
import { appContext } from "../Context/context";
import { useNavigate } from "react-router-dom";

const Leftsec = () => {

  const {setCategory} = useContext (appContext);

  const navigate = useNavigate ()

  const  container = {
    hidden:{opacity:0},
    visible :{opacity :1,tansition:{staggeChildren:0.15, delayChildred:1}}
  }
  const  item = {
    hidden:{opacity:0,y:60},
    visible :{opacity :1,y:0}
  }

  const [trendings,setTrendings] = useState ([]);
  const [trendLoad,setTrendLoad] = useState (false);

  useEffect (()=> {
    async function fetchTrendings () {
      setTrendLoad (true)
      try {
        const res = await fetch ("https://blog-backend-yk6g.onrender.com/blog/trending", {
          method:"GET",
          headers : {
            "Content-Type": "application/json",
          }
        })
        const data = await res.json ();
        setTrendings (data.trendingBlogs);
        // console.log (data);
      } catch (e) {
        console.log(e)
      } finally {
        setTrendLoad (false)
      }
    }
    fetchTrendings ();
  },[])



  return (
    <div className="left-sec">
      <h3>Stories from all interests</h3>
      <div className="categories">
        <button onClick={() => setCategory ("Programming")}>Programming</button>
        <button onClick={() => setCategory ("Hollywood")}>Hollywood</button>
        <button onClick={() => setCategory ("Film making")}>Film making</button>
        <button onClick={() => setCategory ("Technology")}>Technology</button>
        <button onClick={() => setCategory ("Finance")}>Finance</button>
        <button onClick={() => setCategory ("Travel")}>Travel</button>
        <button onClick={() => setCategory ("Cooking")}>Cooking</button>
        <button onClick={() => setCategory ("Social media")}>Social media</button>
      </div>

      <h3>
        Trending
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
            d="M4 4.5V19a1 1 0 0 0 1 1h15M7 14l4-4 4 4 5-5m0 0h-3.207M20 9v3.207"
          />
        </svg>
      </h3>
      <motion.div className="trending" variants={container} initial="hidden" animate="visible">
        {trendLoad ? (
          <div class="loader">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
        ) : (
          trendings.map((blog, index) => (
            <motion.div key={blog._id} className="trending-card" variants={item}>
              <div className="trending-number">{index + 1}</div>
              <div className="trending-blog" onClick={(e)=> {
                e.stopPropagation ();
                e.preventDefault ()
                navigate ("/view-blog",{state : {blog,from:'blog'}})
              }}
              >
                <span className="all-user">
                  <div className="profilePic">

                  <img src={blog.profilePic} alt="" />
                  </div>
              <div className="authorDetails" onClick={(e)=> {
                e.stopPropagation ()
                navigate (`/profile/${blog.authorId}`,)
              }}>
                  <span className="blogAuthor">{blog.userName}</span>
                  <span className="userName">@{blog.author}</span>

                  </div>
            </span>
            <span className="trending-blog-title">{blog.title}</span>
          </div>
        </motion.div>))
        )}
      </motion.div>
    </div>
  );
};

export default Leftsec;
