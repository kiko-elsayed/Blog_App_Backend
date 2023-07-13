const nodemailer = require("nodemailer")
const smtp = require('nodemailer-smtp-transport')

module.exports = async(userEmail , subject , htmlTemplate)=>{
    try {
        const transporter = nodemailer.createTransport(
            smtp({
                service : "gmail",
                auth : {
                    user : process.env.APP_EMAIL_ADDRESS  , //sender
                    pass : process.env.APP_EMAIL_PASSWORD
                }
            })
            
        )

        // mail option
        const mailOption = {
            from : process.env.APP_EMAIL_ADDRESS , // sender
            to : userEmail ,
            subject : subject ,
            html : htmlTemplate
        }
        console.log(mailOption);
        const info =  transporter.sendMail(mailOption , (err,info)=>{
            if (err) {
                console.error(err);
            }else{
                console.log("email sended");
            }
        })
        // console.log("email sent" + info.response);

    } catch (error) {
        console.log(error);
        throw new Error("internal server error (nodemailer")
    }
}