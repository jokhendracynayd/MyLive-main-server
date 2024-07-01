// Production mode

const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_user_login');
const rc = require('./../controllers/responseController');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/database");
const TableModelUserInfo = require('../models/m_user_info');
const TableModelUserBalance=require('../models/m_user_wallet_balance');
const CounterTableModel=require('../models/counter')
const {hashPassword} = require('../controllers/passwordHash');
const {getNextSequenceValue}=require('../utilis/idIncreament')
const {sendSms,verifyDonalive}=require('../controllers/smsController')
const authenticate=require('../config/user_auth');
const asyncErrorHandler = require('../utilis/asyncErrorHandler');
const transactionTable = require('../models/m_transaction');
const axios = require('axios');
const API = require('../config/api');
const {lookup} = require('geoip-lite');
const client = require('../config/redis');
const StickerTransacationModel = require('../models/user.sticker.transaction.models');

router.route('/top-daily-sender/:UID').get(asyncErrorHandler(async (req, res, next) => {
    let UID = req.params.UID;
    // Validate UID
    if (!UID) {
        return res.json({
            success: false,
            msg: "UID is required"
        });
    }
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let topSender = await StickerTransacationModel.aggregate([
        {
            $match: {
                receiver_UID: UID,
                role_of_receiver: "host",
            }
        },
        {
            $group: {
                _id: "$sender_UID",
                total: { $sum: "$giftPrice" }
            }
        },
        {
            $sort: {
                total: -1
            }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from: "user_logins",
                localField: "_id",
                foreignField: "UID",
                as: "user_data"
            }
        },
        {
            $project: {
                _id: 0,
                UID: "$_id",
                total: 1,
                user_nick_name: { $arrayElemAt: ["$user_data.user_nick_name", 0] },
                level: { $arrayElemAt: ["$user_data.level", 0] },
                user_profile_pic: {
                    $cond: {
                        if: {
                            $eq: [
                                { $substr: [{ $arrayElemAt: ["$user_data.user_profile_pic", 0] }, 0, 8] },
                                "https://"
                            ]
                        },
                        then: { $arrayElemAt: ["$user_data.user_profile_pic", 0] },
                        else: {
                            $concat: [
                                `${API.SocketAPI}/users/get-profile-pic/`,
                                { $arrayElemAt: ["$user_data.UID", 0] }
                            ]
                        }
                    }
                }
            }
        }
    ]);
    return res.json({
        success: true,
        message: "Top daily sender",
        data: topSender
    });
}));


