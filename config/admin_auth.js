const jwt = require('jsonwebtoken');
const config= require('../config/database')
const TableModelSub_admin=require('../models/m_sub_admin');

var admin_authentication=(req,res,next)=>{
  let token;
  const {authorization}=req.headers;
  token=authorization.split(' ')[1];
  const {id,email,name,mobile,adminRole}=jwt.verify(token,config.secret);
  let a_id=id;
  let a_email=email;
  let a_name=name;
  let a_mobile=mobile;
  let a_adminRole=adminRole;
  TableModelSub_admin.getDataById(id,(err,doc)=>{
    if(err){
      console.log(err.message);
    }else{
      if(doc==null){
        res.json({
          success:false,
          msg:"UnAuthorization Admin",
        })
      }
      else{
        let{_id,name,email,mobile,adminRole}=doc;
        if(_id==a_id&&name==a_name&&email==a_email&&mobile==a_mobile&&adminRole==a_adminRole){
         next();
        }
        else{
          res.json({
            success:false,
            msg:"UnAuthorization Admin",
          })
        }
      }

    }
  })
}

module.exports=admin_authentication;