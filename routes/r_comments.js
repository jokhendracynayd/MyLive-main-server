const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_comments');
const rc = require('./../controllers/responseController');
const passport = require("passport");
const LoginUserModel=require('../models/m_user_login');
const axios=require('axios');
const api=require('../config/api');

router.post('/create',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        // const newRow = req.body;
        const newRow = new TableModel(req.body);
        
        console.log(req.body);
        
        // newRow.institute = req.user.institute;
        if (!newRow) {
            return rc.setResponse(res, {
                msg: 'No Data to insert'
            });
        }
        TableModel.addRow(newRow, (err, doc) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                });
            } else {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Inserted',
                    data: doc
                });
            }
        })
    }
);

router.get('/',
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
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

router.get('/byId/:id',
    passport.authenticate("jwt", { session: false }),
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
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const fieldName = req.body.fieldName;
        const fieldValue = req.body.fieldValue;
        TableModel.getDataByFieldName(fieldName, fieldValue, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                if(docs.length==0){
                    return rc.setResponse(res,{
                        msg:'No data found'
                    })
                }
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Fetched',
                    data: docs
                });
            }
        })
    }
);


//TODO:New comment by username

router.post('/commentUsername',async(req,res)=>{
    const {fieldNames,fieldValues}=req.body;
    TableModel.getUsername(fieldNames,fieldValues,async(err,docs)=>{
        if(err){
            res.json({
                success:false,
                msg:err.message
            })
        }
        else{
            if(docs.length==0){
                return res.json({
                    success:true,
                    msg:'No data found',
                    data:docs
                })
            }else
            {
                let count=0;
                await docs.map(async(curr)=>{
                    await axios.post(`${api.Api}/giftTransation/getLevel`,{user_id:curr.userDetails[0].username}).then(response=>{
                        if(response.data.success){
                            curr.userDetails[0].level=response.data.data.level
                            count++;
                            if(count==docs.length){
                                return res.json({
                                    success:true,
                                    msg:"Data fetched",
                                    data:docs
                                })
                            }
                        }
                      }).catch(err=>{
                        curr.userDetails[0].level=0;
                        count++;
                        if(count==docs.length){
                            return res.json({
                                success:true,
                                msg:"Data fetched",
                                data:docs
                            })
                        }
                      })
                })
            }

        }
    })

})

// router.post('/commentUsername',(req,res)=>{
//     const {fieldNames,fieldValues}=req.body;
//     let index=fieldNames.indexOf("comment_by_user_id")
//     let userId=fieldValues[index];
//     let payload={user_id:userId}
//     axios.post('https://3.7.87.3:3000/api/giftTransation/getLevel',payload).then(response=>{
//         if(response.data.success){
//             const {fieldNames,fieldValues}=req.body;
//             TableModel.getUsername(fieldNames,fieldValues,async(err,docs)=>{
//                 if(err){
//                 res.json(err.message)
//             }else{
//                 res.json({
//                     success:true,
//                     msg:"Data fetched",
//                     data:docs,
//                     level:response.data.data.level
//                 })
//             }
//             })
//         }else{
//             const {fieldNames,fieldValues}=req.body;
//             TableModel.getUsername(fieldNames,fieldValues,async(err,docs)=>{
//                 if(err){
//                 res.json(err.message)
//             }else{
//                 res.json({
//                     success:true,
//                     msg:"Data fetched",
//                     data:docs,
//                 })
//             }
//             })
//         }
//     }).catch(err=>{
//         const {fieldNames,fieldValues}=req.body;
//         TableModel.getUsername(fieldNames,fieldValues,async(err,docs)=>{
//             if(err){
//             res.json(err.message)
//         }else{
//             res.json({
//                 success:true,
//                 msg:"Data fetched",
//                 data:docs,
//             })
//         }
//         })
//     })

    
// })
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
                if(docs.length==0){
                    return rc.setResponse(res,{
                        msg:'No data found'
                    })
                }
                setName(docs,(response)=>{
                    return rc.setResponse(res,{
                        success:true,
                        msg:"Data fetched",
                        data:response
                    })
                })
                function setName(data,callback){
                    let count=0;
                    let sentToData=[];
                    data.forEach(ele=>{
                        LoginUserModel.getDataByFieldName("username",ele.
                        comment_by_user_id,(err,docss)=>{
                            if(err){
                                console.log(err.message);
                            } 
                            else{
                                ele._doc.user_nick_name=docss[0].user_nick_name;
                                ele._doc.user_profile_pic=docss[0].user_profile_pic;
                                sentToData.push(ele)
                                count++;
                                if(data.length==count){
                                    callback(sentToData);
                                }
                            }                           
                        })

                    })
                }
               
            }
        })
    }
);

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
    passport.authenticate("jwt", { session: false }),
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

module.exports = router;