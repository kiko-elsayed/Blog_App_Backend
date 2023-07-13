const fs = require('fs')
const path = require('path')
const asyncHandler = require('express-async-handler')
const {Post , validateCreatePost , validateUpdatePost}=require('../models/Post')
const {cloudinaryUploadImage, cloudinaryRemoveImage}= require('../utils/cloudinary')
const {Comment} =require('../models/comment')



// create new post  // api/posts   // only login user
module.exports.createPostCtrl = asyncHandler(async(req,res)=>{
    //validation for image 
    if(!req.file){
        return res.status(400).json({message:'No image provided '})
    }
    //validation for data
    const {error} = validateCreatePost(req.body)
    if (error) {
        return res.status(400).json({message: error.message})
    }
    // upload photo
    const imagePath = path.join(__dirname , `../images/${req.file.filename}`)
    const result = await cloudinaryUploadImage(imagePath)

    // create new post and save it in DB
    const post = new Post({
        title : req.body.title,
        description : req.body.description,
        category : req.body.category,
        user : req.user._id,
        image : {
            url : result.secure_url,
            publicId :result.public_id
        }
    })
    await post.save();
    // send response to client
    res.status(200).json(post)

    // remove photo from folder images
    fs.unlinkSync(imagePath)
})


// get all posts  // api/posts   // public
module.exports.getAllPostsCtrl = asyncHandler(async (req,res)=>{
    const POST_PER_PAGE = 3 ;
    const {pageNumber , category}= req.query;
    let posts ;

    if (pageNumber) {
        posts = await Post.find()
            .sort({createdAt :-1})
            .populate("user" , ["-password"])
            .skip((pageNumber - 1) * POST_PER_PAGE)
            .limit(POST_PER_PAGE);

    }else if (category) {
        posts = await Post.find({category})
            .sort({createdAt :-1})
            .populate("user" , ["-password"])

    } else {
        posts = await Post.find()
            .sort({createdAt :-1})
            .populate("user" , ["-password"])
    }
    res.status(200).json(posts)

})


// get single posts  // api/posts/:id   // only login user
module.exports.getSinglePostsCtrl = asyncHandler(async (req,res)=>{
    const post = await Post.findById(req.params.id)
    .populate("user" , ["-password"])
    .populate("comments")

    if (!post) {
        return res.status(404).json({message : "post not found"})
    }
    res.status(200).json(post)

})

// get posts count // api/posts/count   // public
module.exports.getPostsCountCtrl = asyncHandler(async (req,res)=>{
    const post = await Post.count();

    res.status(200).json(post)
})


// delete single posts  // api/posts/:id   // only login user or admin
module.exports.deletePostsCtrl = asyncHandler(async (req,res)=>{
    const post = await Post.findById(req.params.id)
    
    if (!post) {
        return res.status(404).json({message : "post not found"})
    }
    if (req.user.isAdmin || req.user._id === post.user.toString()) {
        await Post.findByIdAndDelete(req.params.id)
        await cloudinaryRemoveImage(post.image.publicId)

        // delete all comments belong to this post
        await Comment.deleteMany({postId : post._id})
        
        res.status(200).json({
            message : "post has deleted successfully",
            postId : post._id
        })
    }else{
        res.status(403).json({message : "Access forbidden"})
    }
    
})


// update post --- (/api/posts/:id) --- private only owner of the post
module.exports.updatePostCtrl= asyncHandler(async(req,res)=>{
    // validation
    const {error} = validateUpdatePost(req.body)
    if (error) {
        return res.status(400).json({message : error.message})
    }
    // get the post from DB and check is exist 
    const post = await Post.findById(req.params.id)
    if (!post) {
        return res.status(400).json({message : "post not found"})
    }
    // check is the user of the post
    if (req.user._id !== post.user.toString()) {
        return res.status(403).json({message : "your not allowed"})
        
    }
    // update post
    const updatedPost = await Post.findByIdAndUpdate(req.params.id ,{
        $set:{
            title : req.body.title,
            category : req.body.category,
            description : req.body.description,
        }
    }, {new : true}).populate("user" , ["-password"])
    // send response to the client
    res.status(200).json(updatedPost)
})



// update post image --- (/api/posts/upload-image/:id) --- private only owner of the post
module.exports.updatePostImageCtrl= asyncHandler(async(req,res)=>{
    // validation
    if (!req.file) {
        return res.status(400).json({message : "no image provided"})
    }
    // get the post from DB and check is exist 
    const post = await Post.findById(req.params.id)
    if (!post) {
        return res.status(400).json({message : "post not found"})
    }
    // check is the user of the post
    if (req.user._id !== post.user.toString()) {
        return res.status(403).json({message : "your not allowed"})
        
    }
    // delete the old image
    await cloudinaryRemoveImage(post.image.publicId)
    // upload new photo
    const imagePath = path.join(__dirname , `../images/${req.file.filename}`)
    const result = await cloudinaryUploadImage(imagePath)

    // update image in DB
    const updatedPost = await Post.findByIdAndUpdate(req.params.id ,{
        $set:{
            image : result.secure_url,
            publicId:result.public_id
        }
    }, {new : true})

    // send response to the client
    res.status(200).json(updatedPost)

    // delete image from the server
    fs.unlinkSync(imagePath)
})


// Toggle Like ------ (/api/posts/like/:id) --------- put --- only login user
module.exports.toggleLikeCtrl = asyncHandler(async(req,res)=>{
    const loggedInUser= req.user._id
    const {id : postId} = req.params

    let post = await Post.findById(postId)
    if (!post) {
        return res.status(404).json({message : "post not exist"})
    }

    const isPostAlreadyLiked = post.likes.find((user)=>{
        user.toString() === loggedInUser
    })

    if (isPostAlreadyLiked) {
        post = await Post.findByIdAndUpdate(postId ,{
            // pull تحذف من الأرراي الايك بتاع اليوزر
            $pull :{ likes :loggedInUser }
        }, {new :true})
    }else{
        post = await Post.findByIdAndUpdate(postId ,{
            // push تضيف في الأرراي الايك بتاع اليوزر
            $push :{ likes :loggedInUser }
        }, {new :true})
    }
    
    res.status(200).json(post)
})






