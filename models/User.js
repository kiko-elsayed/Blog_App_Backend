const mongoose = require('mongoose')
const Joi = require('joi')
const jwt = require('jsonwebtoken')
const passwordComplexity = require("joi-password-complexity") 

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required : true,
        trim : true,
        minlength : 2,
        maxlength :30
    },
    email:{
        type: String,
        required :true,
        unique:true ,
        trim : true,
        minlength : 5 ,
        maxlength : 100
        
    },
    password : {
        type: String,
        required : true,
        minlength:8,
        trim : true
    },
    profilePhoto: {
        type : Object ,
        default:{
            url:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            publicId: null
        }
    },
    bio :{
        type : String
    },
    isAdmin :{
        type: Boolean,
        default: false
    },
    isAccountVerified :{
        type:Boolean,
        default:false
    }
} , { 
    timestamps:true ,
    toJSON: {virtuals : true} ,
    toObject: {virtuals : true}
});


// populate posts that belongs to this user 
UserSchema.virtual("posts" ,{
    ref : "Post" , // post model
    localField :"_id", // id in user model
    foreignField :"user" // id in post model
})



// generate auth token
UserSchema.methods.generateAuthToken= function () {
    return (
        jwt.sign({ _id: this._id , isAdmin : this.isAdmin}, process.env.JWT_SECRET)
    )
}


/////
const User = mongoose.model("User" , UserSchema)


// validate register User 
function validateRegisterUser(obj){
    const schema = Joi.object({
        username : Joi.string().trim().min(2).max(30).required(),
        email : Joi.string().trim().min(5).max(100).required().email(),
        password : passwordComplexity().required(),
    })
    return schema.validate(obj);
}

// validate login user
function validateLoginUser(obj){
    const schema = Joi.object({
        email : Joi.string().trim().min(5).max(100).required().email(),
        password : passwordComplexity().required(),
    })
    return schema.validate(obj);
}

// validate update user
function validateUpdateUser(obj){
    const schema = Joi.object({
        username : Joi.string().trim().min(2).max(30),
        password : passwordComplexity(),
        bio : Joi.string()
    })
    return schema.validate(obj);
}

// validate Email
function validateEmail(obj){
    const schema = Joi.object({
        email : Joi.string().trim().min(5).max(100).required().email(),
    })
    return schema.validate(obj);
}


// validate new password
function validateNewPassword(obj){
    const schema = Joi.object({
        password : passwordComplexity().required(),
    })
    return schema.validate(obj);
}




module.exports = {
    User,
    validateRegisterUser,
    validateLoginUser,
    validateUpdateUser,
    validateEmail,
    validateNewPassword
}