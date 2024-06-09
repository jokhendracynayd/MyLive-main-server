const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_live_streaming_join_user_requests');
const TableLiveStreaming = require('../models/m_live_streaming');
const rc = require('./../controllers/responseController');
const passport = require("passport");
const user_authentication = require('../config/user_auth');
const TableModelUserGifting = require('../models/m_user_gifting');
const asyncErrorHandler = require('../utilis/asyncErrorHandler')

//  {
//    "live_streaming_id": "65606c6a1480487817249e36",
//    "request_by_user_id": "115352",
//    "request_to_user_id": "115725",
//    "request_accept_status": "pending",
//    "request_sent_by": "host",
//    "stream_type": "audioParty" || "videoLive",
//  }

router.route('/create').post(asyncErrorHandler(async (req, res) => {
    const { live_streaming_id, request_to_user_id, request_by_user_id, stream_type, request_sent_by } = req.body;
    // Validate all the fields
    const requiredFields = [live_streaming_id, request_to_user_id, request_by_user_id, stream_type, request_sent_by];
    if (requiredFields.some((item) => !item)) {
        return res.json({
            success: false,
            msg: "Please provide all the fields",
        });
    }
    let maxCount = 2;
    if (stream_type === 'audioParty') {
        maxCount = 12;
    }
    const count = await TableModel.Table.countDocuments({
        live_streaming_id,
        request_accept_status: 'accepted',
        stream_type
    });
    console.log(maxCount, count);
    if (count >= maxCount) {
        return res.json({
            success: false,
            show: true,
            msg: `${stream_type==='audioParty'?'Audio Party':'Live Video'} is full.`,
        });
    }
    const filter = {
        $or: [
            { request_to_user_id, live_streaming_id, request_by_user_id },
            { request_to_user_id: request_by_user_id, live_streaming_id, request_by_user_id },
            { request_to_user_id, live_streaming_id, request_by_user_id: request_to_user_id }
        ]
    };
    const update = { $set: { request_accept_status: "expired" } };
    const isOk = await TableModel.Table.updateMany(filter, update);
    const newRow = await new TableModel.Table(req.body).save();
    return res.json({
        success: true,
        msg: "Data Inserted",
        data: newRow,
    });
}));

