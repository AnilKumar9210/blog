import mongoose, {Schema} from 'mongoose'

const userSchema = mongoose.Schema  ({
    personal_info:{
        fullName:{
            type:String,
            required:true,
            lowercase:true,
            minlength:[3,'fullname must be 3 letters long']
        },
        email : {
            required:true,
            type:String,
            unique:true
        },
        password:String,
        userName:{
            lowercase:true,
            required:true,
            unique:false,
            type:String
        },
        bio : {
            type:String,
            maxlength:[200,'bio length must be less than 200'],
            default:""
        }
    },

    social_links : {
        instagram : {
            type:String,
            default:""
        },
        facebook : {
            type:String,
            default:""
        },
        twitter : {
            type:String,
            default:""
        },
        youtube : {
            type:String,
            default:""
        },
        github : {
            type:String,
            default:""
        },
        website : {
            type:String,
            default:""
        },
    },

    account_info : {
        total_posts : {
            type:Number,
            default:0
        },
        total_reads :{
            type:Number,
            default:0
        }
    },
    google_auth: {
        type: Boolean,
        default: false
    },
    blogs: {
        type: [ Schema.Types.ObjectId ],
        ref: 'blogs',
        default: [],
    },
    profile_pic : {
        type:String,
        default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzR0bIMZ71HVeR5zF4PihQaDvTQQk6bsVERw&s"
    },
    resetOtp: {
        type:String,
        default:""
    },
    resetOtpExpires : {
        type:Date,
    }

}, 

{ 
    timestamps: {
        createdAt: 'joinedAt'
    } 

})

export default mongoose.model ('users',userSchema)