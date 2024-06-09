const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_agency_info');
const HostTable=require('../models/m_official_talent');
const WalletTable=require('../models/m_user_wallet_balance');
const LiveStreamingTable=require('../models/m_live_streaming');
const rc = require('../controllers/responseController');
const passport = require("passport");
const jwt = require("jsonwebtoken");
const config = require("../config/database");
const {getNewTotal_salary,hoursAndCoins,newHoursAndCoins,getTotal_salary,PrevstartAndendDate}=require('../utilis/get_hours_coins')
const {date_format}=require('../utilis/date_formater');
const asyncErrorHandler  = require('../utilis/asyncErrorHandler')

router.route('/change-agency-passwrod').put(asyncErrorHandler(async(req,res,next)=>{
    let {id,new_password,old_password}=req.body;
    console.log(req.body);
    let isAgency = await TableModel.Table.findById(id);
    if(!isAgency){
        return res.json({
            success:false,
            msg:"No agency found"
        })
    }
    if(old_password!=isAgency.password){
        return res.json({
            success:false,
            msg:"Old password is not correct"
        })
    }
    TableModel.updateRow(id,{password:new_password},(err,doc)=>{
        if(err){
            return res.json({
                success:false,
                msg:err.message
            })
        }else{
            return res.json({
                success:true,
                msg:"Password updated"
            })
        }
    })
}));




router.post('/create',
    //// passport.authenticate("jwt", { session: false }),
    (req, res) => {
        // const newRow = req.body;
        const newRow = new TableModel(req.body);
    
        // newRow.institute = req.user.institute;
        if (!newRow) {
            return rc.setResponse(res, {
                msg: 'No Data to insert'
            });
        }else{
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
            });
        }
       
    }
);



