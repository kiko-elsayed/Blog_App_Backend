const mongoose = require('mongoose')
const Joi = require('joi')

const postSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true ,
        trim: true,
        minlength : 5 ,
        maxlength : 200 ,
    },
    description : {
        type : String,
        required : true ,
        trim: true,
        minlength : 10 
    },
    category : {
        type : String ,
        required : true
    },
    image : {
        type : Object ,
        default :{
            url:"",
            publicId : null
        }
    },
    likes : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref :"User"
        }
    ],
    user :{
        type : mongoose.Types.ObjectId,
        ref:'User',
        required :true
    },
}, {
    timestamps : true,
    toJSON : {virtuals :true} ,
    toObject : {virtuals:true}
})

// populate comment for this post
postSchema.virtual("comments" ,{
    ref : "Comment" ,
    localField  : "_id"   ,
    foreignField : "postId"
})


// post model
const Post = mongoose.model("Post" ,postSchema )


// validation create post
function validateCreatePost(obj){
    const schema = Joi.object({
        title : Joi.string().trim().min(5).max(200).required(),
        description : Joi.string().trim().min(10).required(),
        category : Joi.string().trim().required()
    })
    return schema.validate(obj)
}

// validation update post
function validateUpdatePost(obj){
    const schema = Joi.object({
        title : Joi.string().trim().min(5).max(200),
        description : Joi.string().trim().min(10),
        category : Joi.string().trim()
    })
    return schema.validate(obj)
}



module.exports={
    Post,
    validateCreatePost,
    validateUpdatePost
}