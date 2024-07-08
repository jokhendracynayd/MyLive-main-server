const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_sub_admin');
const rc = require('../controllers/responseController');
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/database");
const e = require('express');
const TableModelUserBalance=require('../models/m_user_wallet_balance')
const ResellerTableModel=require('../models/m_agency_reseller_wallate_balence');
const asyncErrorHandler = require('../utilis/asyncErrorHandler');

router.post('/create',
    (req, res) => {
        console.log(req.body);
        bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
                res.json({
                    success: false,
                    msg: "error!",
                    data: err.message
                })
            }else{
                const newRow=new TableModel({
                    name:req.body.name,
                    email:req.body.email,
                    mobile:req.body.mobile,
                    adminRole:req.body.adminRole,
                    password:req.body.password,
                    hashPassword:hash
                })
                if(!newRow){
                    return res.json({
                        success:false,
                        msg:"Not user created",
                    })
                }else{
                    TableModel.addRow(newRow,(err,doc)=>{
                        if(err){
                            return res.json({
                                success:false,
                                msg:err.message
                            })
                        }else{
                            return res.json({
                                success:true,
                                msg:"User created",
                                data:doc,
                            })
                        }
                    })
                }
            }
        })       
    }
);



router.route('/create-reseller').post(asyncErrorHandler(async (req, res) => {
    const {email,password,name,mobile,adminRole}=req.body;
    // validate all the fields
    if(!email || !password || !name || !mobile || !adminRole){
        return res.json({
            success:false,
            msg:"All fields are required"
        })
    }
    // check if the user already exists or not with email or mobile
    const user = await TableModel.Table.findOne({$or:[{email},{mobile}]});
    if(user){
        return res.json({
            success:false,
            msg:"Reseller already exists with this email or mobile"
        })
    }
    // create the new user
    // hash the password
    const hashPassword = await bcrypt.hash(password,10);
    // validate hash password
    if(!hashPassword){
        return res.json({
            success:false,
            msg:"Something went wrong"
        })
    }
    // create the new user
    const newUser = new TableModel.Table({
        name,
        email,
        mobile,
        adminRole,
        password,
        hashPassword
    });
    // save the user
    const savedUser = await newUser.save();
    if(!savedUser){
        return res.json({
            success:false,
            msg:"Reseller not created"
        })
    }
    // create the wallet for the user
    const newWallet = new ResellerTableModel.Table({
        ra_id:savedUser._id,
        ra_r_coin:0,
        ra_type:adminRole,
        created_at:Date.now(),
        created_by:savedUser._id,
        last_update:Date.now(),
        delete_status:"false"
    });
    // save the wallet
    const savedWallet = await newWallet.save();
    if(!savedWallet){
        return res.json({
            success:false,
            msg:"Reseller wallet not created"
        })
    }
    // send the response
    return res.json({
        success:true,
        msg:"Reseller created successfully!",
        data:savedUser
    })
}));


router.get('/',
   // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        console.log('')
        TableModel.getData((err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'All Data Fetched',
                    data: docs
                });
            }
        })
    }
);


/**
 * @description this route to update r-coind and diamond value from admin panle @jokhendra
 */

router.post('/updatercoin',async(req,res)=>{
    const {user_id,user_rcoin,user_diamond}=req.body;
    const fillter1={"user_id":user_id};
    const newData={"user_rcoin":user_rcoin,"user_diamond":user_diamond}
    await TableModelUserBalance.upadateByfieldName(fillter1,newData,(err,doc)=>{
        if(err){
            res.json({
                success:false,
                msg:err.message
            })
        }else{
            // console.log(doc);
            rc.setResponse(res,{
                success:true,
                msg:"successfully",
                data:doc
            })
        }
    })
})


router.get('/byId/:id',
   // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const id = req.params.id;
        TableModel.getDataById(id, (err, doc) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Fetched',
                    data: doc
                });
            }
        })
    }
);

