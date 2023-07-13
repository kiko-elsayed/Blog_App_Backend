const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const {User , validateUpdateUser} = require('../models/User')
const path = require('path')
const fs = require('fs')
const { cloudinaryUploadImage, cloudinaryRemoveImage,cloudinaryRemoveMultipleImage } = require('../utils/cloudinary')
const {Comment} = require('../models/comment')
const {Post} = require('../models/Post')




/// get all users profile access by admin only
module.exports.getAllUsersCtrl = asyncHandler (async(req,res)=>{
    
    const users = await User.find().select("-password")
    res.status(200).json(users);
})

/// get single user profile  
module.exports.getUserProfileCtrl = asyncHandler (async(req,res)=>{
    
    const user = await User.findById(req.params.id).select("-password").populate("posts")
    if (!user) {
        return res.status(404).json({message : "user not found "})
    }
    res.status(200).json(user);
})

/// update  user profile  by only user himself
module.exports.updateUserProfileCtrl = asyncHandler (async(req,res)=>{
    // validation
    const {error} = validateUpdateUser(req.body)
    if (error) {
        return res.status(400).json({message : error.message})
    }
    // hashed pass
    if(req.body.password){
        const salt =await bcrypt.genSalt(10)
        req.body.password = await bcrypt.hash( req.body.password , salt)
    }

    // update user
    const updatedUser = await User.findByIdAndUpdate(req.params.id , {
        $set: {
            username : req.body.username ,
            password : req.body.password ,
            bio : req.body.bio
        },
    }, {new:true}).select("-password")

    res.status(200).json(updatedUser);
})


/// get user count by Admin only
module.exports.getUsersCountCtrl = asyncHandler (async(req,res)=>{
    
    const count = await User.count()
    res.status(200).json(count);

})

///  profile photo upload by only logged user (post)
module.exports.profilePhotoUploadCtrl = asyncHandler (async(req,res)=>{
    //validation 
    if (!req.file) {
        return res.status(400).json({message : "no file provided"})
    }
    // GET the path to the image 
    const imagePath = path.join(__dirname , `../images/${req.file.filename}`)
    // upload to cloudinary
    const result = await cloudinaryUploadImage(imagePath)
    console.log(result);

    // get the user from db
    const user = await User.findById(req.user._id)

    // delete the old profile photo if exist
    if (user.profilePhoto.publicId !== null) {
        await cloudinaryRemoveImage(user.profilePhoto.publicId)
    }
    // change the profile photo filed in the db
    user.profilePhoto= {
        url : result.secure_url , 
        publicId : result.public_Id
    }
    await user.save();
    // send response to the client
    res.status(200).json({
        message :"your profile photo added successfully " ,
        profilePhoto : {url : result.secure_url , publicId : result.public_Id}    
    });

    //remove image from the server
    fs.unlinkSync(imagePath)
})

//delete user profile (delete by only admin or user himself)
module.exports.deleteUserProfileCtrl = asyncHandler (async(req,res)=>{
    // get the user from DB
    const user = await User.findById(req.params.id)
    if (!user) {
        return res.status(400).json({message : "this user not exist"})
    }
    // get all posts from DB
    const posts = await Post.find({user : user._id})
    
    // get the public ids from the posts 
    const PublicIds = posts?.map((post)=> post.image.publicId)

    //delete all the posts image from cloudinary that blog to this user 
    if (PublicIds?.length > 0) {
        await cloudinaryRemoveMultipleImage(PublicIds)
    }

    // delete the profile photo from cloudinary
    await cloudinaryRemoveImage(user.profilePhoto.public_Id)

    // Delete the user post and comments (in the next )==========
    await Post.deleteMany({user: user._id})
    await Comment.deleteMany({user : user._id})

    //delete the user himself
    await User.findByIdAndDelete(req.params.id)
    //send a response to the client
    res.status(200).json({message : "your profile has been deleted"})
})

