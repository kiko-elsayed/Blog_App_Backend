const bcrypt = require ('bcryptjs')
const asyncHandler = require('express-async-handler')
const {User ,validateEmail, validateNewPassword } = require('../models/User')
const crypto = require("crypto")
const sendEmail = require("../utils/sendEmail")
const VerificationToken = require('../models/VerificationToken')



// sent reset password link -- (/api/password/reset-password-link) --- post ---public
module.exports.sendResetPasswordLinkCtrl = asyncHandler ( async(req,res)=>{
    // 1- validation
    const {error} = validateEmail(req.body)
    if (error) {
        return res.status(400).json({message : error.message})
    }
    // 2-get user from DB by email 
    const user = await User.findOne({email : req.body.email})
    if (!user) {
        return res.status(404).json({message : "user with this email is not exist"})
    }
    // 3-create verification link
    let verificationToken = await VerificationToken.findOne({userId : user._id})
    if (!verificationToken) {
        verificationToken = new VerificationToken({
            userId: user._id,
            token : crypto.randomBytes(32).toString("hex")
        })
    }
    // 4- creating link
    const link = `${process.env.CLIENT_DOMAIN}/reset-password/${user._id}/${verificationToken.token}`

    // 5- creating html link
    const htmlTemplate = `<a href="${link}">click here to reset your password</a>`

    // 6- sending Email
    await sendEmail(user.email , "reset password" , htmlTemplate )

    // 7- response to client
    res.status(200).json({message : "password reset link sent to your email , please check your email"})
})


// get reset password link -- (/api/password/reset-password/:userId/:token) --- get ---public
module.exports.getResetPasswordLinkCtrl = asyncHandler ( async(req,res)=>{
    const user =await User.findById(req.params.userId) 
    if (!user) {
        return res.status(400).json({message : "invalid link"})
    }

    const verificationToken = await VerificationToken.findOne({
        userId : user._id ,
        token   : req.params.token
    })
    if (!verificationToken) {
        return res.status(400).json({message : "invalid link"})
    }

    res.status(200).json({message : "Valid Url"})

})


//  reset password  -- (/api/password/reset-password/:userId/:token) --- post ---public
module.exports.ResetPasswordCtrl = asyncHandler ( async(req,res)=>{
    // validation to check password
    const {error} = validateNewPassword(req.body)
    if ( error ) {
        return res.status(400).json({ message: error.message})
    }
    // check user in DB
    const user = await User.findById(req.params.userId)
    if (!user) {
        return res.status(404).json({ message: "user not found , in this invalid link"})
    }
    // check the token
    const verificationToken = await VerificationToken.findOneAndUpdate ({
        userId : user._id ,
        token : req.params.token
    })
    if (!verificationToken) {
        return res.status(40).json({ message: " invalid link "})
    }
    //check user Account verified or not
    if (!user.isAccountVerified) {
        user.isAccountVerified = true
    }
    // hash the pass in DB
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password , salt)
    // update new Password in DB
    user.password = hashedPassword
    await user.save()
    await verificationToken.deleteOne(); // deleteOne
    // user.verificationToken = undefined

    //response to the client
    res.status(200).json({message : " password reset successfully, please login"})
})

