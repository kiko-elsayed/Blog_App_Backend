const router = require('express').Router()
const { createPostCtrl, getAllPostsCtrl, getSinglePostsCtrl, getPostsCountCtrl, deletePostsCtrl , updatePostCtrl, updatePostImageCtrl ,isPostAlreadyLiked, toggleLikeCtrl  } = require('../controllres/postsControllers')
const photoUpload = require('../middlewares/photoUpload')
const {verifyToken}= require('../middlewares/verifyToken')
const validateObjectId = require('../middlewares/validateObjectId')

//  /api/posts
router.route("/")
    .post(verifyToken , photoUpload.single("image") , createPostCtrl)
    .get(getAllPostsCtrl)

//  /api/posts/count
router.route("/count")
    .get( getPostsCountCtrl)

//  /api/posts/:id
router.route("/:id")
    .get(validateObjectId , getSinglePostsCtrl)
    .delete(validateObjectId , verifyToken , deletePostsCtrl)
    .put(validateObjectId , verifyToken , updatePostCtrl)

// /api/posts/update-image/:id
router.route("/update-image/:id")
    .put(validateObjectId , verifyToken , photoUpload.single("image") , updatePostImageCtrl )

// /api/posts/like/:id
router.route("/like/:id")
    .put(validateObjectId , verifyToken ,  toggleLikeCtrl )



module.exports = router
