const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_official_talent');
const TableModel1=require('../models/m_user_wallet_balance');
const rc = require('./../controllers/responseController');
const passport = require("passport");
const authenticate=require("../config/admin_auth");
const TableModelLiveStreaming=require('../models/m_live_streaming');
const {startAndendDate} =require('../utilis/get_hours_coins')
const {hoursAndCoins,newHoursAndCoins}=require('../utilis/get_hours_coins');
const authenticate1=require('../config/user_auth');
const asyncErrorHandler=require('../utilis/asyncErrorHandler');
const customError=require('../utilis/customError');
const API=require('../config/api');
const {ObjectId}=require('mongoose').Types;
const UserGiftingTable = require("../models/m_user_gifting");
const AgencyModel = require("../models/m_agency_info");
const {upload4} = require('./file');


// TODO: New API for host create
// upload4.single('file'), 
router.route('/create').post(asyncErrorHandler(async (req, res) => {
    let { UID, real_name, streaming_type, agencyId, email,mobile_no } = req.body;
    // let IDPicPath = req.file.filename;
    let validateFields = [UID, real_name, streaming_type, agencyId, email];
    let isValid = validateFields.every(ele => ele && ele !== undefined && ele !== null);
  
    if (!isValid) {
      return res.json({
        success: false,
        msg: "All fields are required",
      });
    }
  
    // Check if the user is already a host or not with UID or email
    let checkHost = await TableModel.Table.findOne({ $or: [{ UID: UID }, { email: email }] });
  
    if (checkHost) {
      return res.json({
        success: false,
        msg: "User is already a host",
      });
    }
  
    // Check if agency id is valid or not
    const agency = await AgencyModel.Table.findOne({ agency_code: agencyId,approval_status:"Approved" });
    if (!agency) {
      return res.json({
        success: false,
        msg: "Agency id is not valid",
      });
    }
  
    // Normalize and process the data
    email = email.toLowerCase().trim().normalize('NFKC');
    streaming_type = streaming_type.toLowerCase().trim().normalize('NFKC');
  
    // Create a new host
    const newRow = new TableModel.Table({
      UID: UID,
      real_name: real_name,
      streaming_type: streaming_type,
      agencyId: agencyId,
      IDPicPath: "default.jpg",
      email: email,
      mobile_no,
    });
  
    const IsNewHost = await newRow.save();
  
    if (IsNewHost) {
      return res.json({
        success: true,
        msg: "Host created",
        data: IsNewHost,
      });
    } else {
      return res.json({
        success: false,
        msg: "Host not created",
      });
    }
}));


router.route('/form-status/:UID').get(asyncErrorHandler(async(req, res) => {
    const UID = req.params.UID;
    if (!UID) {
      return res.json({ 
        success: false,
        msg: "UID is required"
      });
    }
    const data = await TableModel.Table.findOne({ UID: UID ,delete_status:false});
    if(data){
      return res.json({
          success:true,
          msg:"Data",
          data:data.host_status
      })
    }
    return res.json({
      success: true,
      msg: "Apply for host",
    });
}));

router.get('/agency-portal-official-talent/:agency_code',asyncErrorHandler(async(req,res)=>{
    const agency_code=req.params.agency_code;
    if(!agency_code||agency_code==undefined||agency_code==null){
        throw new customError("Agency code is required",400);
    }
    const data = await TableModel.Table.aggregate([
        {
          $match: {
            agencyId: agency_code,
            host_status: "accepted"
          }
        },
        {
          $lookup: {
            from: "user_wallet_balances",
            localField: "user_id",
            foreignField: "user_id",
            as: "user_wallet_balance"
          }
        },
        {
          $project: {
            _id: 0, // Exclude the "_id" field if you want
            user_id: 1,
            email: 1,
            streaming_type: 1,
            real_name: 1,
            created_at: 1,
            r_rcoin: { $arrayElemAt: ["$user_wallet_balance.user_rcoin", 0] } // Project the r_coin field
          }
        }
      ]).exec();
      
    res.json({
        success:true,
        msg:"Data",
        data:data||[]
    })
}))


