const express = require("express");
const router = express.Router();
const TableModel = require("../models/m_live_streaming");
const rc = require("./../controllers/responseController");
const passport = require("passport");
const TableModelUser_login = require("../models/m_user_login");
const { hoursAndCoins, newHoursAndCoins,startAndendDate } = require("../utilis/get_hours_coins");
const authenticate = require("../config/user_auth");
const API = require("../config/api");
const followerModel = require("../models/m_user_follower");
const asyncErrorHandler = require('../utilis/asyncErrorHandler')
const TalentTable = require("../models/m_official_talent");
const {sendBulkNotifications} = require('../controllers/push_notification');
const client = require("../config/redis");
const UserGiftingTable = require("../models/m_user_gifting");


async function findAllFriends(user_id) {
  const followers = await followerModel.Table.find({
    follower_userID: user_id,
  },{primary_userId:1,_id:0});
  if (followers.length == 0) return;
  const userDeviceTokens = await TableModelUser_login.Table.find({
    username: { $in: followers.map((follower) => follower.primary_userId)},
  },{device_token:1,_id:0});
  if(userDeviceTokens.length !== 0){
    const deviceTokens = userDeviceTokens.filter((userDeviceToken) => userDeviceToken.device_token !== null)
    .map((userDeviceToken) => userDeviceToken.device_token);
    if(deviceTokens.length !== 0){
      const userLiveDetails = await TableModelUser_login.Table.findOne({
        username:user_id},{user_nick_name:1,username:1,_id:0,user_profile_pic:1});
      const profile_pic = userLiveDetails.user_profile_pic.startsWith('http')?userLiveDetails.user_profile_pic:`${API.Api}/file/download/${userLiveDetails.user_profile_pic}`;
      sendBulkNotifications(deviceTokens, `${userLiveDetails.user_nick_name?userLiveDetails.user_nick_name:userLiveDetails.username} is live now`,profile_pic);
    }
  }
}



router.route("/create").post(asyncErrorHandler(async (req, res, next) => {
  const {
    user_id,
    live_streaming_channel_id,
    live_streaming_token,
    live_streaming_type,
    live_name,
    live_streaming_start_time,
    live_streaming_current_status,
    created_by
  } = req.body;
  // validate all the fields
  let validateFields = [user_id,live_streaming_channel_id,live_streaming_token,live_streaming_type,live_name,live_streaming_start_time,live_streaming_current_status,created_by];
  validateFields.forEach((field) => {
    if(!field) return res.json({success:false, msg:"All fields are required"});
  });
  req.body.live_streaming_start_time = new Date();
   // check the user is already live or not
  let filter = {user_id:user_id,live_streaming_current_status:'live'};
  let update = {$set:{live_streaming_current_status:'ended',live_streaming_end_time:new Date(),ended_by:'host-while-starting-new-live'}};
  let isOk = await TableModel.Table.findOneAndUpdate(filter,update,{new:true});
  // check the live_name is live or audio party
  if(live_name === 'Audio Party'){
    // create new live
    let newLive = new TableModel.Table(req.body);
    let isOkNewLive = await newLive.save();
    if(!isOkNewLive) return res.json({success:false,show:false, msg:"Something went wrong"});
    // send the notification to all the users
    await findAllFriends(user_id);
    return res.json({success:true, msg:"Live created", data:isOkNewLive});
  }
  if(live_name == 'Live'){
    // first check user is host or not
    let isTalent = await TalentTable.Table.findOne({user_id:user_id,host_status:'accepted'});
    if(isTalent){
      // create new live
      let newLive = new TableModel.Table(req.body);
      let isOkNewLive = await newLive.save();
      if(!isOkNewLive) return res.json({success:false, show:false,msg:"Something went wrong"});
      // send the notification to all the users
      await findAllFriends(user_id);
      return res.json({success:true, msg:"Live created", data:isOkNewLive});
    }
    // check the user level
    let userLevel = await client.GET(`${user_id}_level`);
    userLevel = JSON.parse(userLevel);
    if(userLevel && userLevel.rSide > 1){
      // create new live
      let newLive = new TableModel.Table(req.body);
      let isOkNewLive = await newLive.save();
      if(!isOkNewLive) return res.json({success:false, msg:"Something went wrong"});
      // send the notification to all the users
      await findAllFriends(user_id);
      return res.json({success:true, msg:"Live created", data:isOkNewLive});
    }
    return res.json({success:false,show:true, msg:"You are not allowed to create live"});
  }
}));





router.get(
  "/",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    TableModel.getData((err, docs) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        return rc.setResponse(res, {
          success: true,
          msg: "All Data Fetched",
          data: docs,
        });
      }
    });
  }
);

