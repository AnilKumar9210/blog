import express from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import user from './Schema/user.js'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import blogRouter from './Routes/blogRoute.js'
import http from 'http'
import { Server } from 'socket.io'
import Blog from './Schema/Blog.js'
import { profile, timeStamp } from 'console'
import multer from "multer";
import cloudinary from './Config/cloudinary.js';
import comments from './Schema/comments.js'
import crypto from "crypto"
import sendEmail from './Config/sendMail.js'

const app = express()
app.use(express.json());
app.use(cors())
app.use ('/blog',blogRouter)

const server = http.createServer (app);

const io = new Server (server,{
    cors: {
        origin:"*"
    }
})

app.set ("io",io);

const storage = multer.memoryStorage();
const uploadProfile = multer({ storage });


mongoose.connect(process.env.DB_LOCATION, { autoIndex: true });

const PORT = 3000;

function generateBaseName (base) {
    const random = Math.random().toString(36).substring (2,7);
    return `${base}_${random}`
}

app.post('/signup', async (req, res) => {
    let { fullName, email, password } = req.body;
    try {
        const hashedPass = await bcrypt.hash(password, 10);

        const userExists = await user.findOne ({"personal_info.email":email});

        if (userExists) {
            return res.status (400).json({message:"user already exists"});
        }

        const userName = fullName.toLowerCase().replace(/\s+/g, '');

        const exists= await user.findOne ({"personal_info.userName" : userName});

        while (exists) {
            userName = generateBaseName (userName);
            exists = await user.findOne ({"personal_info.userName":userName})
        }

        const newUser = new user(
            {
                personal_info: {
                    fullName,
                    email,
                    password: hashedPass,
                    userName: userName
                },
                social_links: {},
                account_info: {},
                blogs: []
            })

        await newUser.save()

        res.status(200).json({ message: "successful" });
    } catch (err) {
        res.status(500).json({error:err.message})
    }

})


app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await user.findOne({ "personal_info.email": email });

        if (!existingUser) {
            return res.status(400).json({message:"user does not exist"});
        }

        const match = await bcrypt.compare(password, existingUser.personal_info.password);

        if (!match) {
            return res.status(400).json({message:"Incorrect password"});
        }

        const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

        res.json({
            token,
            user: existingUser
        })
    } catch (err) {
        res.status(500).json(err)
    }
})


app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await user.findOne({ "personal_info.email": email });
    if (!existingUser)
      return res.status(404).json({ message: "User does not exist" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    existingUser.resetOtp = crypto.createHash("sha256").update(otp).digest("hex");

    existingUser.resetOtpExpires = Date.now() + 10 * 60 * 1000;

    await existingUser.save({ validateBeforeSave: false });

    await sendEmail({
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for resetting your password is ${otp}. It is valid for 10 minutes.`,
    });

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.post ('/reset-password',async (req,res)=> {
  try {
    const {email,otp,newPassword} = req.body

    const hashedOtp = crypto.createHash ("sha256").update (otp).digest ("hex");

    const existingUser = await user.findOne ({
      "personal_info.email": email,
      resetOtp:hashedOtp,
      resetOtpExpires:{$gt : Date.now ()},
    });



    if (!existingUser) return res.status (400).json ({message:"Otp expired try again"});

    existingUser.personal_info.password = await bcrypt.hash (newPassword,10);
    existingUser.resetOtp =  undefined
    existingUser.resetOtpExpires = undefined

    await existingUser.save ()

    res.status (200).json ({message:"password updated successfully"});

  } catch (error) {
    res.status (500).json ({error:error.message})
  }
})


export const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
};


app.post(
  "/updateProfile/:userId",
  uploadProfile.single("profile_pic"),  
  async (req, res) => {
    try {
      const { userId } = req.params;

      const {
        fullName,
        userName,
        email,
        instagram,
        youtube,
        twitter,
        facebook,
        github,
        website,
        bio,
      } = req.body;

      let profilePicUrl = null;

      if (req.file) {
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          "blog_profile"
        );
        profilePicUrl = uploadResult.secure_url;
      }


      const updateData = {
        "id":userId,
        "personal_info.fullName": fullName,
        "personal_info.userName": userName,
        "personal_info.email": email,
        "personal_info.bio":bio,
        "social_links.instagram": instagram,
        "social_links.youtube": youtube,
        "social_links.twitter": twitter,
        "social_links.facebook": facebook,
        "social_links.github": github,
        "social_links.website": website,
      };

      if (req.file) {
        updateData["profile_pic"] = profilePicUrl;
      } 

      const updatedUser = await user.findByIdAndUpdate(userId, updateData, {
        new: true,
      });

      await Blog.updateMany(
        { _id: { $in: updatedUser.blogs } },
        {
          $set: {
            profilePic: updatedUser.profile_pic, 
            author: updatedUser.personal_info.fullName,
            userName: updatedUser.personal_info.userName,
          },
        }
      );

      await comments.updateMany ({userId : userId},
        {
          $set : {
            profilePic: updatedUser.profile_pic
          }
        }
      );

      return res.status(200).json({
        success: true,
        updatedUser,
      });

    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);


app.get ('/user/:userId', async (req,res)=> {
  try {
    const {userId} = req.params;

    const userProfile = await user.findById (userId);

    res.status (200).json ({success:true,userProfile})
  } catch (error) {
    res.status (500).json ({success:false,error:error.message})
  }
})


app.get ('/search', async (req,res)=> {
  try {
    const {query} = req.query;

    if (!query) return res.json ({blogs:[],users:[]});

    const regex = new RegExp (query,'i');

    const blogs = await Blog.find ({
      $or : [
        {"title":regex},
      ]
    })

    const users = await user.find ({
      $or:[
        {"personal_info.userName" : regex}
      ]
    })

    res.status (200).json ({blogs,users})


  } catch (error) {
    res.status (500).json ({success:false,error:error.message})
  }
})


server.listen(PORT, () => {
    console.log(`listening on post http://localhost:${PORT}`)
})