async function getTopUsers(filter) {
    const aggregationPipeline = [
        {
            $match: {
                transaction_type: filter.transaction_type,
                transaction_status: "success",
                sender_type: "user",
                receiver_type: "user",
                "entity_type.type": filter.entity_type,
                transaction_date: filter.dateRange
            }
        },
        {
            $group: {
                _id: "$sender_id",
                total: { $sum: "$transaction_amount" }
            }
        },
        {
            $sort: {
                total: -1
            }
        },
        {
            $limit: 100
        },
        {
            $lookup: {
                from: "user_logins",
                localField: "_id",
                foreignField: "username",
                as: "user_data"
            }
        },
        {
            $project: {
                _id: 0,
                sender_id: "$_id",
                total: 1,
                username: { $arrayElemAt: ["$user_data.user_nick_name", 0] },
                profile_pic: {
                    $cond: {
                      if: {
                        $eq: [
                          { $substr: [{ $arrayElemAt: ["$user_data.user_profile_pic", 0] }, 0, 8] },
                          "https://"
                        ]
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
    ];
    return await transactionTable.Table.aggregate(aggregationPipeline).exec();
}

async function getTopUsersReceiver(filter) {
    const aggregationPipeline = [
        {
            $match: {
                transaction_type: filter.transaction_type,
                transaction_status: "success",
                sender_type: "user",
                receiver_type: "user",
                "entity_type.type": filter.entity_type,
                transaction_date: filter.dateRange
            }
        },
        {
            $group: {
                _id: "$receiver_id",
                total: { $sum: "$transaction_amount" }
            }
        },
        {
            $sort: {
                total: -1
            }
        },
        {
            $limit: 100
        },
        {
            $lookup: {
                from: "user_logins",
                localField: "_id",
                foreignField: "username",
                as: "user_data"
            }
        },
        {
            $project: {
                _id: 0,
                sender_id: "$_id",
                total: 1,
                username: { $arrayElemAt: ["$user_data.user_nick_name", 0] },
                profile_pic: {
                    $cond: {
                      if: {
                        $eq: [
                          { $substr: [{ $arrayElemAt: ["$user_data.user_profile_pic", 0] }, 0, 8] },
                          "https://"
                        ]
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
    ];
    
    return await transactionTable.Table.aggregate(aggregationPipeline).exec();
}


async function getTopGamer(filter, page, limit) {
    const aggregationPipeline = [
        {
            $match: {
                transaction_type: filter.transaction_type,
                transaction_status: "success",
                "entity_type.type": filter.entity_type,
                transaction_date: filter.dateRange
            }
        },
        {
            $group: {
                _id: "$sender_UID",
                total: { $sum: "$transaction_amount" }
            }
        },
        {
            $sort: {
                total: -1
            }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from: "user_logins",
                localField: "_id",
                foreignField: "UID",
                as: "user_data"
            }
        },
        {
            $project: {
                _id: 0,
                UID: "$_id",
                total: 1,
                user_nick_name: { $arrayElemAt: ["$user_data.user_nick_name", 0] },
                level: { $arrayElemAt: ["$user_data.level", 0] },
                user_profile_pic: {
                    $cond: {
                      if: {
                        $eq: [
                          { $substr: [{ $arrayElemAt: ["$user_data.user_profile_pic", 0] }, 0, 8] },
                          "https://"
                        ]
                      },
                      then: { $arrayElemAt: ["$user_data.user_profile_pic", 0] },
                      else: {
                        $concat: [
                          `${API.SocketAPI}/users/get-profile-pic/`,
                          { $arrayElemAt: ["$user_data.UID", 0] }
                        ]
                      }
                    }
                  }
            }
        }
    ];
    return await transactionTable.Table.aggregate(aggregationPipeline).exec();
}




router.route('/top-gamer').get(asyncErrorHandler(async (req, res, next) => {
    try {
        // let isTopGamer = await client.GET('topGamer');
        // if (isTopGamer) {
        //     isTopGamer = JSON.parse(isTopGamer);
        //     return res.status(200).json({
        //         success: true,
        //         data: isTopGamer
        //     });
        // }
        // Current day aggregation with username and profile_pic lookup
        const today = new Date();
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const data = await getTopGamer({
            dateRange: {
                $gte: startDate,
                $lt: endDate
            },
            transaction_type: "credited",
            entity_type: "game"
        }, page, limit);
        // Weekly aggregation with username and profile_pic lookup
        // const startOfWeek = new Date(today);
        // startOfWeek.setDate(today.getDate() - today.getDay());
        // const endOfWeek = new Date(startOfWeek);
        // endOfWeek.setDate(startOfWeek.getDate() + 7);
        // const weeklyData = await getTopGamer({
        //     dateRange: {
        //         $gte: startOfWeek,
        //         $lt: endOfWeek
        //     },
        //     transaction_type: "credited",
        //     entity_type: "game"
        // });

        // Monthly aggregation with username and profile_pic lookup
        // const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        // const monthlyData = await getTopGamer({
        //     dateRange: {
        //         $gte: startOfMonth,
        //         $lt: new Date(today.getFullYear(), today.getMonth() + 1, 1)
        //     },
        //     transaction_type: "credited",
        //     entity_type: "game"
        // });

        // const userIDs = data.concat(weeklyData, monthlyData).map(user => user.sender_id);
        // const userIDs = data.map(user => user.sender_id);
        // const userLevelPromises = userIDs.map(user_id => axios.post(`${API.Api}/giftTransation/getLevel`, { user_id }));
        // const userLevels = await Promise.all(userLevelPromises);

        // // // Add level field to each user in the data
        // data.forEach((user, index) => {
        //     user.level = userLevels[index].data.data.rSide ? userLevels[index].data.data.rSide : null;
        // });

        // weeklyData.forEach((user, index) => {
        //     user.level = userLevels[index].data.data.rSide ? userLevels[index].data.data.rSide : null;
        // });

        // monthlyData.forEach((user, index) => {
        //     user.level = userLevels[index].data.data.rSide ? userLevels[index].data.data.rSide : null;
        // });

        // await client.SETEX('topGamer',900, JSON.stringify({
        //     currentDay: data,
        //     // currentWeek: weeklyData,
        //     // currentMonth: monthlyData
        // }));

        return res.status(200).json({
            success: true,
            data,
            pagination: {
                page,
                limit
            }
        });
    } catch (error) {
        return next(error);
    }
}));

// Top Receiver

router.route('/top-receiver').get(asyncErrorHandler(async (req, res, next) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let topReceiver = await StickerTransacationModel.aggregate([
        {
            $match: {
                role_of_receiver: "host",
            }
        },
        {
            $group: {
                _id: "$receiver_UID",
                total: { $sum: "$giftPrice" }
            }
        },
        {
            $sort: {
                total: -1
            }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from: "user_logins",
                localField: "_id",
                foreignField: "UID",
                as: "user_data"
            }
        },
        {
            $project: {
                _id: 0,
                UID: "$_id",
                total: 1,
                user_nick_name: { $arrayElemAt: ["$user_data.user_nick_name", 0] },
                level: { $arrayElemAt: ["$user_data.level", 0] },
                user_profile_pic: {
                    $cond: {
                        if: {
                            $eq: [
                                { $substr: [{ $arrayElemAt: ["$user_data.user_profile_pic", 0] }, 0, 8] },
                                "https://"
                            ]
                        },
                        then: { $arrayElemAt: ["$user_data.user_profile_pic", 0] },
                        else: {
                            $concat: [
                                `${API.SocketAPI}/users/get-profile-pic/`,
                                { $arrayElemAt: ["$user_data.UID", 0] }
                            ]
                        }
                    }
                }
            }
        }
    ]);
    return res.json({
        success: true,
        message: "Top receiver",
        data: topReceiver
    });
}));


// router.route('/top-receiver').get(asyncErrorHandler(async (req, res, next) => {
//     try {
//         // let isTopReceiver = await client.GET('topReceiver');
//         // if (isTopReceiver) {
//         //     isTopReceiver = JSON.parse(isTopReceiver);
//         //     return res.status(200).json({
//         //         success: true,
//         //         data: isTopReceiver
//         //     });
//         // }
//         // Current day aggregation with username and profile_pic lookup
//         const today = new Date();
//         const currentDate = new Date();
//         const dayOfMonth = currentDate.getUTCDate(); // Use getUTCDate to get the day in UTC
//         let startDate, endDate;
//         if (dayOfMonth >= 1 && dayOfMonth <= 15) {
//             // Current date is between 1st and 15th day of the month
//             startDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1));
//             endDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 15, 23, 59, 59, 999));
//         } else {
//             // Current date is after the 15th day of the month
//             startDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 16));
//             endDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 0, 23, 59, 59, 999));
//         }
//         const data = await getTopUsersReceiver({
//             dateRange: {
//                 $gte: startDate, //new Date(today.setHours(0, 0, 0)),
//                 $lt: endDate //new Date(today.setHours(23, 59, 59))
//             },
//             transaction_type: "credited",
//             entity_type: "stickers-gifting"
//         });
//         // Weekly aggregation with username and profile_pic lookup
//         const startOfWeek = new Date(today);
//         startOfWeek.setDate(today.getDate() - today.getDay());
//         const endOfWeek = new Date(startOfWeek);
//         endOfWeek.setDate(startOfWeek.getDate() + 7);
//         const weeklyData = await getTopUsersReceiver({
//             dateRange: {
//                 $gte: startOfWeek,
//                 $lt: endOfWeek
//             },
//             transaction_type: "credited",
//             entity_type: "stickers-gifting"

//         });
//         // Monthly aggregation with username and profile_pic lookup
//         const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//         const monthlyData = await getTopUsersReceiver({
//             dateRange: {
//                 $gte: startOfMonth,
//                 $lt: new Date(today.getFullYear(), today.getMonth() + 1, 1)
//             },
//             transaction_type: "credited",
//             entity_type: "stickers-gifting"

//         });
//         const userIDs = data.concat(weeklyData, monthlyData).map(user => user.sender_id);
//         const userLevelPromises = userIDs.map(user_id => axios.post(`${API.Api}/giftTransation/getLevel`, { user_id }));
//         const userLevels = await Promise.all(userLevelPromises);

//         // Add level field to each user in the data
//         data.forEach((user, index) => {
//             user.level = userLevels[index].data.data.rSide ? userLevels[index].data.data.rSide : null;
//         });

//         weeklyData.forEach((user, index) => {
//             user.level = userLevels[index].data.data.rSide ? userLevels[index].data.data.rSide : null;
//         });

//         monthlyData.forEach((user, index) => {
//             user.level = userLevels[index].data.data.rSide ? userLevels[index].data.data.rSide : null;
//         });

//         // await client.SETEX('topReceiver', 900, JSON.stringify({
//         //     currentDay: data,
//         //     currentWeek: weeklyData,
//         //     currentMonth: monthlyData
//         // }));

//         return res.status(200).json({
//             success: true,
//             data: {
//                 currentDay: data,
//                 currentWeek: weeklyData,
//                 currentMonth: monthlyData
//             }
//         });
//     } catch (error) {
//         return next(error);
//     }
// }));


//Top user / overAll

router.route('/top-sender').get(asyncErrorHandler(async (req, res, next) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let topSender = await StickerTransacationModel.aggregate([
        {
            $match: {
                role_of_receiver: "host",
            }
        },
        {
            $group: {
                _id: "$sender_UID",
                total: { $sum: "$giftPrice" }
            }
        },
        {
            $sort: {
                total: -1
            }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from: "user_logins",
                localField: "_id",
                foreignField: "UID",
                as: "user_data"
            }
        },
        {
            $project: {
                _id: 0,
                UID: "$_id",
                total: 1,
                user_nick_name: { $arrayElemAt: ["$user_data.user_nick_name", 0] },
                level: { $arrayElemAt: ["$user_data.level", 0] },
                user_profile_pic: {
                    $cond: {
                        if: {
                            $eq: [
                                { $substr: [{ $arrayElemAt: ["$user_data.user_profile_pic", 0] }, 0, 8] },
                                "https://"
                            ]
                        },
                        then: { $arrayElemAt: ["$user_data.user_profile_pic", 0] },
                        else: {
                            $concat: [
                                `${API.SocketAPI}/users/get-profile-pic/`,
                                { $arrayElemAt: ["$user_data.UID", 0] }
                            ]
                        }
                    }
                }
            }
        }
    ]);
    return res.json({
        success: true,
        message: "Top sender",
        data: topSender
    });
}));


// router.route('/top-sender').get(asyncErrorHandler(async (req, res, next) => {
//     try {
//         // let isTopSender = await client.GET('topSender');
//         // if (isTopSender) {
//         //     isTopSender = JSON.parse(isTopSender);
//         //     return res.status(200).json({
//         //         success: true,
//         //         data: isTopSender
//         //     });
//         // }
//         // Current day aggregation with username and profile_pic lookup
//         const today = new Date();
//         const currentDate = new Date();
//         const dayOfMonth = currentDate.getUTCDate(); // Use getUTCDate to get the day in UTC
//         let startDate, endDate;
//         if (dayOfMonth >= 1 && dayOfMonth <= 15) {
//             // Current date is between 1st and 15th day of the month
//             startDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1));
//             endDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 15, 23, 59, 59, 999));
//         } else {
//             // Current date is after the 15th day of the month
//             startDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 16));
//             endDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 0, 23, 59, 59, 999));
//         }
//         const data = await getTopUsers({
//             dateRange: {
//                 $gte: startDate, //new Date(today.setHours(0, 0, 0)),
//                 $lt: endDate //new Date(today.setHours(23, 59, 59))
//             },
//             transaction_type: "debited",
//             entity_type: "stickers-gifting"
//         });
//         // Weekly aggregation with username and profile_pic lookup
//         const startOfWeek = new Date(today);
//         startOfWeek.setDate(today.getDate() - today.getDay());
        
//         const endOfWeek = new Date(startOfWeek);
//         endOfWeek.setDate(startOfWeek.getDate() + 7);

//         const weeklyData = await getTopUsers({
//             dateRange: {
//                 $gte: startOfWeek,
//                 $lt: endOfWeek
//             },
//             transaction_type: "debited",
//             entity_type: "stickers-gifting"
//         });
//         // Monthly aggregation with username and profile_pic lookup
//         const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//         const monthlyData = await getTopUsers({
//             dateRange: {
//                 $gte: startOfMonth,
//                 $lt: new Date(today.getFullYear(), today.getMonth() + 1, 1)
//             },
//             transaction_type: "debited",
//             entity_type: "stickers-gifting"
//         });
//         const userIDs = data.concat(weeklyData, monthlyData).map(user => user.sender_id);
//         const userLevelPromises = userIDs.map(user_id => axios.post(`${API.Api}/giftTransation/getLevel`, { user_id }));
//         const userLevels = await Promise.all(userLevelPromises);
        
//         // Add level field to each user in the data 

//         data.forEach((user, index) => {
//             user.level = userLevels[index].data.data.rSide ? userLevels[index].data.data.rSide : null;
//         });
//         weeklyData.forEach((user, index) => {
//             user.level = userLevels[index].data.data.rSide ? userLevels[index].data.data.rSide : null;
//         });
//         monthlyData.forEach((user, index) => {
//             user.level = userLevels[index].data.data.rSide ? userLevels[index].data.data.rSide : null;
//         });

//         // await client.SETEX('topSender', 900, JSON.stringify({
//         //     currentDay: data,
//         //     currentWeek: weeklyData,
//         //     currentMonth: monthlyData
//         // }));


//         return res.status(200).json({
//             success: true,
//             data: {
//                 currentDay: data,
//                 currentWeek: weeklyData,
//                 currentMonth: monthlyData
//             }
//         });
//     } catch (error) {
//         return next(error);
//     }
// }));



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



//  This for admin panel

router.get('/adminUser',(req,res)=>{
    TableModel.adminUser((err, docs) => {
        if (err) {
            return rc.setResponse(res, {
                msg: err.message
            })
        } else {
          res.json({
            success:true,
            msg:"data fetched",
            data:docs
          })
        }
    })
})


router.get('/newadminUser',(req,res)=>{
    TableModel.getData((err, docs) => {
        if(err){
            return rc.setResponse(res, {
                msg: err.message
            })
        }else{
            setUserCoin(docs,(response)=>{
                return rc.setResponse(res,{
                    success:true,
                    msg:'data fetched',
                    data:response
                })
            })
            function setUserCoin(data,callback){
                let count=0;
                let sendToData=[];
                data.forEach(ele=>{
                    let query={"user_id":ele.username}        
                    TableModelUserBalance.getDataByField(query,(err,doc)=>{
                        if(err){
                            res.json({
                                success:false,
                                msg:err.message
                            })
                        }else{
                            if(doc!=null){
                                ele._doc.r_coin=doc.user_rcoin;
                                ele._doc.diamond=doc.user_diamond;
                                sendToData.push(ele);
                                count++;
                                if(data.length==count){
                                    callback(sendToData);
                                }
                            }else{
                                ele.r_coin=0;
                                sendToData.push(ele);
                                count++;
                                if(data.length==count){
                                    callback(sendToData);
                                }
                            }
                        }
                    })
                })
            }
        }
    });
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

router.post('/byField-user',asyncErrorHandler(async(req,res,next)=>{
    const fieldName = req.body.fieldName;
    const fieldValue = req.body.fieldValue;
    if(fieldName && fieldValue){
        const IsUser = await TableModel.Table.findOne({username:fieldValue},{username:1,user_nick_name:1});
        if(IsUser){
            return res.json({
                success:true,
                msg:"User already exists",
                data:IsUser
            })
        }else{
            return res.json({
                success:false,
                msg:"User not exists  check userId"
            })
        }
    }
    return res.json({
        success:false,
        msg:"All fields are required"
    })
}))

router.post('/byField',
//authenticate,
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
                    return res.json({
                        success:true,
                        msg:"No user found",
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

const LiveStreamingTable = require('../models/m_live_streaming');
const JoinedUserTable = require('../models/m_live_streaming_joined_users');
const JoinedOnSeatTable = require('../models/m_live_streaming_join_user_requests');

router.put('/blockUser/:id',asyncErrorHandler(async(req,res,next)=>{
    const id = req.params.id;
    const status=req.body.status;
    if(status){
        const user = await TableModel.Table.findById(id);
        const isLive = await LiveStreamingTable.Table.find({user_id:user.username,live_streaming_current_status:"live"});
        if(isLive.length>0){
            // end the all live streaming
            let liveStreamingIds = isLive.map((streaming)=>streaming._id);
            await LiveStreamingTable.Table.updateMany({_id:{$in:liveStreamingIds}},{live_streaming_current_status:"ended",live_streaming_end_time:new Date().toISOString(),ended_by:"admin || moderator"});

        }
        // now block the user

        const isJoined = await JoinedUserTable.Table.find({joined_user_id:user.username,joined_status:'yes'});
        if(isJoined.length>0){
            let joinedIds = isJoined.map((joined)=>joined._id);
            await JoinedUserTable.Table.updateMany({_id:{$in:joinedIds}},{kickOut:"yes",joined_status:'no'});
        }
        const isJoinedOnSeat = await JoinedOnSeatTable.Table.find(
            {$or:[{request_by_user_id:user.username},
                {request_to_user_id:user.username}],
            request_accept_status:'accepted'});
        if(isJoinedOnSeat.length>0){
            let joinedOnSeatIds = isJoinedOnSeat.map((joined)=>joined._id);
            await JoinedOnSeatTable.Table.updateMany({_id:{$in:joinedOnSeatIds}},
                {request_accept_status:'expired'});
        }
        const isOk = await TableModel.Table.findByIdAndUpdate(id,{status});
        if(isOk){
            return res.json({
                success:true,
                msg:`User ${status}ed successfully`
            })
        }
    }else{
        return res.json({
            success:false,
            msg:"All fields are required"
        })
    }
}));


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
                    return rc.setResponse(res, {
                        success: true,
                        msg: 'Data Fetched',
                        data: docs
                    });
                }
                else{
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

router.put('/update/:id',
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

// router.post('/createUser', async(req, res, next) => {
//     const {email,mobile,password,cpassword,device_id}=req.body;
//     if(device_id){
//         let user = await TableModel.Table.findOne({device_id:device_id});
//         if(user){
//             if(user.device_status == "un_active"){
//                 return res.json({
//                     success:false,
//                     msg:"This device has been blocked"
//                 })
//             }
//         }
//     }
//     if((email==null || email==undefined || email=="") ||
//     (mobile==null || mobile==undefined || mobile=="") || (password==null || password==undefined || password=="" )
//     || (cpassword==null || cpassword==undefined || cpassword=="")){
//         return res.json({
//             success:false,
//             msg:"All fields are required"
//         }) 
//     }else{
//         TableModel.getDataByFieldName("email",email,(err,docs)=>{
//             if(err){
//                 res.json({
//                     success:false,
//                     msg:err.message
//                 })
//             }else{
//                 if(docs.length>0){
//                     res.json({
//                         success:false,
//                         msg:"User already exists"
//                     })
//                 }else{
//                     if(password===cpassword){
//                         hashPassword(password).then((hash)=>{
//                             getNextSequenceValue().then((seq)=>{
//                                 let dona_user=new TableModel({
//                                     username:seq,
//                                     email:email.toLowerCase(),
//                                     mobile:mobile,
//                                     password:password,
//                                     user_nick_name:`MyLive User ${username}`,
//                                     hashPassword:hash,
//                                     device_id:device_id,
//                                 })
//                                 TableModel.addRow(dona_user,(err,doc)=>{
//                                     if(err){
//                                         res.json({
//                                             success:false,
//                                             msg:err.message
//                                         })
//                                     }
//                                     else{
//                                         if(doc!=null){
//                                             const user_balace=new TableModelUserBalance({
//                                                 user_id:doc.username,
//                                                 user_diamond:'0',
//                                                 user_rcoin:'0',
//                                             })
//                                             TableModelUserBalance.addRow(user_balace,(err,docs)=>{
//                                                 if(err){
//                                                     TableModel.getByIdAndDelete(doc._id,(err,dc)=>{
//                                                         if(err){
//                                                             res.json({
//                                                                 success:false,
//                                                                 msg:err.message
//                                                             })
//                                                         }else{
//                                                             res.json({
//                                                                 success:false,
//                                                                 msg:"User not created"
//                                                             });
//                                                         }
//                                                     })
//                                                 }else{
//                                                     if(docs!=null){
//                                                         res.json({
//                                                             success:true,
//                                                             msg:"User created successfully",
//                                                             data:{newId:doc._id}
//                                                         })
//                                                     }else{
//                                                         TableModel.getByIdAndDelete(doc._id,(err,dc)=>{
//                                                             if(err){
//                                                                 res.json({
//                                                                     success:false,
//                                                                     msg:err.message
//                                                                 })
//                                                             }else{
//                                                                 res.json({
//                                                                     success:false,
//                                                                     msg:"User not created"
//                                                                 });
//                                                             }
//                                                         })   
//                                                     }
//                                                 }
//                                             })
//                                         }else{
//                                             res.json({
//                                                 success:false,
//                                                 msg:"User not created"
//                                             });
//                                         }
//                                     }
//                                 })
//                             }).catch((err)=>{
//                                 res.json({
//                                     success:false,
//                                     msg:err.message
//                                 });
//                             });
//                         }).catch((err)=>{
//                             res.json({
//                                 success:false,
//                                 msg:err.message
//                             });
//                         })
//                     }
//                     else{
//                         res.json({
//                             success:false,
//                             msg:"password not matched"
//                         })
//                     }
//                 }
//             }
//         });
//     }
// });

router.post('/sendOtp', sendSms,(req, res) => {
    res.json({
        success:true,
        msg:"Otp sent successfully",
        data:req.body.verification
    })
})


router.post('/createAndLoginUser',verifyDonalive, (req, res) => {
    const {mobile}=req.body;
    TableModel.getDataByFieldName("mobile",mobile,(err,docs)=>{
        if(err){
            res.json({
                success:false,
                msg:err.message
            })
        }else{
            if(docs.length>0){
                var t_user = {
                    id: docs._id,
                 
                    username: docs[0].username,
                    mobile: docs[0].mobile,
                    email: docs[0].email?docs[0].email:"email not provided",
                  };
                  const token = jwt.sign(t_user, config.secret, {
                    expiresIn: 604800,
                  });
                  res.status(200).json({
                    success: true,
                    msg: "Welcome " + docs[0].username,
                    token: "JWT " + token,
                    user: t_user,
                  });
            }else{
                getNextSequenceValue()
                .then((seq)=>{
                    let dona_user=new TableModel({
                        username:seq,
                        mobile:mobile,
                        account_create_method:"otpLogin"
                    })
                    TableModel.addRow(dona_user,(err,doc)=>{
                        if(err){
                            res.json({
                                success:false,
                                msg:err.message
                            })
                        }
                        else{
                            if(doc!=null){
                                const user_balace=new TableModelUserBalance({
                                    user_id:doc.username,
                                    user_diamond:'0',
                                    user_rcoin:'0',
                                })
                                TableModelUserBalance.addRow(user_balace,(err,docs)=>{
                                    if(err){
                                        TableModel.getByIdAndDelete(doc._id,(err,dc)=>{
                                            if(err){
                                                res.json({
                                                    success:false,
                                                    msg:err.message
                                                })
                                            }else{
                                                res.json({
                                                    success:false,
                                                    msg:"User not created"
                                                });
                                            }
                                        })
                                    }else{
                                        if(docs!=null){
                                            res.json({
                                                success:true,
                                                msg:"User created successfully",
                                                data:{newId:doc._id}
                                            })
                                        }else{
                                            TableModel.getByIdAndDelete(doc._id,(err,dc)=>{
                                                if(err){
                                                    res.json({
                                                        success:false,
                                                        msg:err.message
                                                    })
                                                }else{
                                                    res.json({
                                                        success:false,
                                                        msg:"User not created"
                                                    });
                                                }
                                            })   
                                        }
                                    }
                                })
                            }else{
                                res.json({
                                    success:false,
                                    msg:"User not created"
                                });
                            }
                        }
                    })
                })
                .catch((err)=>{
                    res.json({
                        success:false,
                        msg:err
                    })
                })
            }
        }
    })
})


router.post('/updateDeviceToken', async(req, res) => {
    const {user_id,device_token}=req.body;
    if(!user_id||!device_token)return res.json({success:false,msg:"user_id or device_token not provided"})
    try {
        const updateResult = await TableModel.Table.findOneAndUpdate({username:user_id},{'$set':{device_token:device_token}},{new:true});
        if(updateResult){
            return res.json({success:true,msg:"Device token updated successfully"})
        }
        return res.json({success:false,msg:"Device token not updated"})
    } catch (error) {
        return res.json({success:false,msg:error.message})
    }
})

router.get('/top-users', (req, res) => {
    TableModelUserBalance.getTopUser((err,docs)=>{
        if(err){
            res.json({
                success:false,
                msg:err.message
            })
        }else{
            res.json({
                success:true,
                msg:"Top users",
                data:docs
            })
        }
    })
})

// router.post("/login", async(req, res) => {
//     const email = req.body.email;
//     const password = req.body.password;
//     const device_id = req.body.device_id || null;
//     if(device_id){
//         let User = await TableModel.Table.findOne({device_id:device_id});
//         if(User){
//             if(User.device_status == "un_active"){
//                 return res.json({
//                     success:false,
//                     msg:"This device has been blocked",
//                     show:true,
//                 })
//             }
//         }
//     }
//     TableModel.getSingleDataByFieldName("email", email, async(err, user) => {
//       if (err) {
//         res.status(200).json({ success: false, msg: "error ocurred", err: err });
//       } else {
//         if (user) {
//             if(!user.region||user.region==null||user.region==undefined||user.region==""){
//                 const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//                 let country = 'unknown';
//                 if (ip) {
//                     const geo = lookup(ip);
//                     if (geo) {
//                         country = geo.country.toLowerCase()|| 'unknown';
//                         await TableModel.Table.findByIdAndUpdate(user._id,{region:country});
//                     }
//                 }
//             }
//           TableModel.comparePassword(
//             password,
//             user.hashPassword,
//             async(err, isMatch) => {
//               if (err) {
//                 console.log(err);
//                 res
//                   .status(200)
//                   .json({ success: false, msg: "error ocurred", err: err });
//               }
//               if (isMatch) {
//                 await TableModel.Table.findByIdAndUpdate(user._id,{device_id:device_id,device_status:"active"});
//                 var t_user = {
//                     id: user._id,
//                     username: user.username,
//                     mobile: user.mobile,
//                     email: user.email,
//                   };
//                   const token = jwt.sign(t_user, config.secret, {
//                     expiresIn: 604800,
//                   });
//                   res.status(200).json({
//                     success: true,
//                     msg: "Welcome " + user.username,
//                     token: "JWT " + token,
//                     user: t_user,
//                   });
//               } else {
//                 res.status(200).json({ success: false, msg:"wrong password"});
//               }
//             }
//           );
//         } else {
//           res.status(200).json({ success: false, msg: "User not found" });
//         }
//       }
//     });
// });

// router.put('/createNewPassword/:id',
// //authenticate,
// (req, res) => {

//     bcrypt.hash(req.body.password, 10, (err, hash) => {
//         if (err) {
//             res.json({
//                 success: false,
//                 msg: "error!",
//                 data: err.message
//             })
//         } else {

//         // pushing hash in body
//         req.body.hashPassword = hash;
//         TableModel.updateRow(req.params.id, req.body, (err, docs) => {
//             if (err) {
//                 return rc.setResponse(res, {
//                     msg: err.message
//                 })
//             } else {
//                 return rc.setResponse(res, {
//                     success: true,
//                     msg: 'Data Updated',
//                     data: docs._id
//                 });
//             }
//         })
//     }
//     })
// });


/**
 * Social Authentication using google
 */



router.route('/SocialAuthentication').post(asyncErrorHandler(async (req, res, next) => {
    const {authMethod,email,user_profile_pic,device_id} = req.body;
    // first check all the required fields are available or not
    if(device_id){
        let User = await TableModel.Table.findOne({device_id:device_id});
        if(User){
            if(User.device_status == "un_active"){
                return res.json({
                    success:false,
                    msg:"Your device has been blocked"
                })
            }
        }
    }
    const propertiesToCheck = [email, authMethod, user_profile_pic];
    // Check if all properties have data (not undefined, null, or empty string)
    const allPropertiesHaveData = propertiesToCheck.every(property => property !== undefined && property !== null && property !== "");
    if (!allPropertiesHaveData) {
        return res.json({
            success: false,
            show:true,
            msg: "Please provide all required data"
        });
    }
    if (authMethod === 'google'){
        // check if user already exists
        const userExists = await TableModel.Table.findOne({email});
        if (userExists){
            // if user is available then login the user
            if(!userExists.region||userExists.region==null||userExists.region==undefined || userExists.region=="" || userExists.region){
                const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                let country = 'unknown';
                if (ip) {
                    const geo = lookup(ip);
                    if (geo) {
                        country = geo.country.toLowerCase()|| 'unknown';
                        await TableModel.Table.findByIdAndUpdate(userExists._id,{region:country});
                    }
                }
                var t_user = {
                    id: userExists._id,
                    username: userExists.username,
                    mobile: userExists.mobile,
                    email: userExists.email,
                };
                const token = jwt.sign(t_user, config.secret, {
                    expiresIn: 604800,
                });
                return res.json({
                    success: true,
                    msg: "Welcome " + userExists.username,
                    token: "JWT " + token,
                    user: t_user,
                });
            }
        }
        // if user is not available then create the user
        const username = await getNextSequenceValue();
        let country = 'unknown';
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (ip) {
            const geo = lookup(ip);
            if (geo) {
                country = geo.country.toLowerCase()|| 'unknown';
            }
        }
        const newUser = new TableModel.Table({
            username,
            email: email.toLowerCase().trim(),
            account_create_method: authMethod,
            gmail_token: email,
            region:country,
            user_nick_name:`MyLive User ${username}`,
            user_profile_pic: user_profile_pic,
        });
        // Attempt to save the user document
        newUser.save()
            .then((savedUser) => {
                if (savedUser) {
                    // Create a balance document
                    const userBalance = new TableModelUserBalance.Table({
                        user_id: username,
                        user_diamond: 0,
                        user_rcoin: 0
                    });

                    // Attempt to save the balance document
                    return userBalance.save()
                        .then(() => {
                            var t_user = {
                                id: savedUser._id,
                                username: savedUser.username,
                                mobile: savedUser.mobile,
                                email: savedUser.email,
                            };
                            const token = jwt.sign(t_user, config.secret, {
                                expiresIn: 604800,
                            });
                            return res.json({
                                success: true,
                                msg: "Welcome " + savedUser.username,
                                token: "JWT " + token,
                                user: t_user,
                            });
                        })
                        .catch((balanceError) => {
                            // Rollback: Delete the user document if balance creation fails
                            savedUser.remove();
                            return res.json({
                                success: false,
                                show: true,
                                msg: "User not created due to balance creation failure"
                            });
                        });
                } else {
                    return res.json({
                        success: false,
                        show: true,
                        msg: "User not created"
                    });
                }
            })
            .catch((userError) => {
                return res.json({
                    success: false,
                    show: true,
                    msg: "User not created"
                });
            });
        return;
    }
    return res.json({
        success: false,
        show:true,
        msg: "Please provide valid authentication method"
    });
}));

/**
 * API for registrating and login with mobile
 */


 /**
  * function for checking google user existenece
  */
 
 /**
  * router for seaeching user info using mobile, email, and username
  */
  router.post('/searchingViaUsernameMobileEmail',
  //authenticate,
  (req, res, next) => {
      const searchString = req.body.searchString;
      var errors = [];
      var finalData = new Array();
      var responsegg = 'no';
      var itemsProcessed = 0;

      console.log(req.body);
      TableModel.searchingViaUsernameMobileEmail(searchString, (error, docs) => {
          if (error) {
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


// function for updating data via user_id

router.put('/updateViaUserID/:id',
    // passport.authenticate("jwt", { session: false }),
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

router.get('/getDetailsViaUserID/:id',
    //authenticate,
    (req, res) => {
        const id = req.params.id;
        TableModel.getDataByUserId(id, (err, doc) => {
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

module.exports = router;

