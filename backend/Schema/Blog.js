import mongoose,{Schema} from "mongoose";

const blogs = mongoose.Schema ({
    authorId : {
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    title :{
        type:String,
        required:true
    },
    prologue : {
        type:String,
        required:true
    },

    imageUrl : {
        type:String,
        required:true
    },
    profilePic : {
        type:String,
        default:""
    },
    content : {
        type : String,
        required:true
    },

    category : {
        type:String,
        required:true
    },

    author : {
        type:String,
        required:true
    },
    userName : {
        type:String,
        required:true
    },

    activity : {
        likes : {
            type:Number,
            default : 0
        },
        likedBy :{
            type:[String],
            default:[]
        },
        total_comments : {
            type:Number,
            default:0
        },
        total_reads :{
            type : Number,
            default : 0
        }
    },

    comments : {
        type: [Schema.Types.ObjectId],
        ref:"comments"
    },

    draft : {
        type:Boolean,
        default : false
    },
    createdAt : {
        type:Date,
        default:Date.now ()
    }
})

export default mongoose.model ('blogs',blogs);