const asyncHandler = require('express-async-handler')
const {Comment , validateCreateComment , validateUpdateComment}= require("../models/comment")
const {User} = require("../models/User")


// create new comment  -- ( /api/comments) -- post -- login user
module.exports.createCommentCtrl = asyncHandler(async(req,res)=>{
    //validate
    const {error} = validateCreateComment(req.body)
    if (error) {
        return res.status(400).json({message : error.message})
    }
    // get id of user profile
    const profile = await User.findById(req.user._id)
    
    const comment = await Comment.create({
        postId : req.body.postId,
        text : req.body.text ,
        user : req.user._id ,
        username : profile.username
    })

    res.status(201).json(comment)
})


// get all comments  -- ( /api/comments) -- get -- only admin
module.exports.getAllCommentsCtrl = asyncHandler(async(req,res)=>{
    //validate
    const comments = await Comment.find().populate("user")

    res.status(200).json(comments)
})


// delete comment  -- ( /api/comments/:id) -- delete -- only admin or owner of the comment
module.exports.deleteCommentsCtrl = asyncHandler(async(req,res)=>{
    //validate
    const comment = await Comment.findById(req.params.id)
    if (!comment) {
    return res.status(404).json({message : "comment not found"})
    }
    // to check admin or the owner of the comment
    if (req.user.isAdmin || req.user._id === comment.user.toString()) {
        await Comment.findOneAndDelete(req.params.id)
        res.status(200).json({message : "comment has been deleted "})
    }else{
        res.status(400).json({message : "your are not Admin or post owner "})
    }
})


// update comment  -- ( /api/comments/:id) -- put -- only owner of the comment
module.exports.updateCommentsCtrl = asyncHandler(async(req,res)=>{
    //validate
    const {error} = validateUpdateComment(req.body)
    if (error) {
        return res.status(400).json({message : error.message})
    }

    const comment = await Comment.findById(req.params.id)
    if (!comment) {
    return res.status(404).json({message : "comment not found"})
    }
    console.log(req.user);
    // to check the owner of the comment
    if (req.user._id  !== comment.user.toString()) {
        return res.status(403).json({message : "your are not post owner "})
    }

    const updatedComment = await Comment.findByIdAndUpdate(req.params.id , {
        $set :{
            text: req.body.text
        }
    } , {new :true})

    res.status(200).json(updatedComment)
})