router.route('/topAgency').get(asyncErrorHandler(async(req,res,next)=>{
    // First find all Agency 
    // then find all host of that agency which are accepted
    // then find all host wallet balance

    TableModel.Table.aggregate([
        {
          $match: {
            approval_status: 'Approved'
          }
        },
        {
          $lookup: {
            from: 'offical_talents', // Use the actual collection name for Host model
            localField: 'agency_code',
            foreignField: 'agencyId',
            as: 'approved_hosts'
          }
        },
        {
          $unwind: '$approved_hosts'
        },
        {
          $match: {
            'approved_hosts.host_status': 'accepted'
          }
        },
        {
          $lookup: {
            from: 'user_wallet_balances', // Use the actual collection name for UserWalletBalance model
            localField: 'approved_hosts.user_id',
            foreignField: 'user_id',
            as: 'user_wallet_balance'
          }
        },
        {
          $unwind: '$user_wallet_balance'
        },
        {
          $group: {
            _id: '$agency_code',
            username: { $first: '$special_approval_name' },
            profile_pic: { $first: '$user_profile_pic' },
            total: { $sum: '$user_wallet_balance.user_rcoin' }
          }
        }
          ,{
            $sort: {
                total: -1
            }
        },
        // limit to 10
        {
          $limit: 100
        }
      ])
      .exec((err, result) => {
        if (err) {
          
          return res.json({
            success:false,
            msg:err.message 
          })
        }
        return res.json({
            success:true,
            msg:'All data get',
            data:result
        });
      });
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


router.post('/makeZero',async(req,res)=>{
    const {fieldNames,fieldValues}=req.body;

    console.log(req.body);

    HostTable.getDataByFieldNames(fieldNames,fieldValues,async(err,doc)=>{
        if(err){
            res.json({
                success:false,
                msg:err.message
            })
        }else{
            if(doc.length==0){
                res.json({
                    success:false,
                    msg:"No data found"
                })
            }else{
                let count=0;
                doc.forEach(ele=>{
                    WalletTable.getDataByField({user_id:ele.user_id},async(err,docs)=>{
                        if(err){
                            res.json({
                                success:false,
                                msg:err.message
                            })
                        }else{
                            WalletTable.movetoOldTable(docs._id,async(err,doc1)=>{
                                if(err){
                                    console.log(err.message);
                                }else{
                                    console.log(doc1);
                                    count++;
                                    if(count==doc.length){
                                        res.json({
                                            success:true,
                                            msg:"All data updated"
                                        })
                                    }
                                }
                            })
                        }
                    })
                })
            }
        }
    })
})


router.post('/salaryProccess', asyncErrorHandler(async (req, res) => {
    const { agency_code, days } = req.body;
    let dataTosend = [];
    let fieldNames = ["agencyId", "host_status"];
    let fieldValues = [agency_code, "accepted"]; 
    HostTable.getDataByFieldNames(fieldNames, fieldValues, async (err, doc) => {
        if (err) {
            res.json({
                success: false,
                msg: err.message
            });
        } else {
            if (doc.length == 0) {
                res.json({
                    success: false,
                    msg: "No data found"
                });
            } else {
                let count = 0;
                const currentDate = new Date("2023-12-14T04:28:49.587+00:00");
                const dayOfMonth = currentDate.getUTCDate();
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
                doc.forEach(ele => {
                    WalletTable.getDataByFieldOld({ user_id: ele.user_id }, async (err, docs) => {
                        if (err) {
                            res.json({
                                success: false,
                                msg: err.message
                            });
                        } else {
                            // Check if docs is null or undefined
                            if (docs == null || typeof docs === 'undefined') {
                                count++;
                                if (count == doc.length) {
                                    res.json({
                                        success: true,
                                        msg: 'All Data get',
                                        data: dataTosend
                                    });
                                }
                            } else {
                                const data = await LiveStreamingTable.Table.aggregate([
                                    {
                                      $match: {
                                        user_id: ele.user_id,
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
                                  await newHoursAndCoins(data).then(async response => {
                                        let dataToPush = {};
                                        dataToPush.user_id = ele.user_id;
                                        dataToPush.real_name = ele.real_name;
                                        dataToPush.agencyId = ele.agencyId;
                                        dataToPush.coutry = ele.country;
                                        dataToPush.email = ele.email;
                                        dataToPush.total_coins = docs.user_rcoin;
                                        dataToPush.total_hours = response.eligible_hours;
                                        dataToPush.total_days = response.days;
                                        dataToPush.join_date = ele.created_at?.toLocaleDateString().split('T')[0] //date_format(ele.created_at);
                                        dataToPush.streaming_type = ele.streaming_type;
                                        await getNewTotal_salary(docs.user_rcoin, dataToPush).then(salary => {
                                            dataTosend.push(salary);
                                            count++;
                                            if (count == doc.length) {
                                                res.json({
                                                    success: true,
                                                    msg: 'All Data get',
                                                    data: dataTosend
                                                });
                                            }
                                        });
                                  });
                                
                            }
                        }
                    });
                });
            }
        }
    });
}));






router.post('/prevSalaryProccess',async(req,res)=>{
    const {agency_code,days}=req.body;
    let dataTosend=[];
    let fieldNames=["agencyId","host_status"];
    let fieldValues=[agency_code,"accepted"]
    HostTable.getDataByFieldNames(fieldNames,fieldValues,async(err,doc)=>{
        if(err){
            res.json({
                success:false, 
                msg:err.message
            })
        }else{
            if(doc.length==0){
                res.json({
                    success:false,
                    msg:"No data found"
                })
            }else{
                let count=0;
                var startDay;
                var endDay;
                await PrevstartAndendDate(days).then(day=>{
                    startDay=day.startDay;
                    endDay=day.lastDay;
                })
                doc.forEach(ele=>{
                    WalletTable.oldBalance({user_id:ele.user_id},async(err,docs)=>{
                        if(err){
                           res.json({
                            success:false,
                            msg:err.message
                           })
                        }else{
                            LiveStreamingTable.getSpecificDuration(ele.user_id,startDay,endDay,async(err,doc1)=>{
                                if(err){
                                    res.json({
                                        success:false,
                                        msg:err.message
                                    })
                                }else{
                                   if(docs!=null){
                                    await hoursAndCoins(doc1).then(async data=>{
                                        let dataToPush={};
                                            dataToPush.user_id=ele.user_id;
                                            dataToPush.real_name=ele.real_name;
                                            dataToPush.agencyId=ele.agencyId;
                                            dataToPush.coutry=ele.country;
                                            dataToPush.email=ele.email;
                                            dataToPush.total_coins=docs.user_rcoin;
                                            dataToPush.total_hours=data.durations;
                                            dataToPush.total_days=data.days;
                                            dataToPush.join_date=ele.created_at;
                                        await getTotal_salary(docs.user_rcoin,dataToPush).then(salary=>{
                                            dataTosend.push(salary);
                                            count++;
                                            if(count==doc.length){
                                                res.json({
                                                    success:true,
                                                    msg:'All Data get',
                                                    data:dataTosend
                                                })
                                            }
                                        })
                                    })
                                   }else{
                                    await hoursAndCoins(doc1).then(async data=>{
                                        let dataToPush={};
                                            dataToPush.user_id=ele.user_id;
                                            dataToPush.real_name=ele.real_name;
                                            dataToPush.agencyId=ele.agencyId;
                                            dataToPush.coutry=ele.country;
                                            dataToPush.email=ele.email;
                                            dataToPush.total_coins=0;
                                            dataToPush.total_hours=data.durations;
                                            dataToPush.total_days=data.days;
                                            dataToPush.join_date=ele.created_at;
                                        await getTotal_salary(0,dataToPush).then(salary=>{
                                            dataTosend.push(salary);
                                            count++;
                                            if(count==doc.length){
                                                res.json({
                                                    success:true,
                                                    msg:'All Data get',
                                                    data:dataTosend
                                                })
                                            }
                                        })
                                    })
                                   }
                                }
                            })                       
                        }
                    })
                })
            }
                   
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
                if(docs.length==0){
                    return rc.setResponse(res,{
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


/**
 * @description get all host coins of specific agency 
 * 
 */






router.route('/all-hostCoins').post(asyncErrorHandler(async(req,res,next)=>{
    const {fieldNames,fieldValues}=req.body;
    let query = {};
    for (let i = 0; i < fieldNames.length; i++) {
        const fieldName = fieldNames[i];
        const fieldValue = fieldValues[i];
        query[fieldName] = fieldValue;
    }
    const data = await HostTable.Table.aggregate([
        {
          $match: query // Your matching criteria
        },
        {
          $lookup: {
            from: 'user_wallet_balances',
            localField: 'user_id',
            foreignField: 'user_id',
            as: 'wallet'
          }
        },
        {
          $unwind: '$wallet'
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $ifNull: ['$wallet.user_rcoin', 0] // If user_rcoin is null, use 0
              }
            }
          }
        },
        {
          $project: {
            _id: 0, // Exclude the _id field
            total: 1   // Include only the 'total' field
          }
        }
      ]);
      
      // data[0].total will contain the total sum or 0 if there are no matching records
      
    return res.json({
        success:true,
        show:false,
        msg:'All data get',
        data:data[0].total || 0
    })
}));


router.post('/prevall-hostCoins',(req,res)=>{
    const {fieldNames,fieldValues}=req.body;
    HostTable.getDataByFieldNames(fieldNames,fieldValues,(err,doc)=>{
        if(err){
            res.json({
                success:false,
                msg:err.message
            })
        }else{
            console.log(doc)
            getAllHostCoins(doc,(response)=>{
                res.json({
                    success:true,
                    msg:'All Date get',
                    data:response
                })
            })
            function getAllHostCoins(data,callback){
                let count=0;
                let allCoins=0;
                data.forEach(ele=>{
                    WalletTable.oldBalance({'user_id':ele.user_id},(err,docs)=>{
                        if(err){
                            res.json({
                                success:false,
                                msg:err.message
                            })                        
                        }else{
                            if(docs!=null){
                                allCoins+=Number(docs.user_rcoin);
                            count++;
                            if(data.length==count){
                                callback(allCoins);
                            }
                            }else{
                                count++;
                                if(data.length==count){
                                    callback(allCoins);
                                }
                            }
                        }
                    })
                })
            }
        }
    })
})


/**
 * @description get all live Streaming durations of host for specific Agency;
 */



router.post('/Prevall-hostDurations/:getDays',(req,res)=>{
    const {fieldNames,fieldValues}=req.body;
    HostTable.getDataByFieldNames(fieldNames,fieldValues,(err,doc)=>{
        if(err){
            res.json({
                success:false,
                msg:err.message,
            })
        }else{ 
            let count=0;
            let totalHours=0;
            let totalMinutes=0;
            let totalSeconds=0;
            let days=0;      
            doc.forEach(ele=>{
                PrevstartAndendDate(req.params.getDays).then(day=>{
                    LiveStreamingTable.getSpecificDuration(ele.user_id,day.startDay,day.lastDay,(err,docs)=>{
                        if(err){
                            console.log(err.message);
                        }else{
                            hoursAndCoins(docs).then(data=>{
                                let arr=data.durations.split(":");
                                let hours=Number(arr[0]);
                                let minutes=Number(arr[1]);
                                let seconds=Number(arr[2]);
                                days+=Number(data.days);
                                totalHours+=hours;
                                totalMinutes+=minutes;
                                totalSeconds+=seconds;
                                if(totalMinutes>=60){
                                    totalHours++;
                                    totalMinutes-=60;
                                }
                                else if(totalSeconds>=60){
                                    totalMinutes++;
                                    totalSeconds-=60;
                                }
                                count++;
                                if(count==doc.length){
                                    res.json({
                                        success:true,
                                        durations:`${totalHours<10?'0'+totalHours:totalHours}:${totalMinutes<10?'0'+totalMinutes:totalMinutes}:${totalSeconds<10?'0'+totalSeconds:totalSeconds}`,
                                        days
                                    })
                                }
                            })
                        }
                    })
                })
            })
        }
    })

})


router.post('/all-hostDurations/:getDays',asyncErrorHandler(async(req,res)=>{
    const {fieldNames,fieldValues}=req.body;
    HostTable.getDataByFieldNames(fieldNames,fieldValues,(err,doc)=>{
        if(err){
            res.json({
                success:false,
                msg:err.message,
            })
        }else{ 
            let count=0;
            let totalHours=0;
            let totalMinutes=0;
            let totalSeconds=0;
            let days=0;   
            const currentDate = new Date("2023-12-14T04:28:49.587+00:00");
            const dayOfMonth = currentDate.getUTCDate();
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
            doc.forEach(async ele=>{
                const data = await LiveStreamingTable.Table.aggregate([
                    {
                      $match: {
                        user_id: ele.user_id,
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
                await newHoursAndCoins(data).then(async response => {
                    let arr = response.eligible_hours.split(":");
                    let hours = Number(arr[0]);
                    let minutes = Number(arr[1]);
                    let seconds = Number(arr[2]);
                    days += Number(response.days);
                    totalHours += hours;
                    totalMinutes += minutes;
                    totalSeconds += seconds;
                    if (totalMinutes >= 60) {
                        totalHours++;
                        totalMinutes -= 60;
                    }
                    else if (totalSeconds >= 60) {
                        totalMinutes++;
                        totalSeconds -= 60;
                    }
                    console.log(totalHours, totalMinutes, totalSeconds, days);
                    count++;
                    if (count == doc.length) {
                        res.json({
                            success: true,
                            durations: `${totalHours < 10 ? '0' + totalHours : totalHours}:${totalMinutes < 10 ? '0' + totalMinutes : totalMinutes}:${totalSeconds < 10 ? '0' + totalSeconds : totalSeconds}`,
                            days
                        })
                    }
                });
            })
           
        }
    })
}));


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
    //// passport.authenticate("jwt", { session: false }),
    (req, res) => {

        var email = req.body.email;
        var password = req.body.password;
        console.log(email, password)
        TableModel.loginViaAdminPanel(email, password, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                if(docs!=null){
                    var t_user = {
                        id: docs._id,
                        username: docs.username,
                        agency_code: docs.agency_code,
                        email: docs.email,
                        special_approval_name:docs.special_approval_name
                      };
                      const token = jwt.sign(t_user, config.secret, {
                        expiresIn: 604800,
                      });
                      res.json({
                        success: true,
                        msg: "Welcome " + docs.username,
                        token: "JWT " + token,
                        user: t_user,
                      });
                }else{
                    res.json({
                        success:false,
                        msg:'Invalid Credentials'
                    })
                }
            }
        })
    }
);

module.exports = router;