router.post(
  "/create",
  async(req, res) => {
    const userId = req.body.request_to_user_id;
    const live_streaming_id = req.body.live_streaming_id;
    const byUserId=req.body.request_by_user_id;


    const filter = {
    $or: [
      { request_to_user_id: userId, live_streaming_id: live_streaming_id, request_by_user_id: byUserId },
      { request_to_user_id: byUserId, live_streaming_id: live_streaming_id, request_by_user_id: byUserId },
      { request_to_user_id: userId, live_streaming_id: live_streaming_id, request_by_user_id: userId }
    ]
  };

    const update = { $set: { request_accept_status: "expired" }};

    let isOk = await TableModel.Table.updateMany(filter, update);
    const newRow = await new TableModel.Table(req.body).save();
    return res.json({
        success: true,
        msg: "Data Inserted",
        data: newRow,
    });
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
    (req, res) => {    
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

router.post('/byFields',
    // user_authentication,
    (req, res) => {
        const fieldNames = req.body.fieldNames;
        const fieldValues = req.body.fieldValues;
        TableModel.getUsernamePic(fieldNames, fieldValues, (err, docs) => {
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




router.route('/live-seats').post(asyncErrorHandler(async (req, res) => {
    const { live_streaming_id,request_accept_status } = req.body;
    let UsersDetails = await TableModel.Table.aggregate([
        { 
            $match: { 
                live_streaming_id: live_streaming_id, 
                request_accept_status: request_accept_status 
            } 
        },
        {
            $lookup: {
                from: 'user_logins',
                localField: 'request_to_user_id',
                foreignField: 'username',
                as: 'userDetails'
            }
        },
        {
            $unwind: '$userDetails' // Unwind the array
        },
        {
            $addFields: {
                user_nick_name: '$userDetails.user_nick_name',
                username: '$userDetails.username',
                user_profile_pic: '$userDetails.user_profile_pic',
                level: '$userDetails.level',
                coins: 0
            }
        },
        {
            $project: {
                userDetails: 0,
            }
        }
    ]);
    
    if(UsersDetails.length==0){     
        return res.json({
            success: true,
            msg: "Data Fetched",
            data: Array(12).fill({request_accept_status: false})
        });
    }
    let usernames = [];
    UsersDetails.forEach((item) => {
        usernames.push(item.username);
    })
    let userGifts = await TableModelUserGifting.Table.find({livestreaming_id:live_streaming_id,gifting_to_user:{$in:usernames}});
    UsersDetails.map(item=>{
        userGifts.map(gift=>{
            if(item.username==gift.gifting_to_user){
                item.coins+=gift.gift_price;
            }
        })
    })
    let temp = [...UsersDetails,...Array(12-UsersDetails.length).fill({request_accept_status: false})]
    return res.json({
        success: true,
        msg: "Data Fetched",
        data: temp,
    });
}));


//TODO: Delete this code



function addCoinsToUser(live_streaming_id,data){
    return new Promise((resolve,reject)=>{
        let fieldNames=['gifting_to_user','livestreaming_id'];
        let fieldValues=[data.userDetails[0].username,live_streaming_id];
        TableModelUserGifting.getDataByFieldNames(fieldNames,fieldValues,(err,docs)=>{
            if(err){
                reject(err);
            }else{
                if(docs.length==0){
                    resolve(0);
                }else{
                    let coins=0;
                let count=0;
                docs.forEach((doc)=>{
                    coins+=parseInt(doc.gift_price);
                    count++;
                    if(docs.length==count){
                        resolve(coins);
                    }
                })
            }
            }
        })
    })
}

// fieldNames=["live_streaming_id","request_accept_status"];
// fieldValues=[live_streaming_id,"accepted"];




router.post('/byFieldsWithCoins',(req,res)=>{
    const fieldNames = req.body.fieldNames;
    const fieldValues = req.body.fieldValues;
    let index=fieldNames.indexOf('live_streaming_id');
    let live_streaming_id=fieldValues[index];
    TableModel.getUsernamePic(fieldNames, fieldValues, (err, docs) => {
        if (err) {
            return rc.setResponse(res, {
                msg: err.message
            })
        } else {
            if(docs.length==0){
                res.json({
                    success:false,
                    msg:'No data found',
                    data:[]
                })
            }
            else{
                TableLiveStreaming.getDataById(docs[0].live_streaming_id,async(err,doc)=>{
                    if(err){
                        res.json({
                            success:false,
                            msg:err.message
                        })
                    }else{
                        if(!doc){
                            res.json({
                                success:false,
                                msg:'No data found',
                                data:docs,
                            })
                        }else{
                            docs[0].coins=doc.coins
                            let count=0;
                            docs.forEach(async(item,index)=>{
                                await addCoinsToUser(live_streaming_id,item).then((data)=>{
                                   docs[index].coins=data;
                                    count++;
                                    if(docs.length==count){
                                        return rc.setResponse(res, {
                                            success: true,
                                            msg: 'Data Fetched',
                                            data: docs
                                        });
                                    }
                                }).catch((err)=>{
                                    docs[index].coins=0;
                                    count++;
                                    if(docs.length==count){
                                        return rc.setResponse(res, {
                                            success: true,
                                            msg: 'Data Fetched',
                                            data: docs
                                        });
                                    }
                                })
                            })
                           
                        }
                    }
                })
            }
        }
    })
})


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


/**
 * custom routes
 */


// router for dissabled the live streaming

router.put('/updateViaLiveStreamingID/:id',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {

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


// removing user from the seat by userid

router.put('/removefromSeatbyUserId/:id',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {

        TableModel.removefromSeatbyUserId(req.params.id, (err, docs) => {
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

module.exports = router;