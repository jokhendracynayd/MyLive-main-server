require('dotenv').config();
const twilio = require('../config/smsconfig');
const client = require('twilio')(twilio.accountSid, twilio.authToken);

const sendSms = (req,res,next) => {
  const {mobile}=req.body;
 if((mobile==null || mobile==undefined || mobile=="") ){
  res.json({
    success:false,
    msg:"mobile not provided"
  })
 }else{
  client.verify.v2.services(twilio.serviceId)
  .verifications
  .create({to: mobile, channel: 'sms'})
  .then(verification => {
    console.log(verification)
    req.body.verification=verification.sid;
    next();
  })
  .catch(err=>{
    req.body.err=err;
    next();
  });
 }
}


const verifyDonalive=(req,res,next)=>{
  const {mobile,otp}=req.body;
 if((mobile==null || mobile==undefined || mobile=="")||(otp==null || otp==undefined || otp=="") ){
  res.json({
    success:false,
    msg:"mobile or otp not provided"
  })
 }else{
  client.verify.v2.services(twilio.serviceId)
  .verificationChecks
  .create({to: mobile, code:otp})
  .then(data=>{
   if(data.status=='approved'&&data.valid==true){
     next();
    }else{
      console.log(data);
      res.json({
        success:false,
        msg:"otp not verified"
      })
    }
  }).catch(err=>{
    res.json({
      success:false,
      msg:"something went wrong"
    })
  });
 }
}

module.exports = {sendSms,verifyDonalive};