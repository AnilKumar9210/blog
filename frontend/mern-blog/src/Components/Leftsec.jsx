import React, { useContext, useEffect, useState } from "react";
import "./Leftsec.css";
import  user from '../assets/user.png'
import { appContext } from "../Context/context";

const Leftsec = () => {

  const {setCategory} = useContext (appContext);

  const [trendings,setTrendings] = useState ([]);
  const [trendLoad,setTrendLoad] = useState (false);

  useEffect (()=> {
    async function fetchTrendings () {
      setTrendLoad (true)
      try {
        const res = await fetch ("http://localhost:3000/blog/trending", {
          method:"GET",
          headers : {
            "Content-Type": "application/json",
          }
        })
        const data = await res.json ();
        setTrendings (data.trendingBlogs);
        console.log (data);
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
      <div className="trending">
        {trendLoad ? (
          <p>Loading...</p>
        ) : (
          trendings.map((blog, index) => (
            <div key={blog._id} className="trending-card">
              <div className="trending-number">{index + 1}</div>
              <div className="trending-blog">
                <span className="all-user">
                  <div className="profilePic">

                  <img src={blog.profilePic} alt="" />
                  </div>
              <div className="authorDetails">
                  <span className="blogAuthor">{blog.userName}</span>
                  <span className="userName">@{blog.author}</span>

                  </div>
            </span>
            <span className="trending-blog-title">{blog.title}</span>
          </div>
        </div>))
        )}
      </div>
    </div>
  );
};

export default Leftsec;
