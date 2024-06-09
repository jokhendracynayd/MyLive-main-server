const jwt = require('jsonwebtoken');
const config= require('../config/database')
const TableModelUser=require('../models/m_user_login');

var user_authentication=(req,res,next)=>{
  let token;
  const {authorization}=req.headers;
  token=authorization.split(' ')[1];
  const {id,email,username,mobile}=jwt.verify(token,config.secret);
  let u_id=id;
  let u_email=email;
  let u_username=username;
  let u_mobile=mobile;
  TableModelUser.getDataById(id,(err,doc)=>{
    if(err){
      console.log(err)
    }else{
      if(doc==null){
        res.json({
          success:false,
          msg:'UnAuthorization User',
        })
      }else{
        let{_id,username,email,mobile}=doc;
        if(_id==u_id&&username==u_username&&email==u_email&&mobile==u_mobile){
         next();
        }
        else{
          res.json({
            success:false,
            msg:"UnAuthorization User",
          })
        }
      }
    }
  })
}

module.exports=user_authentication;