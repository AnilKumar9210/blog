import React, { useContext, useEffect, useState } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import "./CreatePost.css";
import { hover, motion, scale } from "framer-motion";
import { appContext } from "../Context/context";
import { span } from "framer-motion/client";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

const EditDraft = () => {

    const loaction = useLocation ();

    const blog = loaction.state?.blog;
  const [postDetails, setPostDetails] = useState({
    title:"",
    prologue: "",
    option: "",
  });
  const [content, setContent] = useState("");
  const [file, setFile] = useState();
  const [draft, setDraft] = useState(false);
  const [imageUrl,setImageUrl] = useState ('');
  const [saveChanges,setSaveChanges] = useState (false)

  const [saving, setSaving] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggeChildren: 0.15, delayChildrend: 1 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 },
  };

  const { quill, quillRef } = useQuill();

  const { userDetails, setUserDetails } = useContext(appContext);

  useEffect(() => {
    const existingUser = localStorage.getItem("user");
    if (existingUser) {
      setUserDetails(JSON.parse(existingUser));
    }
    // console.log(JSON.parse(existingUser));
  }, []);

  useEffect (()=> {
    if (blog) {
        setPostDetails ({
            title:blog.title ||"",
            prologue:blog.prologue || "",
            option:blog.category || ""
        });

        setContent (blog.content || "");
        setImageUrl (blog.imageUrl || '')
    }
  },[blog])

 useEffect(() => {
  if (!quill) return;

  if (blog?.content) {
    quill.clipboard.dangerouslyPasteHTML(blog.content);
  }

  const handler = () => {
    setContent(quill.root.innerHTML);
  };

  quill.on("text-change", handler);

  return () => {
    quill.off("text-change", handler);
  };
}, [quill, blog]);


  const handleForm = (e) => {
    // console.log(e.target.value);
    setPostDetails({ ...postDetails, [e.target.name]: e.target.value });
  };

  const handlePostBlog = async (e) => {
    // if (!postDetails.option) {
    //   toast.error("choose a category");
    //   return;
    // }
    // if (
    //   !postDetails.prologue ||
    //   !postDetails.title ||
    //   !postDetails.title.length < 5 ||
    //   postDetails.prologue.length <= 10 ||
    //   content.length < 100
    // ) {
    //   toast.error("Please fill the valid details");
    //   return;
    // }

    // if (!file) {
    //   toast.error("Please upload an image");
    //   return;
    // }

    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    // console.log(userDetails);

    formData.append("authorId", userDetails._id);
    formData.append("prologue", postDetails.prologue);
    formData.append("image", file);
    formData.append("title", postDetails.title);
    formData.append("content", content);
    formData.append("category", postDetails.option);
    formData.append("author", userDetails.userName);
    formData.append("draft", draft);

    try {
      const res = await fetch("https://blog-backend-yk6g.onrender.com/blog/post", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      setContent("");
      setFile(null);
      setPostDetails({
        title: "",
        prologue: "",
        option: "",
      });

      setContent("");
      setFile(null);
      setDraft(false);

      const data = await res.json();
      // console.log(data);
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
      toast.success("Successfully Uploading");
    }
  };

  const saveEditedChanges = async (e) => {
    e.preventDefault ()
    // console.log("Hellow world")

  // if (!blog?._id) {
  //   toast.error("Blog ID missing");
  //   return;
  // }

  // if (!postDetails.title || !postDetails.prologue || !content) {
  //   toast.error("Please fill all required fields");
  //   return;
  // }

  setSaving(true);

  const formData = new FormData();

  formData.append("title", postDetails.title);
  formData.append("prologue", postDetails.prologue);
  formData.append("content", content);
  formData.append("category", postDetails.option);

  if (file) {
    formData.append("image", file);
  }

  try {
    const res = await fetch(
      `https://blog-backend-yk6g.onrender.com/blog/update/${blog._id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Update failed");
      return;
    }

    toast("Changes saved successfully ✅");
    setSaveChanges (true)
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong");
  } finally {
    setSaving(false);
  }
};


const postDraft = async (e)=> {
  e.preventDefault ()
  try {
    const res = await fetch (`https://blog-backend-yk6g.onrender.com/blog/post-draft/${blog._id}`, {
      method:"POST",
      headers : {
        "Content-Type": "application/json",
        Authorization : `Bearer ${localStorage.getItem ('token')}`
      },
      body : JSON.stringify ({
        userId:userDetails._id
      })
    });

    if (!res.ok) {
      toast.error ("Something went wrong");
      return
    }

    const data = await res.json ();
    // console.log(data);
    toast.success (data.message)
  } catch (error) {
    console.log(error)
  }
}



  return (
    <motion.div
      className="post"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className="blog-heading" variants={item}>
        Start creating your blog!
      </motion.h1>
      <motion.div className="actions">
        <div className="draft">
          <motion.button className="write">save changes</motion.button>
        </div>
        <button className="write" variants={item}>
          preview
        </button>
      </motion.div>
      <form >
        <motion.input
          variants={item}
          type="text"
          className="input-style"
          value={postDetails.title}
          onChange={handleForm}
          name="title"
          placeholder="Title"
          id=""
        />
        <motion.input
          variants={item}
          type="text"
          className="input-style"
          value={postDetails.prologue}
          onChange={handleForm}
          name="prologue"
          placeholder="A little prologue about the blog..."
          id=""
        />

        <motion.div>
          <motion.label
            class="custum-file-upload"
            htmlFor="file"
            variants={item}
          >
            <div class="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill=""
                viewBox="0 0 24 24"
              >
                <g stroke-width="0" id="SVGRepo_bgCarrier"></g>
                <g
                  stroke-linejoin="round"
                  stroke-linecap="round"
                  id="SVGRepo_tracerCarrier"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    fill=""
                    d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z"
                    clip-rule="evenodd"
                    fill-rule="evenodd"
                  ></path>{" "}
                </g>
              </svg>
            </div>
            <motion.div class="text" variants={item}>
              <span>upload image</span>
            </motion.div>
            <motion.input
              variants={item}
              type="file"
              id="file"
              name="file"
              onChange={(e) => {
                setFile(e.target.files[0]);
              }}
            />
          </motion.label>
          <motion.div className="dropdown" variants={item}>
            <span>category :</span>
            <select name="option" value={postDetails.option} onChange={handleForm} id="">
              <option value="">--choose--</option>
              <option value="Programming">Programming</option>
              <option value="Hollywood">Hollywood</option>
              <option value="Filmmaking">Film making</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Travel">Travel</option>
              <option value="Cooking">Cooking</option>
              <option value="Socialmedia">Social media</option>
            </select>
          </motion.div>
        </motion.div>
        <motion.div
          className="input-content"
          ref={quillRef}
          variants={item}
        ></motion.div>
        
        <motion.button 
        whileTap={{scale:0.85}} 
        whileHover={{scale:1.1}} 
        className="postBtn" 
        type="button" 
        onClick={saveChanges ? postDraft : saveEditedChanges}
        variants={item}
        >{saveChanges ? "Post" : "Save"}</motion.button>
        
      </form>
    </motion.div>
  );
};

export default EditDraft;
