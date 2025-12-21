import React, { useContext, useState } from "react";
import email from "../assets/email.png";
import password from "../assets/password.png";
import user from "../assets/user.png";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import { appContext } from "../Context/context";
import { ToastContainer, toast } from "react-toastify";
import { motion } from "framer-motion";

const Auth = () => {
  const [show, setShow] = useState(false);
  const [signin, setSignIn] = useState(false);
  const [sending, setSending] = useState(false);
  const [details, setDetails] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [invalid, setInvalid] = useState("");
  const [forgot, setForgot] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const [resetDetails, setResetDetails] = useState({
    email: "",
    otp: "",
    newPass: "",
    confirmPass: "",
  });

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      tansition: { staggeChildren: 0.15, delayChildred: 1 },
    },
  };
  const item = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 },
  };

  const handleResetChange = (e) => {
    setResetDetails({ ...resetDetails, [e.target.name]: e.target.value });
  };

  const { setUserDetails, userDetails, setIsLogin } = useContext(appContext);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setInvalid("");
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const handleSignIn = async () => {
    if (details.username.length < 4) {
      toast.error ("Enter a valid user name");
      return
    }

     if (details.email.length < 14 ) {
      toast.error ("Enter valid email");
      return
    }

    if (details.password.length < 4) {
      toast.error ("password must be four letters");
      return;
    }

    if (details.email)
    try {
      const res = await fetch("https://blog-backend-yk6g.onrender.com/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: details.username.toLowerCase(),
          email: details.email,
          password: details.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(`${data.message}`);
        return;
      }

      setDetails({ email: "", password: "", username: "" });

      setSignIn(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async () => {
    if (details.email.length < 14 || details.password.length < 4) {
      toast.error ("Enter valid credentials");
      return
    }
    try {
      const res = await fetch("https://blog-backend-yk6g.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: details.email,
          password: details.password,
        }),
      });

      const data = await res.json();
      // console.log(data);

      setUserDetails(data.user);
      if (!res.ok) {
        setInvalid(data.message);
        toast.error(`${data.message}`);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setIsLogin(true);

      setDetails({ email: "", password: "", username: "" });

      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const handleForget = async () => {
    if (resetDetails.email.length < 14) {
      toast.error ("Enter a valid email");
      return
    }
    // console.log(resetDetails.email);
    setSending(true);

    try {
      const res = await fetch("https://blog-backend-yk6g.onrender.com/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetDetails.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
        return;
      }
      // console.log(data);
      toast.success(data.message);
      setOtpSent(true);
    } catch (e) {
      console.log(e);
    } finally {
      setSending(false);
    }
  };

  const resetPassword = async () => {
    if (resetDetails.confirmPass !== resetDetails.newPass) {
      toast.error("Passwords are not matching");
      return;
    }
    try {
      const res = await fetch("https://blog-backend-yk6g.onrender.com/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetDetails.email,
          otp: resetDetails.otp,
          newPassword: resetDetails.newPass,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
      }
      toast.success(data.message);
      setSignIn(true);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="authentication">
      <ToastContainer />
      {!forgot ? (
        <>
          {signin ? (
            <motion.h1>Welcome back.</motion.h1>
          ) : (
            <motion.h1>Join us today</motion.h1>
          )}
          <motion.div
            className="login"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            {!signin && (
              <motion.div className="email" variants={item}>
                <img src={user} alt="" />
                <input
                  type="text"
                  name="username"
                  onChange={handleChange}
                  placeholder="Username"
                />
              </motion.div>
            )}
            <motion.div className="email" variants={item}>
              <img src={email} alt="" />
              <input
                type="email"
                onChange={handleChange}
                name="email"
                placeholder="Email"
              />
            </motion.div>
            <motion.div className="pass" variants={item}>
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
                  d="M8 10V7a4 4 0 1 1 8 0v3h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2-3a2 2 0 1 1 4 0v3h-4V7Zm2 6a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Z"
                  clip-rule="evenodd"
                />
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
            </motion.div>
            {signin ? (
              <motion.button onClick={handleLogin} variants={item}>
                Login
              </motion.button>
            ) : (
              <motion.button onClick={handleSignIn} variants={item}>
                Sign in{" "}
              </motion.button>
            )}
            {signin && (
              <motion.span>
                Forgot password,
                <span className="link" onClick={() => setForgot(true)}>
                  Reset here.
                </span>
              </motion.span>
            )}
            <div className="line"></div>
            {/* <div className="google">
            <button onClick={()=>{toast.success ("error")}}><img src={google} alt="" /> Continue with google</button>
        </div> */}
            {signin ? (
              <motion.span variants={item}>
                Don't have an account?
                <span
                  className="link"
                  onClick={() => {
                    setSignIn(!signin);
                  }}
                >
                  join us today.
                </span>
              </motion.span>
            ) : (
              <motion.span variants={item}>
                Already have an account{" "}
                <span className="link" onClick={() => setSignIn(!signin)}>
                  login in here
                </span>
              </motion.span>
            )}
          </motion.div>
        </>
      ) : (
        <motion.div
          className="forgot"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="login" variants={item}>
            <motion.h1 variants={item}> Reset password</motion.h1>
            {!otpSent && (
              <motion.div className="email" variants={item}>
                <img src={email} alt="" />
                <input
                  type="text"
                  name="email"
                  onChange={(e) => {
                    handleResetChange(e);
                  }}
                  placeholder="email"
                  value={resetDetails.email}
                />
              </motion.div>
            )}

            {otpSent && (
              <>
                <motion.div variants={item}>
                  <motion.div className="email" variants={item}>
                    <img src={password} alt="" />
                    <input
                      type="text"
                      name="otp"
                      onChange={handleResetChange}
                      placeholder="Enter your otp"
                    />
                  </motion.div>
                  <span>OTP expires in 10 minutes</span>
                </motion.div>
                <motion.div className="email" variants={item}>
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
                      d="M8 10V7a4 4 0 1 1 8 0v3h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2-3a2 2 0 1 1 4 0v3h-4V7Zm2 6a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <input
                    type="text"
                    name="newPass"
                    onChange={handleResetChange}
                    placeholder="Enter your new password"
                  />
                </motion.div>
                <motion.div className="email" variants={item}>
                  <motion.div className="pass">
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
                        d="M8 10V7a4 4 0 1 1 8 0v3h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2-3a2 2 0 1 1 4 0v3h-4V7Zm2 6a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <input
                      type={show ? "text" : "password"}
                      name="confirmPass"
                      placeholder="Confirm your password"
                      onChange={handleResetChange}
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
                  </motion.div>
                </motion.div>
              </>
            )}
            {!otpSent ? (
              <motion.button onClick={handleForget} variants={item}>
                {sending ? (
<div class="loaderBtn">
  <li class="ball"></li>
  <li class="ball"></li>
  <li class="ball"></li>
</div>
                ) : (
                  "Send-Otp"
                )}
              </motion.button>
            ) : (
              <motion.button onClick={resetPassword} variants={item}>
                Update password
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Auth;
