const bcrypt = require ('bcryptjs')
const asyncHandler = require('express-async-handler')
const {User ,validateRegisterUser, validateLoginUser } = require('../models/User')
const VerificationToken = require('../models/VerificationToken')
const crypto = require("crypto")
const sendEmail = require("../utils/sendEmail")

// register new user

module.exports.registerUserCtrl = asyncHandler (async (req ,res)=>{
    // validation
    const {error} = validateRegisterUser(req.body)
    if (error) {
        return res.status(400).json({message : error.message})
    }
    //is user already exist
    let user = await User.findOne({email : req.body.email})
    if (user) {
        return res.status(400).json({message:"user already exist"})
    }
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await  bcrypt.hash(req.body.password , salt )

    //new user and save it to DB
    user = new User({
        username: req.body.username,
        email: req.body.email,
        password : hashedPassword
    })
    await user.save();

///////// send email Verification
    // 1- Create new VerificationToken & save it in DB
    const verificationToken = new VerificationToken({
        userId : user._id ,
        token : crypto.randomBytes(32).toString("hex")
    });
    await verificationToken.save();
    // 2- making the link
    const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`

    // 3- put email in html template
    const htmlTemplate = `
        <div>
            <p>click on the link below to verify your email</p>
            <a href="${link}"> Verify </a>
        </div>
    `
    // 4- send email to the user
    await sendEmail (user.email , "Verify your Email" , htmlTemplate)


    //send response to client
    res.status(200).json({message :" verify your email address , we sent an email to you  "})
})


// login user

module.exports.loginUserCtrl = asyncHandler(async (req,res)=>{
    //validation
    validateLoginUser
    const {error} = validateLoginUser(req.body)
    if (error) {
        return res.status(400).json({message : error.message})
    }

    //is user exist
    const user = await User.findOne({email: req.body.email})
    if (!user) {
        return res.status(400).json({message : "invalid email or password"})
    }

    //check pass
    const isPasswordMatch = await bcrypt.compare(req.body.password , user.password )
    if (!isPasswordMatch) {
        return res.status(400).json({message : "invalid email or password"})
    }

    // sending email (verify account)
    if (!user.isAccountVerified) {
        let verificationToken = await VerificationToken.findOne({
            userId : user._id
        })
        if (!verificationToken) {
            verificationToken = new VerificationToken({
                userId : user._id ,
                token : crypto.randomBytes(32).toString("hex")
            })
            await verificationToken.save();
        }
        // 2- making the link
        const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`

        // 3- put email in html template
        const htmlTemplate = `
            <div>
                <p>click on the link below to verify your email</p>
                <a href="${link}"> Verify </a>
            </div>
        `
        // 4- send email to the user
        await sendEmail (user.email , "Verify your Email" , htmlTemplate)
        

        res.status(400).json({message :" verify your email address , we sent an email to you  "})
    }

    // generate token
    const token = user.generateAuthToken();

    res.status(200).json({
        _id : user._id ,
        username : user.username,
        isAdmin : user.isAdmin ,
        profilePhoto : user.profilePhoto,
        token
    })
    //response to client

})


// Verify user account -- (/api/auth/:userId/verify/:token) --- get --- public

module.exports.verifyUserAccountCtrl = asyncHandler(async(req , res)=>{
    const user = await User.findById(req.params.userId);
    if (!user) {
        return res.status(400).json({message : "invalid link"})
    }

    // check the token
    const verificationToken = await VerificationToken.findOne({
        userId : user._id ,
        token: req.params.token
    })

    if (!verificationToken) {
        return res.status(400).json({message : "invalid link"})
    }
    user.isAccountVerified = true
    user.verificationToken = undefined

    await user.save();

    // await verificationToken.remove();

    res.status(200).json({message : " your account verified"})
})
















