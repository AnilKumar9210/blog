import express from 'express';
import middleware from '../Middleware/middleware.js';
import Blog from '../Schema/Blog.js';
import cloudinary from '../Config/cloudinary.js';
import multer from 'multer';
import user from '../Schema/user.js';
import 'dotenv/config'
import comments from '../Schema/comments.js';


const router = express.Router();

const upload = multer({ dest: "uploads/" });


router.post("/post", upload.single("image"), middleware, async (req, res) => {
    try {
        const { title, prologue, content, category, author,authorId } = req.body;

        console.log("BODY:", req.body);
        console.log("FILE:", req.file);
        console.log("USER FROM TOKEN:", req.user);


        if (!req.file) {
            return res.status(400).json({ message: "Image is required" });
        }

        const result = await cloudinary.uploader.upload(req.file.path);

        const existingUser = await user.findOne({ "personal_info.userName": author });

        const newBlog = new Blog({
            authorId,
            title,
            prologue,
            content,
            imageUrl: result.secure_url,
            category,
            author,
            userName: existingUser.personal_info.fullName,
            profilePic: existingUser.profile_pic
        });
        

        await newBlog.save()

        await user.findOneAndUpdate({ "personal_info.userName": author },
            { $push: { blogs: newBlog._id } },
            { new: true }
        );

        res.status(201).json({ newBlog });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}
);


router.get ('/blogs',async (req,res)=> {
    try {
        const allBlogs = await Blog.find ();

        res.status (200).json ({success:true,allBlogs});
    } catch (err) {
        console.log(err);
        res.status (500).json ({message:err.message})
    }
});


router.post ('/getBlogsById',async (req,res)=> {
    try {
        const {blogIds} = req.body;

        const blogs = await Blog.find ({_id: {$in:blogIds}});

        res.status (200).json ({success:true,blogs});
    } catch (error) {
        res.status (500).json ({error:err.message})
    }
})


router.post ('/like/:blogId',middleware,async (req,res)=> {
    const io = req.app.get ('io');
    try {
        const {userId} = req.body;
        const {blogId} = req.params;

        const blog = await Blog.findOne ({_id: blogId});

        if (!blog) return res.json ({message:"blog doesn't exist"});

        if (blog.activity.likedBy.includes (userId)) {
            blog.activity.likes -= 1;
            blog.activity.likedBy = blog.activity.likedBy.filter (id=> id!== userId);
        } else {
            blog.activity.likes += 1;
            blog.activity.likedBy.push (userId);
        }


        await blog.save ();

        io.emit ('likeUpdated', {blogId: blogId, likes: blog.activity.likes});

        res.status (200).json ({success:true,message:"sucessfully liked",likes:blog.activity.likes})
    } catch (err) {
        res.status (500).json ({error:err.message})
    }
});

router.get ('/trending',async (req,res)=> {
    try {
        const trendingBlogs = await Blog.find ().sort ({"activity.likes": -1}).limit (10);
        res.status (200).json ({success:true,trendingBlogs});
    } catch (e) {
        res.status (500).json ({success:false,message:e.message});
    }
})


router.post ('/comment/:blogId',middleware,async (req,res)=> {
    const io = req.app.get ('io');
    try {
        const {userId, comment} = req.body;
        const {blogId} = req.params;

        const newComment = new comments ({
            blogId,
            userId,
            comment
        });

        await newComment.save ();

        await Blog.findOneAndUpdate ({_id:blogId},
            {$push: {comments:newComment._id}}, 
            {  new:true  }
        )

        io.emit ('commentAdded', {blogId: blogId, comment: newComment});

        res.status (201).json ({success:true,message:"comment added successfully",newComment})

    } catch (err) {
        res.status (500).json ({error:err.message})
    }
});

router.get ('/allComments/:blogId',middleware,async (req,res)=>{
    try {
        const {blogId} = req.params;

        

        const allComments = await comments.find ({blogId});

        res.status (200).json ({success:true,allComments});
    } catch (err) {
        res.status (500).json ({error:err.message})
    }
} );

router.post ('/deleteComment/:commentId',middleware,async (req,res)=> {
    try {
        const {commentId} = req.params;
        const {blogId} = req.body;

        const io = req.app.get ('io');
        const blog = await Blog.findOne ({_id:blogId});

        if (blog) {
            blog.comments = blog.comments.filter (id=> id.toString ()!== commentId);
            await blog.save ();
        }

        await comments.findOneAndDelete ({_id:commentId})

        io.emit ('commentDeleted', {commentId: commentId});

        res.status (200).json ({success:true,message:"comment deleted successfully"})
    } catch (err) {
        res.status (500).json ({error:err.message})
    }
})


export default router