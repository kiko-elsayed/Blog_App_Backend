const express = require('express')
const router = express.Router()
const {getAllUsersCtrl, getUserProfileCtrl , updateUserProfileCtrl, getUsersCountCtrl, profilePhotoUploadCtrl, deleteUserProfileCtrl} = require('../controllres/usersController');
const {  verifyTokenAndAdmin, verifyTokenAndOnlyUser, verifyToken, verifyTokenAndAuthorization } = require('../middlewares/verifyToken');
const validateObjectId = require('../middlewares/validateObjectId');
const photoUpload = require('../middlewares/photoUpload');

//  /api/users/profile
router.get('/profile' , verifyTokenAndAdmin , getAllUsersCtrl )

//  /api/users/profile/:id
router.get("/profile/:id" ,validateObjectId , getUserProfileCtrl  )

//  /api/users/profile/:id
router.put("/profile/:id" ,validateObjectId ,verifyTokenAndOnlyUser, updateUserProfileCtrl)

//  /api/users/profile/:id
router.delete("/profile/:id" ,validateObjectId ,verifyTokenAndAuthorization, deleteUserProfileCtrl)

//  /api/users/profile/profile-photo-upload
router.post('/profile/profile-photo-upload' , verifyToken, photoUpload.single("image") , profilePhotoUploadCtrl )

//  /api/users/count
router.get('/count' , verifyTokenAndAdmin , getUsersCountCtrl )


module.exports = router;  