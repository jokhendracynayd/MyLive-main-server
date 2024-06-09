var nodemailer = require('nodemailer');


  function sendMailAPI(Mailto,Mailsubject,Mailtext){
    
    
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: 'cynaydsolutions@gmail.com',
        pass: 'ujbdhaolzsupwsyh'
        }
    });


  
    var mailOptions = {
        from: 'cynaydsolutions@gmail.com',
        to: Mailto,
        subject: Mailsubject,
        text: Mailtext
    };
  
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
        console.log(error);
        } else {
        console.log('Email sent: ' + info.response);
        }
    });

  }

  module.exports = {sendMailAPI};