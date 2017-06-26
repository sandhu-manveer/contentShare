require('dotenv').load();
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_ID, // Your email id
        pass: pricess.env.EMAIL_PASSWORD // Your password
    }
});

/**
 * Send verification mail to user
 */
var sendVerificationEmail = function(message, callback) {
    var mailOptions={
        from: process.env.EMAIL_ID,
        to : message.email,
        subject : 'Activation Id',
        text : message.verifyURL
    }
    console.log('here');
    transporter.sendMail(mailOptions, function(error, response){
        if(error) callback(error);
        else callback(response);
    });
}

module.exports = {
    sendVerificationEmail
}