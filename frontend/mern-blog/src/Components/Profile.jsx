import React, { useContext, useEffect, useState } from "react";
import "./Profile.css";
import { appContext } from "../Context/context";
import { useNavigate, useParams } from "react-router-dom";
import user from "../assets/user.png";
import email from "../assets/email.png";
import arroba from "../assets/arroba.png";
import { ToastContainer, toast } from "react-toastify";

const Profile = () => {
  const { userDetails,setUserDetails,setIsLogin } = useContext(appContext);
  const navigate = useNavigate();


  const {userId} = useParams ()

  const [userBlogs, setUserBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [update, setUpdate] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [profileLoading,setProfileLoading] = useState (false)

  const [file, setFile] = useState(null);
  const [editData, setEditData] = useState({});
  const [profile,setProfile] = useState ({})

  const [links, setLinks] = useState({});

  const handleFileChange = (e) => { 
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;

    setFile (selectedFile)

    const imageUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl (imageUrl);
  }

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleLinkChange = (e) => {
    setLinks({ ...links, [e.target.name]: e.target.value });
  };

  const handlePageNav = (blog, e) => {
    e.stopPropagation();
    navigate("/view-blog", { state: { blog } });
  };

  useEffect (()=> {},[userDetails])

  const handleLogout = ()=> {
    localStorage.removeItem ('token');
    setIsLogin (false)
    navigate ('/auth')
  }

  useEffect(() => {

    async function fetchUser () {
      setProfileLoading (true)
      setLoading (true)
      let blogs,data;
      try {
        const res = await fetch (`http://localhost:3000/user/${userId}`,{
          method:"GET",
          headers : {
            "Content-Type" : "application/json"
          },
        })

        data = await res.json ();
        console.log("user-details --> ",data.userProfile);
        setProfile (data.userProfile)
        blogs = data.userProfile.blogs
      } catch (err) {
        console.log(err)
      } finally {
        setProfileLoading (false)
      }

      try {
        const res = await fetch("http://localhost:3000/blog/getBlogsById/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            blogIds: blogs,
          }),
        });
        const resData = await res.json();
        setEditData({
          userName: data.userProfile.personal_info.userName,
          email: data.userProfile.personal_info.email,
          bio: data.userProfile.personal_info.bio,
          fullName: data.userProfile.personal_info.fullName,
        });

        setLinks({
          instagram: data.userProfile.social_links.instagram,
          youtube: data.userProfile.social_links.youtube,
          twitter: data.userProfile.social_links.twitter,
          facebook: data.userProfile.social_links.facebook,
          github: data.userProfile.social_links.github,
          website: data.userProfile.social_links.website,
        });

        console.log(resData);

        setUserBlogs(resData.blogs);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    
    fetchUser ();
    // fetchUserBlogs();
  }, [userId]);


  const updateUserProfile = async ()=> {

    console.log(links,editData)


    const formData = new FormData ();
    formData.append ('profile_pic',file);
    formData.append ('fullName',editData.fullName || userDetails.personal_info.fullName);
    formData.append ('userName',editData.userName || userDetails.personal_info.userName);
    formData.append ('email',editData.email || userDetails.personal_info.email);
    formData.append ('bio',editData.bio || userDetails.personal_info.bio)
    formData.append ('instagram',links.instagram || userDetails.social_links.instagram);
      formData.append ('youtube',links.youtube || userDetails.social_links.youtube);
      formData.append ('twitter',links.twitter || userDetails.social_links.twitter);
      formData.append ('facebook',links.facebook || userDetails.social_links.facebook);
      formData.append ('github',links.github || userDetails.social_links.github);
      formData.append ('website',links.website || userDetails.social_links.website);
    
    try {
      const res = await fetch (`http://localhost:3000/updateProfile/${userDetails._id}`, {
        method:"POST",
        headers : {
          Authorization:`Bearer ${localStorage.getItem ('token')}`
        },
        body: formData
      })

      const data = await res.json ()
      console.log(data)
      localStorage.removeItem ('user')

      localStorage.setItem ('user',JSON.stringify (data.updatedUser));

      setUserDetails (data.updatedUser);
      setProfile (data.updatedUser)
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <section className="user-profile-section">
      {!update ? (
        <div className="profile-section">
          <div className="blogs-posted">
            <div className="blogs-posted-heading">
              <h5>
                Blogs Published
                <div className="underline"></div>
              </h5>
            </div>
            <div className="blogs-list">
              {loading ? (
                <div className="blog-loader">
                  <div className="box1"></div>
                  <div className="box2"></div>
                  <div className="box3"></div>
                </div>
              ) : (
                userBlogs.map((blog, index) => (
                  <div
                    className="blog"
                    key={index}
                    onClick={(e) => {
                      handlePageNav(blog, e);
                    }}
                  >
                    <div className="blogContent">
                      <span className="all-user">
                        <div className="profilePic">
                          <img src={blog.profilePic} alt="" />
                        </div>
                        <div className="authorDetails">
                          <span className="blogAuthor">{blog.author}</span>
                          <span className="userName">@{blog.userName}</span>
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
                    </div>
                    <img src={blog.imageUrl} alt="" />
                  </div>
                ))
              )}
            </div>
          </div>

          {profileLoading ? (
            <div className="loader">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <div className="user-details">
              <div className="user-profile-pic">
                <img src={profile.profile_pic} alt="" />
              </div>
              <div className="user-info">
                <h4>{profile.personal_info?.fullName}</h4>
                <span>@{profile.personal_info?.userName}</span>
              </div>
              <div className="posts">
                <span>{userBlogs.length} Blogs Posted</span>
              </div>
              {userId === userDetails._id && <div className="edit">
                <button
                  className="Btn"
                  onClick={() => {
                    setUpdate(true);
                  }}
                >
                  Edit Profile
                  <svg
                    className="svgIcon"
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
                      stroke-linecap="square"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 19H5a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h1m4-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm7.441 1.559a1.907 1.907 0 0 1 0 2.698l-6.069 6.069L10 19l.674-3.372 6.07-6.07a1.907 1.907 0 0 1 2.697 0Z"
                    />
                  </svg>
                </button>
              </div>}
              <div className="bio">
                <p>
                  {profile.personal_info?.bio}
                </p>
              </div>
              <div className="contact-info">
                <h5 className="h5">
                  Contact Me
                  <div className="underline"></div>
                </h5>
                <div className="socials">
                  {profile.social_links.instagram &&<span className="instagram"><a href={userDetails.social_links?.instagram} target="__blank">

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
                        fill="currentColor"
                        fill-rule="evenodd"
                        d="M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Zm5-3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm7.597 2.214a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z"
                        clip-rule="evenodd"
                        />
                    </svg>
                        </a>
                  </span>}
                  {profile.social_links.youtube &&<span className="youtube"><a href={profile.social_links?.youtube} target="__blank">

                    <svg
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
                        d="M21.7 8.037a4.26 4.26 0 0 0-.789-1.964 2.84 2.84 0 0 0-1.984-.839c-2.767-.2-6.926-.2-6.926-.2s-4.157 0-6.928.2a2.836 2.836 0 0 0-1.983.839 4.225 4.225 0 0 0-.79 1.965 30.146 30.146 0 0 0-.2 3.206v1.5a30.12 30.12 0 0 0 .2 3.206c.094.712.364 1.39.784 1.972.604.536 1.38.837 2.187.848 1.583.151 6.731.2 6.731.2s4.161 0 6.928-.2a2.844 2.844 0 0 0 1.985-.84 4.27 4.27 0 0 0 .787-1.965 30.12 30.12 0 0 0 .2-3.206v-1.516a30.672 30.672 0 0 0-.202-3.206Zm-11.692 6.554v-5.62l5.4 2.819-5.4 2.801Z"
                        clip-rule="evenodd"
                      />
                    </svg>
                        </a>
                  </span>}
                  {profile.social_links.facebook &&<span className="facebook"><a href={profile.social_links?.facebook} target="__blank">

                    <svg
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
                        d="M13.135 6H15V3h-1.865a4.147 4.147 0 0 0-4.142 4.142V9H7v3h2v9.938h3V12h2.021l.592-3H12V6.591A.6.6 0 0 1 12.592 6h.543Z"
                        clip-rule="evenodd"
                        />
                    </svg>
                        </a>
                  </span>}
                  {profile.social_links.twitter &&<span className="twitter"><a href={profile.social_links?.twitter} target="__blank">

                    <svg
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
                        d="M22 5.892a8.178 8.178 0 0 1-2.355.635 4.074 4.074 0 0 0 1.8-2.235 8.343 8.343 0 0 1-2.605.981A4.13 4.13 0 0 0 15.85 4a4.068 4.068 0 0 0-4.1 4.038c0 .31.035.618.105.919A11.705 11.705 0 0 1 3.4 4.734a4.006 4.006 0 0 0 1.268 5.392 4.165 4.165 0 0 1-1.859-.5v.05A4.057 4.057 0 0 0 6.1 13.635a4.192 4.192 0 0 1-1.856.07 4.108 4.108 0 0 0 3.831 2.807A8.36 8.36 0 0 1 2 18.184 11.732 11.732 0 0 0 8.291 20 11.502 11.502 0 0 0 19.964 8.5c0-.177 0-.349-.012-.523A8.143 8.143 0 0 0 22 5.892Z"
                        clip-rule="evenodd"
                        />
                    </svg>
                        </a>
                  </span>}
                  {profile.social_links.github && <span className="github"><a href={profile.social_links?.github} target="__blank">

                    <svg
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
                        d="M12.006 2a9.847 9.847 0 0 0-6.484 2.44 10.32 10.32 0 0 0-3.393 6.17 10.48 10.48 0 0 0 1.317 6.955 10.045 10.045 0 0 0 5.4 4.418c.504.095.683-.223.683-.494 0-.245-.01-1.052-.014-1.908-2.78.62-3.366-1.21-3.366-1.21a2.711 2.711 0 0 0-1.11-1.5c-.907-.637.07-.621.07-.621.317.044.62.163.885.346.266.183.487.426.647.71.135.253.318.476.538.655a2.079 2.079 0 0 0 2.37.196c.045-.52.27-1.006.635-1.37-2.219-.259-4.554-1.138-4.554-5.07a4.022 4.022 0 0 1 1.031-2.75 3.77 3.77 0 0 1 .096-2.713s.839-.275 2.749 1.05a9.26 9.26 0 0 1 5.004 0c1.906-1.325 2.74-1.05 2.74-1.05.37.858.406 1.828.101 2.713a4.017 4.017 0 0 1 1.029 2.75c0 3.939-2.339 4.805-4.564 5.058a2.471 2.471 0 0 1 .679 1.897c0 1.372-.012 2.477-.012 2.814 0 .272.18.592.687.492a10.05 10.05 0 0 0 5.388-4.421 10.473 10.473 0 0 0 1.313-6.948 10.32 10.32 0 0 0-3.39-6.165A9.847 9.847 0 0 0 12.007 2Z"
                        clip-rule="evenodd"
                        />
                    </svg>
                        </a>
                  </span>}
                  {profile.social_links.website &&<span className="website"><a href={profile.social_links?.website} target="__blank">

                    <svg
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
                        d="M8.64 4.737A7.97 7.97 0 0 1 12 4a7.997 7.997 0 0 1 6.933 4.006h-.738c-.65 0-1.177.25-1.177.9 0 .33 0 2.04-2.026 2.008-1.972 0-1.972-1.732-1.972-2.008 0-1.429-.787-1.65-1.752-1.923-.374-.105-.774-.218-1.166-.411-1.004-.497-1.347-1.183-1.461-1.835ZM6 4a10.06 10.06 0 0 0-2.812 3.27A9.956 9.956 0 0 0 2 12c0 5.289 4.106 9.619 9.304 9.976l.054.004a10.12 10.12 0 0 0 1.155.007h.002a10.024 10.024 0 0 0 1.5-.19 9.925 9.925 0 0 0 2.259-.754 10.041 10.041 0 0 0 4.987-5.263A9.917 9.917 0 0 0 22 12a10.025 10.025 0 0 0-.315-2.5A10.001 10.001 0 0 0 12 2a9.964 9.964 0 0 0-6 2Zm13.372 11.113a2.575 2.575 0 0 0-.75-.112h-.217A3.405 3.405 0 0 0 15 18.405v1.014a8.027 8.027 0 0 0 4.372-4.307ZM12.114 20H12A8 8 0 0 1 5.1 7.95c.95.541 1.421 1.537 1.835 2.415.209.441.403.853.637 1.162.54.712 1.063 1.019 1.591 1.328.52.305 1.047.613 1.6 1.316 1.44 1.825 1.419 4.366 1.35 5.828Z"
                        clip-rule="evenodd"
                        />
                    </svg>
                        </a>
                  </span>}
                </div>
              </div>
              <span>joined on 1 jan 2029</span>
              
          <button class="logout" onClick={handleLogout}> log out
</button>
            </div>
          )}
        </div>
      ) : (
        <div className="edit-section">
          <div className="edit-profile-pic">
            <div className="edit-heading">
              <h5 className="h5">
                Edit Pofile
                <div className="undeline"></div>
              </h5>
            </div>
            <img
              src={previewUrl ? previewUrl : profile.profile_pic}
              alt="profile picture"
            />
            <div className="upload-section">
              <button className="upload">Upload</button>
              <input
                className="input"
                type="file"
                onChange={handleFileChange}
                name="profile"
                id=""
              />
            </div>
          </div>
          <div className="edit-profile">
            <div className="edit-input">
              <div>
                <div className="email">
                  <img src={user} alt="" />
                  <input
                    type="text"
                    name="fullName"
                    onChange={handleEditChange}
                    placeholder={editData.fullName}
                  />
                </div>
                <div className="email">
                  <img src={email} alt="" />
                  <input
                    type="email"
                    onChange={handleEditChange}
                    // value={editData.email}
                    name="email"
                    placeholder={editData.email}
                  />
                </div>
              </div>
              <div
                className="email"
                style={{
                  justifyContent: "flex-start",
                  paddingLeft: "12px",
                  width: "99%",
                }}
              >
                <img src={arroba} alt="" />
                <input
                  type="userName"
                  onChange={handleEditChange}
                  placeholder={editData.userName}
                  name="userName"
                />
              </div>
              <span className="info">This name is used to search the user</span>
            </div>
            <div className="bio-input">
              <textarea name="bio" id="" onChange={handleEditChange}></textarea>
              <span className="info">200 words left</span>
            </div>
            <h5>Add your social links</h5>
            <div className="edit-socials">
              <div className="social-link">
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
                    fill="currentColor"
                    fill-rule="evenodd"
                    d="M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Zm5-3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm7.597 2.214a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z"
                    clip-rule="evenodd"
                  />
                </svg>
                <input type="text" placeholder={links.instagram} onChange={handleLinkChange} name="" id="" />
              </div>
              <div className="social-link youtube">
                <svg
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
                    d="M21.7 8.037a4.26 4.26 0 0 0-.789-1.964 2.84 2.84 0 0 0-1.984-.839c-2.767-.2-6.926-.2-6.926-.2s-4.157 0-6.928.2a2.836 2.836 0 0 0-1.983.839 4.225 4.225 0 0 0-.79 1.965 30.146 30.146 0 0 0-.2 3.206v1.5a30.12 30.12 0 0 0 .2 3.206c.094.712.364 1.39.784 1.972.604.536 1.38.837 2.187.848 1.583.151 6.731.2 6.731.2s4.161 0 6.928-.2a2.844 2.844 0 0 0 1.985-.84 4.27 4.27 0 0 0 .787-1.965 30.12 30.12 0 0 0 .2-3.206v-1.516a30.672 30.672 0 0 0-.202-3.206Zm-11.692 6.554v-5.62l5.4 2.819-5.4 2.801Z"
                    clip-rule="evenodd"
                  />
                </svg>
                <input type="text" placeholder={links.youtube} onChange={handleLinkChange} name="" id="" />
              </div>
              <div className="social-link facebook">
                <svg
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
                    d="M13.135 6H15V3h-1.865a4.147 4.147 0 0 0-4.142 4.142V9H7v3h2v9.938h3V12h2.021l.592-3H12V6.591A.6.6 0 0 1 12.592 6h.543Z"
                    clip-rule="evenodd"
                  />
                </svg>
                <input type="text" placeholder={links.facebook} onChange={handleLinkChange} name="" id="" />
              </div>
              <div className="social-link twitter">
                <svg
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
                    d="M22 5.892a8.178 8.178 0 0 1-2.355.635 4.074 4.074 0 0 0 1.8-2.235 8.343 8.343 0 0 1-2.605.981A4.13 4.13 0 0 0 15.85 4a4.068 4.068 0 0 0-4.1 4.038c0 .31.035.618.105.919A11.705 11.705 0 0 1 3.4 4.734a4.006 4.006 0 0 0 1.268 5.392 4.165 4.165 0 0 1-1.859-.5v.05A4.057 4.057 0 0 0 6.1 13.635a4.192 4.192 0 0 1-1.856.07 4.108 4.108 0 0 0 3.831 2.807A8.36 8.36 0 0 1 2 18.184 11.732 11.732 0 0 0 8.291 20 11.502 11.502 0 0 0 19.964 8.5c0-.177 0-.349-.012-.523A8.143 8.143 0 0 0 22 5.892Z"
                    clip-rule="evenodd"
                  />
                </svg>
                <input type="text" placeholder={links.twitter} onChange={handleLinkChange} name="" id="" />
              </div>
              <div className="social-link">
                <svg
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
                    d="M12.006 2a9.847 9.847 0 0 0-6.484 2.44 10.32 10.32 0 0 0-3.393 6.17 10.48 10.48 0 0 0 1.317 6.955 10.045 10.045 0 0 0 5.4 4.418c.504.095.683-.223.683-.494 0-.245-.01-1.052-.014-1.908-2.78.62-3.366-1.21-3.366-1.21a2.711 2.711 0 0 0-1.11-1.5c-.907-.637.07-.621.07-.621.317.044.62.163.885.346.266.183.487.426.647.71.135.253.318.476.538.655a2.079 2.079 0 0 0 2.37.196c.045-.52.27-1.006.635-1.37-2.219-.259-4.554-1.138-4.554-5.07a4.022 4.022 0 0 1 1.031-2.75 3.77 3.77 0 0 1 .096-2.713s.839-.275 2.749 1.05a9.26 9.26 0 0 1 5.004 0c1.906-1.325 2.74-1.05 2.74-1.05.37.858.406 1.828.101 2.713a4.017 4.017 0 0 1 1.029 2.75c0 3.939-2.339 4.805-4.564 5.058a2.471 2.471 0 0 1 .679 1.897c0 1.372-.012 2.477-.012 2.814 0 .272.18.592.687.492a10.05 10.05 0 0 0 5.388-4.421 10.473 10.473 0 0 0 1.313-6.948 10.32 10.32 0 0 0-3.39-6.165A9.847 9.847 0 0 0 12.007 2Z"
                    clip-rule="evenodd"
                  />
                </svg>
                <input type="text" placeholder={links.github} onChange={handleLinkChange} name="" id="" />
              </div>
              <div className="social-link">
                <svg
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
                    d="M8.64 4.737A7.97 7.97 0 0 1 12 4a7.997 7.997 0 0 1 6.933 4.006h-.738c-.65 0-1.177.25-1.177.9 0 .33 0 2.04-2.026 2.008-1.972 0-1.972-1.732-1.972-2.008 0-1.429-.787-1.65-1.752-1.923-.374-.105-.774-.218-1.166-.411-1.004-.497-1.347-1.183-1.461-1.835ZM6 4a10.06 10.06 0 0 0-2.812 3.27A9.956 9.956 0 0 0 2 12c0 5.289 4.106 9.619 9.304 9.976l.054.004a10.12 10.12 0 0 0 1.155.007h.002a10.024 10.024 0 0 0 1.5-.19 9.925 9.925 0 0 0 2.259-.754 10.041 10.041 0 0 0 4.987-5.263A9.917 9.917 0 0 0 22 12a10.025 10.025 0 0 0-.315-2.5A10.001 10.001 0 0 0 12 2a9.964 9.964 0 0 0-6 2Zm13.372 11.113a2.575 2.575 0 0 0-.75-.112h-.217A3.405 3.405 0 0 0 15 18.405v1.014a8.027 8.027 0 0 0 4.372-4.307ZM12.114 20H12A8 8 0 0 1 5.1 7.95c.95.541 1.421 1.537 1.835 2.415.209.441.403.853.637 1.162.54.712 1.063 1.019 1.591 1.328.52.305 1.047.613 1.6 1.316 1.44 1.825 1.419 4.366 1.35 5.828Z"
                    clip-rule="evenodd"
                  />
                </svg>
                <input type="text" placeholder={links.website} onChange={handleLinkChange} name="" id="" />
              </div>
            </div>
            <div className="update-btn">
              <button class="btn-17" onClick={updateUserProfile}>
                <span class="text-container">
                  <span class="text">Update</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Profile;
