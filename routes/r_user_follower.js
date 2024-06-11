const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_user_follower');
const TableModelLogin=require('../models/m_user_login')
const rc = require('../controllers/responseController');
const passport = require("passport");
const TableBlock=require('../models/m_user_block');
const authenticate=require('../config/user_auth');
const asyncErrorHandler = require('../utilis/asyncErrorHandler');
const {sendNotification} =require('../controllers/push_notification')

//TODO: New API for follow and unfollow

router.route('/follow-unfollow').post(asyncErrorHandler(async(req,res)=>{
    const {follower_UID,primary_UID} = req.body;
    if(!follower_UID || !primary_UID){
        return res.json({
            success:false,
            data:{},
            msg:"Please provide all the fields"
        })
    }
    const isUser = await TableModel.Table.aggregate([
        {
            $match: {
                $and: [
                    { follower_UID: follower_UID },
                    { primary_UID: primary_UID }
                ]
            }
        },
    ]).exec();
    if(isUser.length == 0){
        // Here we will follow the user
        const newFollower = new TableModel.Table(req.body);
        let isSave = await newFollower.save();
        if(isSave){
            return res.json({
                success:true,
                data:isSave,
                msg:"User followed"
            })
        }
    }
    const ok = await TableModel.Table.findByIdAndUpdate(isUser[0]._id, { $set: { status: !isUser[0].status }},{new:true}).exec();
    if(ok){
        return res.json({
            success:true,
            data:ok,
            msg:"User unfollowed"
        })
    }
}));


router.post('/create',asyncErrorHandler(async(req,res,next)=>{
    const {follower_userID,primary_userId}=req.body;
    if(follower_userID&&primary_userId){
        const isUser = await TableModel.Table.aggregate([
            {
                $match: {
                    $and: [
                        { follower_userID: follower_userID },
                        { primary_userId: primary_userId }
                    ]
                }
            },
        ]).exec();
        if(isUser.length==0){
            // make follow
            const newRow = new TableModel.Table(req.body);
            if (!newRow) {
                return rc.setResponse(res, {
                    msg: 'No Data to insert'
                });
            }
            TableModel.Table.addRow(newRow,async (err, doc) => {
                if (err) {
                    return rc.setResponse(res, {
                        msg: err.message
                    });
                }
                else {
                    // const user = await TableModelLogin.Table.findOne({username:primary_userId}).exec();
                    // const user2 = await TableModelLogin.Table.findOne({username:follower_userID}).exec();
                    // if(user && user2.device_token){
                    //     let body = `${user.user_nick_name||user.username} started following you`;
                    //     sendNotification(user2.device_token,body);
                    // }
                    return rc.setResponse(res, {
                        success: true,
                        msg: 'Data Inserted',
                        data: doc
                    });
                }
            })
        }else{
            // make un follow
            const ok = await TableModel.Table.findByIdAndUpdate(isUser[0]._id, { $set: { status: !isUser[0].status }},{new:true}).exec();
            if(ok){
                if(!isUser[0].status){
                    // const user = await TableModelLogin.Table.findOne({username:primary_userId}).exec();
                    // const user2 = await TableModelLogin.Table.findOne({username:follower_userID}).exec();
                    // if(user && user2.device_token){
                    //     let body = `${user.user_nick_name||user.username} started following you`;
                    //     sendNotification(user2.device_token,body);
                    // }
                }
                return res.json({
                    success:true,
                    msg:"made un follow",
                    data:ok
                })
            }else{
                return res.json({
                    success:false,
                    msg:"something is wrong"
                })
            }
        }
    }else{
        return res.json({
            success:false,
            msg:"Please provide all the fields"
        })
    }
}))


