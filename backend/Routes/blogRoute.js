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
        const { title, content, category, author, authorId, draft,prologue } = req.body;

        const aId = req.user._id;


        if (!req.file) {
            return res.status(400).json({ message: "Refresh and try again" });
        }

        const result = await cloudinary.uploader.upload(req.file.path);

        const existingUser = await user.findOne({_id:authorId});

        if (!existingUser) return res.status (400).json ({message:"user not found"})

        const newBlog = new Blog({
            authorId,
            title,
            content,
            imageUrl: result.secure_url,
            category,
            prologue,
            author:existingUser.personal_info.userName,
            userName: existingUser.personal_info.fullName,
            profilePic: existingUser.profile_pic,
            draft: draft
        });


        await newBlog.save()
        const isDraft = draft === "true";
        const field = !isDraft ? "blogs" : "draft_blogs"
        await user.findOneAndUpdate({_id:authorId},
            { $push: { [field]: newBlog._id } },
            { new: true }
        );


        res.status(201).json({ newBlog });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}
);

router.post('/post-draft/:blogId',middleware, async (req, res) => {
    try {
        const {blogId} = req.params
        const { userId} = req.body;

        
        const blog = await Blog.findOne({ _id: blogId });
        
        if (!blog) return res.status(400).json({ message: "failed to save" });
        
        // await user.findOneAndUpdate({ _id: userId },
        //     { $pull: { draft_blogs: blogId } },
        // )

        blog.draft = false;

        
        await user.findOneAndUpdate({ _id: userId },
            {
                $push: { blogs: blogId },
                $pull: { draft_blogs: blogId }
            },
        );
        
        await blog.save();

        res.status(200).json({ message: "posted successfully" })
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
});


router.post ("/delete-blog" , async (req,res) => {
    try {
        const {blogId,userId,draft} = req.body;

        
        const blog = await Blog.findOne ({_id:blogId});
        const publicId = blog.imageUrl
            .split("/")
            .pop()
            .split(".")[0];

          await cloudinary.uploader.destroy(publicId);
        
        if (!blog) return res.status (400).json ({message:"Can't find the blog"});
        
        await Blog.findOneAndDelete ({_id : blogId});
        
        const field = draft ? "draft_blogs" : "blogs";

        await user.findOneAndUpdate ({_id:userId},
            {$pull:{[field]:blogId}}
        )
        

        res.status (200).json ({message:"successfully deleted"})
    } catch (e) {
        res.status (500).json ({error:e.message})
    }
})


router.get('/blogs', async (req, res) => {
    try {
        const allBlogs = await Blog.find();

        res.status(200).json({ success: true, allBlogs });
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
});


router.post('/getBlogsById', async (req, res) => {
    try {
        const { blogIds } = req.body;

        const blogs = await Blog.find({ _id: { $in: blogIds } });

        res.status(200).json({ success: true, blogs });
    } catch (error) {
        res.status(500).json({ error: err.message })
    }
});



router.put(
  "/update/:blogId",
  middleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const { blogId } = req.params;
      const { title, prologue, content, category } = req.body;

      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      if (blog.authorId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      blog.title = title || blog.title;
      blog.prologue = prologue || blog.prologue;
      blog.content = content || blog.content;
      blog.category = category || blog.category;

      if (req.file) {
        if (blog.imageUrl) {
          const publicId = blog.imageUrl
            .split("/")
            .pop()
            .split(".")[0];

          await cloudinary.uploader.destroy(publicId);
        }

        const uploadResult = await cloudinary.uploader.upload(
          req.file.path,
          { folder: "blogs" }
        );

        blog.imageUrl = uploadResult.secure_url;
      }

      await blog.save();

      res.status(200).json({
        success: true,
        message: "Blog updated successfully",
        blog,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);


router.post('/like/:blogId', middleware, async (req, res) => {
    const io = req.app.get('io');
    try {
        const { userId } = req.body;
        const { blogId } = req.params;

        const blog = await Blog.findOne({ _id: blogId });

        if (!blog) return res.json({ message: "blog doesn't exist" });

        if (blog.activity.likedBy.includes(userId)) {
            blog.activity.likes -= 1;
            blog.activity.likedBy = blog.activity.likedBy.filter(id => id !== userId);
        } else {
            blog.activity.likes += 1;
            blog.activity.likedBy.push(userId);
        }


        await blog.save();

        io.emit('likeUpdated', { blogId: blogId, likes: blog.activity.likes });

        res.status(200).json({ success: true, message: "sucessfully liked", likes: blog.activity.likes })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

router.get('/trending', async (req, res) => {
    try {
        const trendingBlogs = await Blog.find({draft:false}).sort({ "activity.likes": -1 }).limit(10);
        res.status(200).json({ success: true, trendingBlogs });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
})


router.post('/comment/:blogId', middleware, async (req, res) => {
    const io = req.app.get('io');
    try {
        const { userId, comment } = req.body;
        const { blogId } = req.params;

        const newComment = new comments({
            blogId,
            userId,
            comment
        });

        await newComment.save();

        await Blog.findOneAndUpdate({ _id: blogId },
            { $push: { comments: newComment._id } },
            { new: true }
        )

        io.emit('commentAdded', { blogId: blogId, comment: newComment });

        res.status(201).json({ success: true, message: "comment added successfully", newComment })

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

router.get('/allComments/:blogId', middleware, async (req, res) => {
    try {
        const { blogId } = req.params;



        const allComments = await comments.find({ blogId });

        res.status(200).json({ success: true, allComments });
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

router.post('/deleteComment/:commentId', middleware, async (req, res) => {
    try {
        const { commentId } = req.params;
        const { blogId } = req.body;

        const io = req.app.get('io');
        const blog = await Blog.findOne({ _id: blogId });

        if (blog) {
            blog.comments = blog.comments.filter(id => id.toString() !== commentId);
            await blog.save();
        }

        await comments.findOneAndDelete({ _id: commentId })

        io.emit('commentDeleted', { commentId: commentId });

        res.status(200).json({ success: true, message: "comment deleted successfully" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})








export default router