router.get(
  "/byId/:id",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const id = req.params.id;
    TableModel.getDataById(id, (err, doc) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Fetched",
          data: doc,
        });
      }
    });
  }
);

router.get("/getDayliveCoin/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    if (!userId) {
      throw new Error("User Id is required");
    }
    // const currentDate = new Date().toISOString().split("T")[0];
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0); // Set time to midnight
    const endDate = new Date(currentDate);
    endDate.setUTCHours(23, 59, 59, 999); // Set time to the last millisecond of the day

    const data = await TableModel.Table.aggregate([
      {
        $match: {
          user_id: userId,
          live_streaming_start_time: { $gte: currentDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalCoins: {
            $sum: "$coins",
          },
        },
      },
    ]);
    if (data.length == 0)
      return res.json({
        success: true,
        msg: "No data found",
        data: { coins: 0, start: 0 },
      });
    let coins = data[0].totalCoins;
    let starRating = "";
    if (coins > 0 && coins < 10000) starRating = 1;
    else if (coins < 50000) starRating = 2;
    else if (coins < 200000) starRating = 3;
    else if (coins < 1000000) starRating = 4;
    else starRating = 5;
    return res.json({
      success: true,
      msg: "Data fetched",
      data: {
        coins: coins,
        start: starRating,
      },
    });
  } catch (error) {
    return res.json({
      success: false,
      msg: error.message,
    });
  }
});



/**
 * @description: This api is used to get data of user who is gifted to host or co-host in last 24 hours and 
 * last 15 days and last 30 days
 * @param: userId
 * @returns: data
 * @field : profile_pic, user_nick_name, level
 */

async function fetchData(userId, startDate, endDate){
  let data = await UserGiftingTable.Table.aggregate([
    {
      $match: {
        gifting_to_user: userId,
        created_at: { $gte: startDate, $lte: endDate },
      },
    },
    // group by gifting_to_user
    {
      $group: {
        _id: "$user_id",
        totalCoins: {
          $sum: "$gift_price",
        },
      },
    },
    {
      $sort: {
          total: -1
      }
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
          user_id: "$_id",
          totalCoins: 1,
          username: { $arrayElemAt: ["$user_data.user_nick_name", 0] },
          level: { $arrayElemAt: ["$user_data.level", 0] },
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
  ]);
  return data;
}


router.route("/getGiftedData/:userId").get(asyncErrorHandler(async (req, res, _) => {
  const userId = req.params.userId;
  if (!userId)
    return res.json({ success: false, msg: "User id is required" });
  // first get data from the collection last 24 hours
  const currentDate = new Date();
  const dayOfMonth = currentDate.getUTCDate(); // Use getUTCDate to get the day in UTC
  let _24hoursstartDate, _24hoursendDate;
  _24hoursstartDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate() - 1));
  _24hoursendDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate(), 23, 59, 59, 999));
  let _15daysstartDate, _15daysendDate;
  if (dayOfMonth >= 1 && dayOfMonth <= 15) {
    // Current date is between 1st and 15th day of the month
    _15daysstartDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1));
    _15daysendDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 15, 23, 59, 59, 999));
  } else {
    // Current date is after the 15th day of the month
    _15daysstartDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 16));
    _15daysendDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 0, 23, 59, 59, 999));
  }

  let _30daysstartDate, _30daysendDate;
  _30daysstartDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1));
  _30daysendDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 0, 23, 59, 59, 999));

  // let _24hoursData = fetchData(userId,_24hoursstartDate,_24hoursendDate);
  let _15daysData = fetchData(userId,_15daysstartDate,_15daysendDate);
  // let _30daysData = fetchData(userId,_30daysstartDate,_30daysendDate);

  return res.json({ 
    success: true,
    msg: "Data fetched",
    data:{
      // _24hoursData:await _24hoursData,
      _15daysData:await _15daysData,
      // _30daysData:await _30daysData
    }
  });
}));



