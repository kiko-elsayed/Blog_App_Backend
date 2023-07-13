const { sendResetPasswordLinkCtrl, getResetPasswordLinkCtrl, ResetPasswordCtrl } = require('../controllres/passwordController')
const router = require('express').Router()


// /api/password/reset-password-link
router.post('/reset-password-link' , sendResetPasswordLinkCtrl)

// /api/password/reset-password/:userId/:token
router.route('/reset-password/:userId/:token')
    .get( getResetPasswordLinkCtrl)
    .post(ResetPasswordCtrl)


module.exports = router