router.post('/block&unblock',(req,res)=>{
    const {from_user_id,to_user_id}=req.body;
    TableBlock.checkUser(from_user_id,to_user_id,(err,doc)=>{
        if(err){
            return res.json({
                success:false,
                msg:err.message
            })
        }else{
            if(doc.length==0){
                const newRow=new TableBlock(req.body);
                if(newRow){
                    TableBlock.addRow(newRow,(err,docs)=>{
                        if(err){
                            return res.json({
                                success:false,
                                msg:err.message
                            })
                        }else{
                            return res.json({
                                success:true,
                                msg:"data insterted",
                                data:docs
                            })
                        }
                    })
                }
                else{
                    return res.json({
                        success:false,
                        msg:"something is wrong",
                    })
                }
            }else{
                if(doc[0].status=='block'){
                    TableBlock.updateRow(doc[0]._id,{status:'unblock'},(err,docss)=>{
                        if(err){
                            return res.json({
                                success:false,
                                msg:err.message,
                            })
                        }
                        else{
                            return res.json({
                                success:true,
                                msg:"data updated",
                                data:docss,
                            })
                        }
                    })
                }
                else if(doc[0].status=='unblock'){
                    TableBlock.updateRow(doc[0]._id,{status:'block'},(err,docss)=>{
                        if(err){
                            return res.json({
                                success:false,
                                msg:err.message,
                            })
                        }
                        else{
                            return res.json({
                                success:true,
                                msg:"data updated",
                                data:docss,
                            })
                        }
                    })
                }
            }
        }
    })
})


router.post('/userblocklist',(req,res)=>{
    const {user_id,status}=req.body;
    TableBlock.blockList(user_id,status,(err,doc)=>{
        if(err){
            console.log(err.message);
        }else{
            res.json(doc);
        }
    })
  
})