router.route("/getLiveDurationAndCoins/:UID").get(asyncErrorHandler(async (req, res, _) => {
  const UID = req.params.UID;
  if (!UID)
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
  
  const data = await TableModel.Table.aggregate([
    {
      $match: {
        UID: UID,
        live_streaming_end_time: { $exists: true },
        live_streaming_start_time: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $project: {
        live_streaming_start_time: 1,
        live_streaming_end_time: 1,
        coins: 1,
        live_streaming_type: 1,
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
  
  console.log(data);

  await newHoursAndCoins(data).then(async(response) => {
    // let coinsAsCoHost = await UserGiftingTable.Table.aggregate([
    //   {
    //     $match: {
    //       gifting_to_user: userId,
    //       role: "co-host",
    //       created_at: { $gte: startDate, $lte: endDate },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: null,
    //       totalCoins: {
    //         $sum: "$gift_price",
    //       },
    //     },
    //   },
    // ]);
    // response.coinsAsCoHost = coinsAsCoHost[0] ? coinsAsCoHost[0].totalCoins : 0;
    return res.json({
      success: true,
      msg: "Data fetched",
      data: response,
      data1:data
    });
  });
  

}));


router.post(
  "/byField",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const fieldName = req.body.fieldName;
    const fieldValue = req.body.fieldValue;
    TableModel.getDataByFieldName(fieldName, fieldValue, (err, docs) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        if (docs.length == 0) {
          return rc.setResponse(res, {
            msg: "No data found",
          });
        }
        return rc.setResponse(res, {
          success: true,
          msg: "Data Fetched",
          data: docs,
        });
      }
    });
  }
);


router.route('/current-live-streaming').post(asyncErrorHandler(async (req, res, _) => {
  const fieldNames = req.body.fieldNames;
  const fieldValues = req.body.fieldValues;
  let query = {};
  for (let i = 0; i < fieldNames.length; i++) {
    const fieldName = fieldNames[i];
    const fieldValue = fieldValues[i];
    query[fieldName] = fieldValue;
  }
  let data = await TableModel.Table.find(query,{
    live_streaming_start_time:1,UID:1,_id:1,
    live_streaming_current_status:1,live_streaming_type:1,
    createdAt:1
  });
  return res.json({success:true, msg:"Data fetched", data:data});
}));

router.post("/byFields", (req, res) => {
  const fieldNames = req.body.fieldNames;
  const fieldValues = req.body.fieldValues;
  TableModel.getDataByFieldNames(fieldNames, fieldValues, (err, docs) => {
    if (err) {
      return rc.setResponse(res, {
        msg: err.message,
      });
    } else {
      if (docs.length == 0) {
        return rc.setResponse(res, {
          msg: "No data found",
        });
      }
      console.log(docs,"this is docs");
      return rc.setResponse(res, {
        success: true,
        msg: "Data Fetched",
        data: docs,
      });
    }
  });
});



router.get("/report/:userId", (req, res) => {
  TableModel.getDataForDurationAndCoin(req.params.userId, async (err, doc) => {
    if (err) {
      return res.json({
        success: false,
        msg: err.message,
      });
    } else {
      if (doc.length == 0) {
        return res.json({
          success: true,
          msg: "Data not found",
          data: {
            coins: 0,
            durations: "00:00:00",
          },
        });
      }
      await hoursAndCoins(doc).then((response) => {
        return res.json({
          success: true,
          msg: "Data fetched",
          data: response,
        });
      });
    }
  });
});

router.post("/view-report-duration", async (req, res) => {
  const { getDays, user_id } = req.body;
  try {
    if (getDays === "15") {
      startDay = new Date().toISOString().split("T")[0].slice(0, 8) + "01";
      lastDay = new Date().toISOString().split("T")[0].slice(0, 8) + "15";
    } else if (getDays === "30") {
      startDay = new Date().toISOString().split("T")[0].slice(0, 8) + "15";
      lastDay = new Date().toISOString().split("T")[0].slice(0, 8) + "30";
    } else if (getDays === "monthly") {
      startDay = new Date().toISOString().split("T")[0].slice(0, 8) + "01";
      lastDay = new Date().toISOString().split("T")[0].slice(0, 8) + "30";
    } else {
      throw new Error("Invalid duration");
    }
    TableModel.getSpecificDuration(
      user_id,
      startDay,
      lastDay,
      async (err, doc) => {
        if (err) {
          return res.json({
            success: false,
            msg: err.message,
          });
        } else {
          await hoursAndCoins(doc).then((response) => {
            return res.json({
              success: true,
              msg: "Data fetched",
              data: response,
            });
          });
        }
      }
    );
  } catch (error) {
    return res.json({
      success: false,
      msg: error.message,
    });
  }
});

router.post("/view-report", (req, res) => {
  try {
    const { getDays, user_id } = req.body;
    if (getDays === "15") {
      startDay = new Date().toISOString().split("T")[0].slice(0, 8) + "01";
      lastDay = new Date().toISOString().split("T")[0].slice(0, 8) + "15";
    } else if (getDays === "30") {
      startDay = new Date().toISOString().split("T")[0].slice(0, 8) + "15";
      lastDay = new Date().toISOString().split("T")[0].slice(0, 8) + "30";
    } else if (getDays === "monthly") {
      startDay = new Date().toISOString().split("T")[0].slice(0, 8) + "01";
      lastDay = new Date().toISOString().split("T")[0].slice(0, 8) + "30";
    } else {
      throw new Error("Invalid duration");
    }
    TableModel.getSpecificDuration(user_id, startDay, lastDay, (err, doc) => {
      if (err) {
        res.json({
          success: false,
          msg: err.message,
        });
      } else {
        res.json({
          success: true,
          msg: "Data fetched",
          data: doc,
        });
      }
    });
  } catch (error) {
    return res.json({
      success: false,
      msg: error.message,
    });
  }
});


router.route('/update/:id').put(asyncErrorHandler(async (req, res, next) => {
  const id = req.params.id;
  if(!id) return res.json({success:false, msg:"Id is required"});
  let liveStreaming = await TableModel.Table.findById(req.params.id);
  if(!liveStreaming) return res.json({success:false, msg:"Live streaming not found"});
  if(liveStreaming.live_streaming_current_status == 'ended'){
    liveStreaming.live_streaming_current_status = 'live';
    liveStreaming.last_update = new Date();
    liveStreaming.save();
    return res.json({success:true, msg:"Live streaming updated"});
  } 
  liveStreaming.last_update = new Date();
  liveStreaming.save();
  return res.json({success:true, msg:"Live streaming updated"});
}));


router.route('/ended-by-admin/:id').put(asyncErrorHandler(async (req, res, next) => {
  const id = req.params.id;
  if(!id) return res.json({success:false, msg:"Id is required"});
  let liveStreaming = await TableModel.Table.findById(req.params.id);
  if(!liveStreaming) return res.json({success:false, msg:"Live streaming not found"});
  liveStreaming.live_streaming_current_status = 'ended';
  liveStreaming.live_streaming_end_time = new Date();
  liveStreaming.ended_by = 'admin';
  liveStreaming.save();
  return res.json({success:true, msg:"Live streaming updated", data:liveStreaming});
}));

router.route('/update/:id').put(asyncErrorHandler(async (req, res, next) => {
  const {live_streaming_current_status} = req.body;
  if(live_streaming_current_status == "end"){
    // if the live streaming is ended then update the end time
    let updateData = {
      live_streaming_current_status:'ended',
      live_streaming_end_time:new Date(),
      ended_by:req.body.ended_by || 'host'
    };
    let isOk = await TableModel.Table.findByIdAndUpdate(req.params.id, updateData, {new:true});
    if(!isOk) return res.json({success:false, msg:"Something went wrong"});
    return res.json({success:true, msg:"Data updated", data:isOk});
  }
  TableModel.updateRow(req.params.id, req.body, (err, docs) => {
    if (err) {
      return rc.setResponse(res, {
        msg: err.message,
      });
    } else {
      return rc.setResponse(res, {
        success: true,
        msg: "Data Updated",
        data: docs,
      });
    }
  });
}));



router.delete("/byId/:id", (req, res) => {
  TableModel.deleteTableById(req.params.id, (err, docs) => {
    if (err) {
      return rc.setResponse(res, {
        msg: err.message,
      });
    } else {
      return rc.setResponse(res, {
        success: true,
        msg: "Data Deleted",
        data: docs,
      });
    }
  });
});


router.post("/down", (req, res) => {
  const { liveId } = req.body;
  TableModel.getDataByFieldNameSort(
    "live_streaming_current_status",
    "live",
    (err, doc) => {
      if (err) {
        console.log(err.message);
      } else {
        function nextLive(liveUser, callback) {
          for (let i = 0; i < liveUser.length; i++) {
            if (liveUser[i].id == liveId) {
              if (i == 0) {
                callback(liveUser[liveUser.length - 1]);
              } else {
                callback(liveUser[i - 1]);
              }
            }
          }
        }
        upSwipe(doc, (response) => {
          return rc.setResponse(res, {
            success: true,
            msg: "Data fetch",
            data: response,
          });
        });
        function upSwipe(data, callback) {
          let count = 0;
          let setArray = [];
          data.forEach((ele) => {
            setArray.push(ele);
            count++;
            if (data.length == count) {
              nextLive(setArray, callback);
            }
          });
        }
      }
    }
  );
});

router.post("/up", (req, res) => {
  const { liveId } = req.body;
  if (liveId.length <= 0) {
    TableModel.getDataByFieldName(
      "live_streaming_current_status",
      "live",
      (err, doc) => {
        if (err) {
          res.json({
            success: false,
            msg: err.message,
          });
        } else {
          res.json({
            success: true,
            msg: "Data fetch",
            data: doc[0],
          });
        }
      }
    );
  } else {
    TableModel.getDataByFieldNameSort(
      "live_streaming_current_status",
      "live",
      (err, doc) => {
        if (err) {
          console.log(err.message);
        } else {
          function nextLive(liveUser, callback) {
            for (let i = 0; i < liveUser.length; i++) {
              if (liveUser[i].id == liveId) {
                if (liveUser.length == i + 1) {
                  callback(liveUser[0]);
                } else {
                  callback(liveUser[i + 1]);
                }
              }
            }
          }
          upSwipe(doc, (response) => {
            return rc.setResponse(res, {
              success: true,
              msg: "Data fetch",
              data: response,
            });
          });
          function upSwipe(data, callback) {
            let count = 0;
            let setArray = [];
            data.forEach((ele) => {
              setArray.push(ele);
              count++;
              if (data.length == count) {
                nextLive(setArray, callback);
              }
            });
          }
        }
      }
    );
  }
});


router.route("/fetchLiveStreamingforHomeScreen/:id").get(asyncErrorHandler(async (req, res, next) => {
  const userId = req.params.id;
    if (!userId)
      return res.json({ success: false, msg: "User id is required" });
    let data = await TableModel.Table.aggregate([
      {
        $match: {
          live_streaming_current_status: "live",
          user_id: { $ne: userId },
        },
      },
      {
        $lookup: {
          from: "user_logins",
          localField: "user_id",
          foreignField: "username",
          as: "user",
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
        },
      },
      // sort by coins in increasing order
      { $sort: { coins: 1 } },
      {
        $project: {
          user_nick_name: "$user.user_nick_name",
          region:'$user.region',
          userProfilePic: {
            $cond: {
              if: {
                $eq: [
                  { $substrCP: ["$user.user_profile_pic", 0, 5] }, // Extract the first 5 characters of the string
                  "https",
                ],
              },
              then: "$user.user_profile_pic",
              else: {
                $concat: [`${API.Api}/file/view/`, "$user.user_profile_pic"],
              },
            },
          },
          coins: 1,
          agora_ud: 1,
          user_id: 1,
          created_at: 1,
          live_streaming_channel_id: 1,
          live_streaming_token: 1,
          live_streaming_type: 1,
          live_name: 1,
          live_streaming_start_time: 1,
          live_streaming_current_status: 1,
          created_by: 1,
        },
      },
      {
        $sort: {
          coins: -1,
        },
      }
    ]);
    let audioPartyData = [];
    let videoLiveData = [];
    data.forEach((ele) => {
      if(ele.live_name === 'Audio Party'){
        audioPartyData.push(ele);
      }else{
        videoLiveData.push(ele);
      }
    });
    data = [...videoLiveData,...audioPartyData];
    return res.json({
      success: true,
      msg: "Data fetched",
      data: data,
    });
}));



router.get("/fetchLiveStreamingforHomeScreen/:id", async (req, res, next) => {
  try {
    const userId = req.params.id;
    if (!userId)
      return res.json({ success: false, msg: "User id is required" });
    const data = await TableModel.Table.aggregate([
      {
        $match: {
          live_streaming_current_status: "live",
          user_id: { $ne: userId },
        },
      },
      {
        $lookup: {
          from: "user_logins",
          localField: "user_id",
          foreignField: "username",
          as: "user",
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
        },
      },
      // sort by coins in increasing order
      { $sort: { coins: 1 } },
      {
        $project: {
          user_nick_name: "$user.user_nick_name",
          region:'$user.region',
          userProfilePic: {
            $cond: {
              if: {
                $eq: [
                  { $substrCP: ["$user.user_profile_pic", 0, 5] }, // Extract the first 5 characters of the string
                  "https",
                ],
              },
              then: "$user.user_profile_pic",
              else: {
                $concat: [`${API.Api}/file/view/`, "$user.user_profile_pic"],
              },
            },
          },
          coins: 1,
          agora_ud: 1,
          user_id: 1,
          created_at: 1,
          live_streaming_channel_id: 1,
          live_streaming_token: 1,
          live_streaming_type: 1,
          live_name: 1,
          live_streaming_start_time: 1,
          live_streaming_current_status: 1,
          created_by: 1,
        },
      },
      {
        $sort: {
          coins: -1,
        },
      }
    ]);
    return res.json({
      success: true,
      msg: "Data fetched",
      data: data,
    });
  } catch (error) {
    return res.json({
      success: false,
      msg: error.message,
    });
  }
});

module.exports = router;
