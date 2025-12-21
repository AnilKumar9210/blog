import React, { useContext, useEffect, useState } from "react";
import "./Rightsec.css";
import { appContext } from "../Context/context";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Rightsec = () => {
  const [liked, setLiked] = useState(false);
  const [currentBlogs, setCurrentBlogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};


const item = {
  hidden: {
    opacity: 0,
    y: 60
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};



  const navigate = useNavigate();

  const { category, blogs, setCategory, setBlogs } = useContext(appContext);

  useEffect(() => {
    setLoading(true);
    async function getBlogs() {
      try {
        const res = await fetch("https://blog-backend-yk6g.onrender.com/blog/blogs", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          toast.error ("something went wrong")
          return
        }
  
        const data = await res.json();
        let filtered=data.allBlogs.filter ((blog)=> blog.draft === false ||blog.draft === "false") || []
        setBlogs(filtered);
        // console.log(data.allBlogs ,data.allBlogs.filter ((blog)=> blog.draft === false) || [])
        setCurrentBlogs(filtered)
        // console.log(data);
      } catch  (err) {
        console.error("Error fetching blogs:", err);
      } finally {

        setLoading(false);
      }
    }
    getBlogs();
  }, []);

 useEffect(() => {
  if (category === "home") {
    setCurrentBlogs(blogs);
  } else {
    setCurrentBlogs(
      blogs.filter((blog) => blog.category === category)
    );
  }
}, [category, blogs]);


  const handlePageNav = (blog, e) => {
    e.stopPropagation();
    navigate("/view-blog", { state: { blog,from:"blog" } });
  };

  return (
    <div className="right-sec">
      <h4 onClick={() => setCategory("home")}>home</h4>
      <motion.div className="blogs" variants={container} initial="hidden" animate="visible">
        {loading ? (
          <div className="blog-loader">
            <div className="box1"></div>
            <div className="box2"></div>
            <div className="box3"></div>
          </div>
        ) : (
          currentBlogs.map((blog, index) => (
        
            <motion.div
            // variants={item}
              className="blog"
              key={blog._id}
              layout={false}
              onClick={(e) => {
                handlePageNav(blog, e);
              }}
            >
              {/* {console.log(blog)} */}
              <motion.div className="blogContent">
                <span className="all-user">
                  <div className="profilePic">
                  <img src={blog.profilePic} alt=""/>
                  </div>
                  <div className="authorDetails"  onClick={(e)=> {
                e.stopPropagation ()
                navigate (`/profile/${blog.authorId}`)
              }}>
                  <span className="blogAuthor">{blog.userName}</span>
                  <span className="userName">@{blog.author}</span>

                  </div>
                </span>
                <span className="blog-title">{blog.title}</span>
               <span className="blogPrologue">{blog.prologue}</span>
                <div className="bb">
                  <button className="type">{blog.category}</button>
                  <span className="like" onClick={() => setLiked(!liked)}>
                    {!liked ? (
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
                          d="M12.01 6.001C6.5 1 1 8 5.782 13.001L12.011 20l6.23-7C23 8 17.5 1 12.01 6.002Z"
                        />
                      </svg>
                    ) : (
                      <svg
                        class="w-6 h-6 text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="m12.75 20.66 6.184-7.098c2.677-2.884 2.559-6.506.754-8.705-.898-1.095-2.206-1.816-3.72-1.855-1.293-.034-2.652.43-3.963 1.442-1.315-1.012-2.678-1.476-3.973-1.442-1.515.04-2.825.76-3.724 1.855-1.806 2.201-1.915 5.823.772 8.706l6.183 7.097c.19.216.46.34.743.34a.985.985 0 0 0 .743-.34Z" />
                      </svg>
                    )}
                    <span>{blog.likes}</span>
                  </span>
                </div>
              </motion.div>
              <img src={blog.imageUrl} alt="" loading="lazy" />
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default Rightsec;