router.post('/blockOrunblock',(req,res)=>{
    const {from_user_id,to_user_id}=req.body;
    TableBlock.checkUser(from_user_id,to_user_id,(err,doc)=>{
        if(err){
            console.log(err.message);
        }else{
            res.json(doc);
        }
    })
})
router.get('/',
    // passport.authenticate("jwt", { session: false }),
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


/**
 * @description this code is writen for find the friend of primary_user @jokhendra
 */
router.post('/friends',
// authenticate,
async(req,res)=>{
    const {fieldName,fieldValue}=req.body;
    TableModel.getDataByFieldName(fieldName,fieldValue,(err,doc)=>{
        if(err){
            return rc.setResponse(res,{
                msg:err.message
            })
        }else{
            if(doc.length==0){
                return rc.setResponse(res,{
                    success:true,
                    msg:"No friends"
                })
            }
            let array1=new Array();
            let array2=new Array();
            for(var i=0;i<Object.keys(doc).length;i++){
                array1[i]=doc[i].follower_userID
            }
            TableModel.getDataByFieldName("follower_userID",fieldValue,(err,docs)=>{
                if(err){
                    return rc.setResponse(res,{
                        msg:err.message
                    })
                }else{
                    if(docs==null){
                        return rc.setResponse(res,{
                            msg:"no friends",
                            data:docs
                        })
                    }
                    for(var i=0;i<Object.keys(docs).length;i++){
                        array2[i]=docs[i].primary_userId
                    }
                }
                let result = array1.filter(x => array2.includes(x));
               
                friendName(result,(response)=>{
                    return rc.setResponse(res,{
                        success:true,
                        msg:"Data fetched",
                        data:response,
                    })
                })
               function friendName(data,callback){
                let sendToData=[];
                let count=0;
                data.forEach(ele=>{
                    TableModelLogin.getDataByFieldName("username",ele,(err,doc)=>{
                        if(err){
                            console.log(err.message);
                        }else{
                            sendToData.push(doc);
                            count++;
                            if(data.length==count){
                                callback(sendToData)
                            }
                        }
                    })
                })
               }

            })
        }
    })
})


/**
 * @description count the follower of specific user
 */


//TODO: Check user is following or not

router.route('/isFollowing').post(asyncErrorHandler(async(req,res)=>{
    const {follower_UID,primary_UID} = req.body;
    if(!follower_UID || !primary_UID){
        return res.json({
            success:false,
            data:{},
            msg:"Please provide all the fields"
        })
    }
    const isUser = await TableModel.Table.findOne({
        follower_UID: follower_UID,
        primary_UID: primary_UID,
        status: true
    });
    console.log(isUser);
    if(isUser){
        return res.json({
            success:true,
            data:{
                isFollowing:true
            },
            msg:"User is not following"
        })
    }
    return res.json({
        success:true,
        data:{
            isFollowing:false
        },
        msg:"User is following"
    })
}));

//TODO: New API for count the follower of specific user

router.route('/followers-followings/:UID').get(asyncErrorHandler(async(req,res)=>{
    const UID = req.params.UID;
    if(!UID){
        return res.json({
            success:false,
            data:{},
            msg:"Please provide all the fields"
        })
    }
    const results = await TableModel.Table.aggregate([
        {
            $facet: {
                followers: [
                    { $match: { primary_UID: UID, status: true } },
                    { $count: "count" }
                ],
                following: [
                    { $match: { follower_UID: UID, status: true } },
                    { $count: "count" }
                ]
            }
        }
    ]).exec();
    
    const followers = results[0].followers[0] ? results[0].followers[0].count : 0;
    const followings = results[0].following[0] ? results[0].following[0].count : 0;
    return res.json({
        success:true,
        data:{
            followers,
            followings
        },
        msg:"Follower count"
    })
}));


// router.post('/numberOfFollower',
// async (req, res) => {
//     const { fieldName, fieldValue } = req.body
//     TableModel.getDataByFieldName(fieldName, fieldValue, (err, docs) => {
//         if (err) {
//             return rc.setResponse(res, {
//                 msg: err.message
//             })
//         } else {
//             if(docs.length==0){
//                 return rc.setResponse(res,{
//                     success:false,
//                     msg:'user not found'
//                 })
//             }
//             followerWithUser(docs,(response)=>{
//                 return rc.setResponse(res,{
//                     success:true,
//                     msg:"Data fetch",
//                     data:response
//                 })
//             })
//             function followerWithUser(docs,callback){
//                 let sendToData=[]
//                 let count=0;

//                 const promise=docs.map((ele)=>{
//                     return new Promise(async(resolve,reject)=>{
//                         if(fieldName=="follower_userID"){
//                             TableModelLogin.getDataByFieldName("UID",ele.primary_userId,(err,doc)=>{
//                                 if(err){
//                                     console.log(err.message)
//                                 }else{
//                                     if(doc.length==0){
//                                         return rc.setResponse(res,{
//                                             msg:"user not found"
//                                         })
//                                     }
//                                     ele.nick_name=doc[0].user_nick_name;
//                                     ele.user_profile_pic=doc[0].user_profile_pic;
//                                     sendToData.push(ele);
//                                     count++;
//                                     if(docs.length==count){
//                                         callback(sendToData);
//                                     }
//                                 }
//                             })
//                         }else{
//                             let user = await TableModelLogin.findOne({UID:ele.follower_userID})
//                             if(user){
//                                 ele.nick_name=user.user_nick_name;
//                                 ele.user_profile_pic=`https://apimylive.collegespike.com/socket-server/api/v2/users/get-profile-pic/${user.UID}`;
//                                 sendToData.push(ele);
//                                 count++;
//                                 if(docs.length==count){
//                                     callback(sendToData);
//                                 }
//                             }
//                             // TableModelLogin.getDataByFieldName("UID",ele.follower_userID,(err,doc)=>{
//                             //     if(err){
//                             //         console.log(err.message)
//                             //     }else{
//                             //         if(doc.length==0){
//                             //             return rc.setResponse(res,{
//                             //                 msg:"user not found"
//                             //             })
//                             //         }
//                             //         ele.nick_name=doc[0].user_nick_name;
//                             //         ele.user_profile_pic=`https://apimylive.collegespike.com/socket-server/api/v2/users/get-profile-pic/${doc[0].UID}`;
//                             //         sendToData.push(ele);
//                             //         count++;
//                             //         if(docs.length==count){
//                             //             callback(sendToData);
//                             //         }
//                             //     }
//                             // })
//                         }
//                     })
//                 })
//                 Promise.all(promise).then((response)=>{
//                     callback(response)
//                 })
//             }
//         }
//     })

// })

router.post('/byField',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {

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
 * custom routes
 */

router.post('/findFollower/',
// authenticate,
    (req, res) => {

        var PrimaryUser1 = req.body.primary_userId;
        var SecondaryUser1 = req.body.follower_userID;


        TableModel.findFollowerOption(PrimaryUser1, SecondaryUser1, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                let data;
                if(docs==null){
                    data="userNotFound"
                }else{
                    data="userFound"
                }
                return rc.setResponse(res, {
                    success: true,
                    msg: data,
                    data: docs
                });
            }
        })
    }
);

module.exports = router;