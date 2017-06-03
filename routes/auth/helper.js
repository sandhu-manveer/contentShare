var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'testmailidforprojects@gmail.com', // Your email id
        pass: 'sasquatchyeti' // Your password
    }
});

/**
 * Send verification mail to user
 */
var sendVerificationEmail = function(message, callback) {
    var mailOptions={
        from: 'testmailidforprojects@gmail.com',
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