router.route('/admin-official-talent/:id').get(asyncErrorHandler(async(req, res) => {
    const id = req.params.id;

    const data = await TableModel.Table.aggregate([
        {
            $match: {
                _id: ObjectId(id)
            }
        },{
            $lookup: {
                from: "user_logins",
                localField: "user_id",
                foreignField: "username",
                as: "user_data"
            }
        },
        {
            $project: {
                _id: 1,
                real_name:1,
                user_id:1,
                agencyId:1,
                IDPicPath:1,
                email:1,
                host_status:1,
                streaming_type:1,
                created_at:1,
                user_profile_pic:{
                    $cond: {
                        if: {
                            $regexMatch: {
                                input: { $arrayElemAt: ["$user_data.user_profile_pic", 0] },
                                regex: /^https:/
                            }
                        },
                        then: { $arrayElemAt: ["$user_data.user_profile_pic", 0] },
                        else: {
                            $concat: [
                                `${API.Api}/file/download/`,
                                { $arrayElemAt: ["$user_data.user_profile_pic", 0] }
                            ]
                        }
                    }
                }
            }
        }
    ]).exec();
    res.json({
        success: true,
        msg: "Data",
        data: data[0]
    })

}));


router.route('/daily-live-duration/:userId/:days').get(asyncErrorHandler(async(req, res) => {
    let {userId,days}=req.params;
    const currentDate = new Date();
    const dayOfMonth = currentDate.getUTCDate(); // Use getUTCDate to get the day in UTC
    let startDate, endDate;
    if(days==15){
        startDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1));
        endDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 15, 23, 59, 59, 999));
    }
    else if(days==30){
        startDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 16));
        endDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    }else if(days=='monthly'){
        startDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1));
        endDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    }
    const data = await TableModelLiveStreaming.Table.aggregate([
        {
          $match: {
            user_id: userId,
            live_streaming_end_time: { $exists: true },
            live_streaming_start_time: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $project: {
            live_streaming_start_time: 1,
            // live_streaming_end_time: 1,
            coins: 1,
            // live_name: 1,
          },
        },
        {
          $addFields: {
            // Calculate the start of the 24-hour interval for each document
            intervalStart: {
              $dateFromParts: {
                year: { $year: "$live_streaming_start_time" },
                month: { $month: "$live_streaming_start_time" },
                day: { $dayOfMonth: "$live_streaming_start_time" },
                hour: 0,
                minute: 0,
                second: 0,
                millisecond: 0,
              },
            },
          },
        },
        {
          $group: {
            _id: "$intervalStart", // Group by the calculated interval start
            data: { $push: "$$ROOT" }, // Store the grouped documents in an array
          },
        },
      ]);

    let dataToSend=[];
    data.forEach((ele)=>{
        let coins=0;
        ele.data.forEach((e)=>{
            coins+=e.coins;
        })
        let obj={
            date:ele._id,
            coins:coins
        }
        dataToSend.push(obj);
    })
    dataToSend.sort((a, b) => new Date(a.date) - new Date(b.date));
    return res.json({
        success:true,
        msg:"Data",
        data:dataToSend
    });
}));


router.route("/host-live-duration/:userId").get(asyncErrorHandler(async (req, res, next) => {
    // first get the data from the table for the user id and then pass it to the function
    // first get data from the table only 15 days data
    const userId = req.params.userId;
    if (!userId)
      return res.json({ success: false, msg: "User id is required" });
    const currentDate = new Date();
    const dayOfMonth = currentDate.getUTCDate(); // Use getUTCDate to get the day in UTC
    
    let startDate, endDate;
    if (dayOfMonth >= 1 && dayOfMonth <= 15) {
      // Current date is between 1st and 15th day of the month
      startDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1));
      endDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 15, 23, 59, 59, 999));
    } else {
      // Current date is after the 15th day of the month
      startDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 16));
      endDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    }
    const data = await TableModelLiveStreaming.Table.aggregate([
      {
        $match: {
          user_id: userId,
          live_streaming_end_time: { $exists: true },
          live_streaming_start_time: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $project: {
          live_streaming_start_time: 1,
          live_streaming_end_time: 1,
          coins: 1,
          live_name: 1,
        },
      },
      {
        $addFields: {
          // Calculate the start of the 24-hour interval for each document
          intervalStart: {
            $dateFromParts: {
              year: { $year: "$live_streaming_start_time" },
              month: { $month: "$live_streaming_start_time" },
              day: { $dayOfMonth: "$live_streaming_start_time" },
              hour: 0,
              minute: 0,
              second: 0,
              millisecond: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: "$intervalStart", // Group by the calculated interval start
          data: { $push: "$$ROOT" }, // Store the grouped documents in an array
        },
      },
    ]);
    
    await newHoursAndCoins(data).then(async(response) => {
      
      let coinsAsCoHost = await UserGiftingTable.Table.aggregate([
        {
          $match: {
            gifting_to_user: userId,
            role: "co-host",
            created_at: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalCoins: {
              $sum: "$gift_price",
            },
          },
        },
      ]);
      return res.json({
        success: true,
        msg: "Data fetched",
        data:{
            total_audio:response.audio_hours,
            total_video:response.video_hours,
            eligible_hours:response.eligible_hours,
            total_days:response.days,
            coins_as_host: coinsAsCoHost[0] ? coinsAsCoHost[0].totalCoins : 0,
            total_coins:response.coins
        }
      });
    });
    
}));
  



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