router.post('/byField',
    //// passport.authenticate("jwt", { session: false }),
    (req, res) => {
        console.log(req.body);
        const fieldName = req.body.fieldName;
        const fieldValue = req.body.fieldValue;
        TableModel.getDataByFieldName(fieldName, fieldValue, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Fetched',
                    data: docs
                });
            }
        })
    }
);

router.post('/byFields',
   // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const fieldNames = req.body.fieldNames;
        const fieldValues = req.body.fieldValues;
        TableModel.getDataByFieldNames(fieldNames, fieldValues, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Fetched',
                    data: docs
                });
            }
        })
    }
);

router.put('/change-reseller-password',(req,res)=>{
    let {id,new_password,old_password}=req.body;
    TableModel.getDataById(id,(err,doc)=>{
        if(err){
            return res.json({
                success:false,
                msg:err.message
            })
        }else{
            if(doc==null){
                return res.json({
                    success:false,
                    msg:"User not found"
                })
            }else{
                if(doc.password==old_password){
                    bcrypt.hash(new_password, 10, (err, hash) => {
                        if (err) {
                            res.json({
                                success: false,
                                msg: "error!",
                                data: err.message
                            })
                        }else{
                            TableModel.updateRow(id,{password:new_password,hashPassword:hash},(err,doc)=>{
                                if(err){
                                    return res.json({
                                        success:false,
                                        msg:err.message
                                    })
                                }else{
                                    return res.json({
                                        success:true,
                                        msg:"Password changed",
                                        data:doc,
                                    })
                                }
                            })
                        }
                    })
                }else{
                    return res.json({
                        success:false,
                        msg:"Old password not matched"
                    })
                }
            }
        }
    })
})



//<< Custom APIs Created By Ziggcoder//
router.post('/byCreatedBetween',
   // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const startdate = req.body.startdate;
        const enddate = req.body.enddate;
        TableModel.getDataByCreatedBetween(startdate, enddate, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Fetched',
                    data: docs
                });
            }
        })
    }
);
//Custom APIs Created By Ziggcoder >>//


router.put('/update/:id',
   // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        TableModel.updateRow(req.params.id, req.body, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Updated',
                    data: docs
                });
            }
        })
    }
);

router.delete('/byId/:id',
   // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        TableModel.deleteTableById(req.params.id, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Deleted',
                    data: docs
                });
            }
        })
    }
);

/**
 * custom functions
 */

// function for updating data via user_id

router.put('/updateViaUserID/:id',
    //// passport.authenticate("jwt", { session: false }),
    (req, res) => {

        console.log(req.body);
        TableModel.updateViaUser_idRow(req.params.id, req.body, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Updated',
                    data: docs
                });
            }
        })
    }
);

// for fetching the information

router.post('/loginFromAdminPanel',
    (req, res) => {
        var email = req.body.email;
        var password = req.body.password;
        var adminRole=req.body.adminRole;
        console.log("this is inside the Admin panel",email,password,adminRole)
        TableModel.loginViaAdminPanel(email,adminRole,(err,user)=>{
            if(err){
                return rc.setResponse(res,{
                    msg:err.message
                })
            }else{
                console.log("this is user",user);
                if(user==null){
                    return res.status(500).json({
                        success:false,
                        msg:"No user found",
                    })
                }else{
                    TableModel.comparePassword(password,user.hashPassword,(err,isMatch)=>{
                        if(err){
                            return res.json({
                                success:false,
                                msg:"Something went wrong",
                            })
                        }if(isMatch){
                            var t_user = {
                                id: user._id,
                                name: user.name,
                                mobile: user.mobile,
                                email: user.email,
                                adminRole: user.adminRole,
                            };
                            const token = jwt.sign(t_user, config.secret, {
                                expiresIn: 604800,
                                });
                                res.status(200).json({
                                success: true,
                                msg: "Welcome " + user.name,
                                token: "JWT " + token,
                                user: t_user,
                            });
                        }
                        else{
                            return res.json({
                                success:false,
                                msg:"Password does not match",
                            })
                        }
                    })
                }
            }
        })
    }
);
module.exports = router;