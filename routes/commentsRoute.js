const router = require('express').Router()
const { createCommentCtrl ,getAllCommentsCtrl, deleteCommentsCtrl, updateCommentsCtrl } = require('../controllres/commentsController')
const {verifyToken, verifyTokenAndAdmin}= require('../middlewares/verifyToken')
const validateObjectId = require('../middlewares/validateObjectId')

// /api/comments
router.route("/")
    .post(verifyToken , createCommentCtrl)
    .get(verifyTokenAndAdmin ,getAllCommentsCtrl )

//  /api/comments/:id 
router.route("/:id")
    .delete(validateObjectId , verifyToken , deleteCommentsCtrl )
    .put(validateObjectId ,verifyToken, updateCommentsCtrl )

module.exports = router