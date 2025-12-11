import mongoose , {Schema} from "mongoose";

const commentSchema = new mongoose.Schema ({
    blogId : {
        type : Schema.Types.ObjectId,
        ref : "blogs",
        required : true
    },
    userId : {
        type : Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    comment : {
        type : String,
        required : true
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    profilePic : {
        type:String,
        default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzR0bIMZ71HVeR5zF4PihQaDvTQQk6bsVERw&s"
    }
});

export default mongoose.model ("comments", commentSchema);