router.put('/updateHostDetails',(req,res)=>{
    const {real_name,mobile_no,country,state,address,streaming_type,nationalIdNo,id}=req.body;
    TableModel.updateRow(id,{real_name,mobile_no,country,state,address,streaming_type,nationalIdNo},(err,doc)=>{
        if(err){
            console.log(err.message);
        }else{
            res.json({
                success:true,
                msg:"Data updated",
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

router.post('/byFieldOfficial',(req,res)=>{
    const {fieldNames,fieldValues}=req.body;
    TableModel.getDataByFieldNames(fieldNames, fieldValues, async(err, docs) => {
        if (err) {
            return rc.setResponse(res, {
                msg: err.message
            })
        } else {
            fetchUserR_coin(docs,(response)=>{
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Fetched',
                    data: response                
                });
            });
            function fetchUserR_coin(docss,callback){
                let sendToData=[]
                let count=0;

                docss.forEach((ele)=>{
                     // console.log('get info of ' + ele.user_id);
                    TableModel1.getDataByFieldName("user_id",ele.user_id,(err,doc)=>{
                        if(err){
                            console.log(err.message)
                        }else{
                            ele._doc.coins=doc.user_rcoin;
                            sendToData.push(ele);
                            count++;
                            if(docss.length==count){
                                callback(sendToData);
                            }
                        }
                    })
                    
                })                
            }
        }
    })

})


router.post('/total-earning',(req,res)=>{
    console.log(req.body);
    const fieldName="agencyId";
    const fieldValue=req.body.agencyId;
    TableModel.getDataByFieldName(fieldName,fieldValue,(err,doc)=>{
        if(err){
            console.log(err.message);
            res.json(err.message)
        }
        else{
            if(doc.length==0){
                res.json(0)
            }else{
                res.json(doc);
            }
        }
    })
})

router.post('/byField',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const fieldName = req.body.fieldName;
        const fieldValue = req.body.fieldValue;
        TableModel.getDataByFieldName(fieldName, fieldValue, async(err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                if(docs.length==0){
                   return  res.json({
                        success:true,
                        msg:"No data found",
                        data:docs
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
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const fieldNames = req.body.fieldNames;
        const fieldValues = req.body.fieldValues;
        
        console.log(req.body);

        TableModel.getDataByFieldNames(fieldNames, fieldValues, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                if(docs.length==0){
                    return res.json({
                        success:true,
                        msg:'No user Found',
                        data:docs
                    })
                }else{
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Fetched',
                    data: docs
                });
            }
            }
        })
    }
);

router.route('/update/:id').put(asyncErrorHandler(async(req, res) => {
    if(req.body.host_status=="deleted"){
        //
        let isDeleted = await TableModel.Table.findByIdAndDelete(req.params.id);
        if(isDeleted){
            return res.json({
                success: true,
                msg: "Data deleted"
            })
        }
        else{
            return res.json({
                success: false,
                msg: "Data not deleted"
            })
        }
    }
    const isUpdate = await TableModel.Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if(isUpdate){
        return res.json({
            success: true,
            msg: "Data updated",
            data: isUpdate
        })
    }
    else{
        return res.json({
            success: false,
            msg: "Data not updated"
        })
    }
}));

// router.put('/update/:id',
//     // passport.authenticate("jwt", { session: false }),
//     (req, res) => {

//         TableModel.updateRow(req.params.id, req.body, (err, docs) => {
//             if (err) {
//                 return rc.setResponse(res, {
//                     msg: err.message
//                 })
//             } else {
//                 return rc.setResponse(res, {
//                     success: true,
//                     msg: 'Data Updated',
//                     data: docs
//                 });
//             }
//         })
//     }
// );

router.delete('/byId/:id',
    authenticate,
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