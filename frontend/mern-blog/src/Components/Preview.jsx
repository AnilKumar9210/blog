import React, { useContext, useEffect, useState } from "react";
import "./Preview.css";
import toast from "react-hot-toast";
import profile from "../assets/user.png";
import { appContext } from "../Context/context";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";

const socket = io("https://blog-backend-yk6g.onrender.com");

const Preview = () => {
  
    const location = useLocation();
  
    const { blog , from} = location.state || {};


  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(blog?.activity?.likes || 0);
  const [openComments, setOpenComments] = useState(false);
  const [comment, setComment] = useState([]);
  const [cmt, setCmt] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [cmtLoading, setCmtLoading] = useState(false);

  const { userDetails } = useContext(appContext);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: "sharing this blog", url });
      } catch (err) {
        console.log(err);
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    }
  };

  const fetchComments = async (blogId) => {
    setCmtLoading(true);
    const res = await fetch(
      `https://blog-backend-yk6g.onrender.com/blog/allComments/${blogId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!res.ok) {
      toast.error("Failed to fetch comments");
      return;
    }

    const data = await res.json();
    setComment(data.allComments);
    setCmtLoading(false);
  };

  // useEffect (()=> {
  //   if (blog.activity.likedBy.inlcudes (userDetails.id)) {
  //     setLiked (true);
  //   }
  // }, [])

  const postComment = async (blogId) => {
    const res = await fetch(`https://blog-backend-yk6g.onrender.com/blog/comment/${blogId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        comment: cmt,
        userId: userDetails._id,
      }),
    });

    const data = await res.json();
    // console.log(data);
  };

  // handling likes of blogs

  const handleLike = async (blogId) => {
    // console.log(blogId, userDetails._id);
    const res = await fetch(`https://blog-backend-yk6g.onrender.com/blog/like/${blogId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        userId: userDetails._id,
      }),
    });

    const data = await res.json();
    setLiked(data.success);
    setLikeCount(data.likes);
    // console.log(data);
  };

  // Deleting comments

  const deleteComment = async (commentId, blogId) => {
    const res = await fetch(
      `https://blog-backend-yk6g.onrender.com/blog/deleteComment/${commentId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          blogId,
        }),
      }
    );
    const data = await res.json();
    // console.log(data);
  };

  useEffect(() => {
    const closeMenu = () => setSelectedIndex(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  useEffect(() => {
    if (!blog?._id) return;

    const handler = (data) => {
      if (data.blogId === blog._id) {
        setLikeCount(data.likes);
      }
    };

    socket.on("likeUpdated", handler);
    return () => socket.off("likeUpdated", handler);
  }, [blog?._id]);

  useEffect(() => {
    socket.on("commentAdded", (data) => {
      setComment((prev) => [...prev, data.comment]);
    });

    return () => socket.off("commentAdded");
  }, []);

  useEffect(() => {
    socket.on("commentDeleted", (data) => {
      setComment((prev) => prev.filter((cmt) => cmt._id !== data.commentId));
    });

    return () => socket.off("commentDeleted");
  }, []);

  return (
    <div className="preview">
      <>
        <h1 className="blog-heading">{blog?.title}</h1>
        <div className="banner">
          <img src={blog?.imageUrl} alt="" />
        </div>
        
        {/* <section className="preview-content">
        {blog.content}
      </section> */}
        <div
          className="preview-content"
          dangerouslySetInnerHTML={{ __html: blog?.content }}
        />
        <div className="line"></div>
        <div className={`${from === 'blog'?"hold-interactions" : 'none'}`}>
          <div className="blog-author">
            <span className="img">
              <div className="full">

              <img src={blog?.profilePic} alt="" />
              </div>
              <div className="flex-direction">
              <h5>{blog?.author}</h5>
              <span>{blog?.userName}</span>
              </div>
            </span>
            <span>
              Posted on :{" "}
              {blog?.createdAt
                ? new Date(blog.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "1 jan 2026"}
            </span>
          </div>
          <div className="reactions">
            <div className="interaction">
              <div class="like-dislike-container">
                <div class="icons-box">
                  <div class="icons">
                    <label
                      onClick={() => {
                        handleLike(blog?._id);
                      }}
                      class="btn-label"
                      for="like-checkbox"
                    >
                      <span class="like-text-content">{likeCount}</span>

                      <svg
                        class="svgs"
                        id="icon-like-solid"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <path d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192H96c17.7 0 32 14.3 32 32V448c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32z"></path>
                      </svg>
                      <svg
                        class="svgs"
                        id="icon-like-regular"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <path d="M323.8 34.8c-38.2-10.9-78.1 11.2-89 49.4l-5.7 20c-3.7 13-10.4 25-19.5 35l-51.3 56.4c-8.9 9.8-8.2 25 1.6 33.9s25 8.2 33.9-1.6l51.3-56.4c14.1-15.5 24.4-34 30.1-54.1l5.7-20c3.6-12.7 16.9-20.1 29.7-16.5s20.1 16.9 16.5 29.7l-5.7 20c-5.7 19.9-14.7 38.7-26.6 55.5c-5.2 7.3-5.8 16.9-1.7 24.9s12.3 13 21.3 13L448 224c8.8 0 16 7.2 16 16c0 6.8-4.3 12.7-10.4 15c-7.4 2.8-13 9-14.9 16.7s.1 15.8 5.3 21.7c2.5 2.8 4 6.5 4 10.6c0 7.8-5.6 14.3-13 15.7c-8.2 1.6-15.1 7.3-18 15.1s-1.6 16.7 3.6 23.3c2.1 2.7 3.4 6.1 3.4 9.9c0 6.7-4.2 12.6-10.2 14.9c-11.5 4.5-17.7 16.9-14.4 28.8c.4 1.3 .6 2.8 .6 4.3c0 8.8-7.2 16-16 16H286.5c-12.6 0-25-3.7-35.5-10.7l-61.7-41.1c-11-7.4-25.9-4.4-33.3 6.7s-4.4 25.9 6.7 33.3l61.7 41.1c18.4 12.3 40 18.8 62.1 18.8H384c34.7 0 62.9-27.6 64-62c14.6-11.7 24-29.7 24-50c0-4.5-.5-8.8-1.3-13c15.4-11.7 25.3-30.2 25.3-51c0-6.5-1-12.8-2.8-18.7C504.8 273.7 512 257.7 512 240c0-35.3-28.6-64-64-64l-92.3 0c4.7-10.4 8.7-21.2 11.8-32.2l5.7-20c10.9-38.2-11.2-78.1-49.4-89zM32 192c-17.7 0-32 14.3-32 32V448c0 17.7 14.3 32 32 32H96c17.7 0 32-14.3 32-32V224c0-17.7-14.3-32-32-32H32z"></path>
                      </svg>
                      <div class="fireworks">
                        <div class="checked-like-fx"></div>
                      </div>
                    </label>
                  </div>

                  <div
                    class="icons"
                    onClick={() => {
                      setOpenComments(true);
                      fetchComments(blog?._id);
                    }}
                  >
                    <label class="btn-label" for="">
                      <div class="fireworks">
                        <div class="checked-dislike-fx"></div>
                      </div>
                      <svg
                        className="svg"
                        class="w-6 h-6 text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M3.559 4.544c.355-.35.834-.544 1.33-.544H19.11c.496 0 .975.194 1.33.544.356.35.559.829.559 1.331v9.25c0 .502-.203.981-.559 1.331-.355.35-.834.544-1.33.544H15.5l-2.7 3.6a1 1 0 0 1-1.6 0L8.5 17H4.889c-.496 0-.975-.194-1.33-.544A1.868 1.868 0 0 1 3 15.125v-9.25c0-.502.203-.981.559-1.331ZM7.556 7.5a1 1 0 1 0 0 2h8a1 1 0 0 0 0-2h-8Zm0 3.5a1 1 0 1 0 0 2H12a1 1 0 1 0 0-2H7.556Z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <svg
                onClick={share}
                className="svg"
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
                  d="m15.141 6 5.518 4.95a1.05 1.05 0 0 1 0 1.549l-5.612 5.088m-6.154-3.214v1.615a.95.95 0 0 0 1.525.845l5.108-4.251a1.1 1.1 0 0 0 0-1.646l-5.108-4.251a.95.95 0 0 0-1.525.846v1.7c-3.312 0-6 2.979-6 6.654v1.329a.7.7 0 0 0 1.344.353 5.174 5.174 0 0 1 4.652-3.191l.004-.003Z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className={`comment-section ${openComments ? "open" : ""}`}>
          <button
            class="button close-btn"
            onClick={() => setOpenComments(false)}
          >
            <span class="X"></span>
            <span class="Y"></span>
            <div class="close">Close</div>
          </button>

          <h2>Comments</h2>
          <div className="comments">
            {cmtLoading ? (
              <div class="loader">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              comment.map((val, index) => {
                return (
                  <div className="cmt" key={val._id}>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedIndex === val._id) {
                          setSelectedIndex(null);
                          return;
                        }
                        setSelectedIndex(val._id);
                      }}
                    >
                      {val.comment}
                    </span>
                    <img src={profile} alt="" />
                    {selectedIndex === val._id && (
                      <div className="alter">
                        <button
                          onClick={() => {
                            deleteComment(val._id, blog._id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <div className="create-comment">
            <div>
              <span>
                <img
                  src="https://miro.medium.com/v2/resize:fill:40:40/1*dmbNkD5D-u45r44go_cf0g.png"
                  alt=""
                />
              </span>
              Write your opinion
            </div>
          </div>

          <div class="messageBox">
            <div class="fileUploadWrapper">
              <input name="file" id="file" type="file" />
            </div>
            <input
              id="messageInput"
              onChange={(e) => setCmt(e.target.value)}
              type="text"
              value={cmt}
              placeholder="What are your thoughts ?"
              required=""
            />
            <button
              id="sendButton"
              onClick={() => {
                postComment(blog._id);
                setComment((prev) => [...prev, cmt]);
                setCmt("");
              }}
            >
              <svg
                viewBox="0 0 664 663"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"
                  fill="none"
                ></path>
                <path
                  d="M646.293 331.888L17.7538 17.6187L155.245 331.888M646.293 331.888L17.753 646.157L155.245 331.888M646.293 331.888L318.735 330.228L155.245 331.888"
                  stroke="#6c6c6c"
                  stroke-width="33.67"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
            </button>
          </div>
        </div>
        {/* <div className="line"></div> */}
      </>
    </div>
  );
};

export default Preview;
