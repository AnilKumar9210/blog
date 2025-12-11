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
        console.log(req.body)
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

        console.log(hashedPass, newUser)
        await newUser.save()

        res.status(200).json({ message: "successful" });
    } catch (err) {
        console.log(err)
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
        console.log(err)
        res.status(500).json(err)
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
  uploadProfile.single("profile_pic"),  // MUST MATCH formData.append("profile_pic")
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

      // ⭐ Upload profile picture
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


server.listen(PORT, () => {
    console.log(`listening on post http://localhost:${PORT}`)
})