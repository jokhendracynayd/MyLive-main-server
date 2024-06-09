// Production mode
const express = require("express");
const router = express.Router();
const TableModel = require("../models/m_user_wallet_trxn");
const rc = require("./../controllers/responseController");
const TableModelBalance = require("../models/m_user_wallet_balance");
const TableModelSticker = require("../models/m_sticker_master");
const TableModelTransactionSticker = require("../models/m_user_tansication_sticker");
const UserCurrentLiveBalance = require("../models/m_user_current_balance");
const UserGiftingTable = require("../models/m_user_gifting");
const TableModelLiveStreaming = require("../models/m_live_streaming");
const TableCoinConfig = require("../models/m_coins_configurations");
const CommentModel = require("../models/m_comments");
const authenticate = require("../config/user_auth");
const UserModel = require("../models/m_user_login");
const crypto = require("crypto");
const client = require("../config/redis");
const TableModelTransaction = require("../models/m_transaction");
const asyncErrorHandler = require('../utilis/asyncErrorHandler')
router.post(
  "/create",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // const newRow = req.body;
    const newRow = new TableModel(req.body);
    // newRow.institute = req.user.institute;
    if (!newRow) {
      return rc.setResponse(res, {
        msg: "No Data to insert",
      });
    }
    TableModel.addRow(newRow, (err, doc) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Inserted",
          data: doc,
        });
      }
    });
  }
);
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

//TODO: New controller for getLevel

async function calculateLevel(ans) {
    if (ans >= 0 && ans <= 50000) {
      var UserLevelView = ans / 50000;
      UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88
      let dataToSend = {
        rSide: 1,
        level: UserLevelView,
        lSide: 2,
      };
      return dataToSend
    } else if (ans >= 50000 && ans <= 150000) {
      var UserLevelView = ans / 150000;
      UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

      let dataToSend = {
        rSide: 2,
        level: UserLevelView,
        lSide: 3,
      };

      return dataToSend
    } else if (ans >= 150000 && ans <= 300000) {
      var UserLevelView = ans / 300000;
      UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

      let dataToSend = {
        rSide: 3,
        level: UserLevelView,
        lSide: 4,
      };

      return dataToSend
    } else if (ans >= 300000 && ans <= 500000) {
      var UserLevelView = ans / 500000;
      UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

      let dataToSend = {
        rSide: 4,
        level: UserLevelView,
        lSide: 5,
      };

      return dataToSend
    } else if (ans >= 500000 && ans <= 1000000) {
      var UserLevelView = ans / 1000000;
      UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

      let dataToSend = {
        rSide: 5,
        level: UserLevelView,
        lSide: 6,
      };

      return dataToSend
    } else if (ans >= 1000000 && ans <= 2000000) {
      var UserLevelView = ans / 2000000;
      UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

      let dataToSend = {
        rSide: 6,
        level: UserLevelView,
        lSide: 7,
      };

      return dataToSend
    } else if (ans >= 2000000 && ans <= 4000000) {
      var UserLevelView = ans / 4000000;
      UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

      let dataToSend = {
        rSide: 7,
        level: UserLevelView,
        lSide: 8,
      };
      return dataToSend
    } else if (ans >= 4000000 && ans <= 6000000) {
      var UserLevelView = ans / 6000000;
      UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

      let dataToSend = {
        rSide: 8,
        level: UserLevelView,
        lSide: 9,
      };

      return dataToSend
    } else if (ans >= 6000000 && ans <= 10000000) {
      var UserLevelView = ans / 10000000;
      UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

      let dataToSend = {
        rSide: 9,
        level: UserLevelView,
        lSide: 10,
      };

      return dataToSend
    } else if (ans >= 10000000 && ans <= 15000000) {
      var UserLevelView = ans / 15000000;
      UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

      let dataToSend = {
        rSide: 10,
        level: UserLevelView,
        lSide: 11,
      };

      return dataToSend
    } else if (ans >= 15000000 && ans <= 20000000) {
      var UserLevelView = ans / 20000000;
      UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

      let dataToSend = {
        rSide: 11,
        level: UserLevelView,
        lSide: 12,
      };

      return dataToSend
    } else if (ans >= 20000000 && ans <= 25000000) {
      var UserLevelView = ans / 25000000;
      UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

      let dataToSend = {
        rSide: 12,
        level: UserLevelView,
        lSide: 13,
      };

      return dataToSend
    } else if (ans >= 25000000 && ans <= 35000000) {
      var UserLevelView = ans / 35000000;
      UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

      let dataToSend = {
        rSide: 13,
        level: UserLevelView,
        lSide: 14,
      };

      return dataToSend
    } else if (ans >= 35000000 && ans <= 50000000) {
      var UserLevelView = ans / 50000000;
      UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

      let dataToSend = {
        rSide: 14,
        level: UserLevelView,
        lSide: 15,
      };

      return dataToSend
    } else if (ans >= 50000000 && ans <= 80000000) {
      var UserLevelView = ans / 80000000;
      UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

      let dataToSend = {
        rSide: 15,
        level: UserLevelView,
        lSide: 16,
      };

      return dataToSend
    } else if (ans >= 80000000 && ans <= 1100000000) {
      var UserLevelView = ans / 1100000000;
      UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

      let dataToSend = {
        rSide: 16,
        level: UserLevelView,
        lSide: 17,
      };

      return dataToSend
    } else if (ans >= 1100000000 && ans <= 1400000000) {
      var UserLevelView = ans / 1400000000;
      UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

      let dataToSend = {
        rSide: 17,
        level: UserLevelView,
        lSide: 18,
      };

      return dataToSend
    } else if (ans >= 1400000000 && ans <= 1700000000) {
      var UserLevelView = ans / 1700000000;
      UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

      let dataToSend = {
        rSide: 18,
        level: UserLevelView,
        lSide: 19,
      };

      return dataToSend
    } else if (ans >= 1700000000 && ans <= 2050000000) {
      var UserLevelView = ans / 2050000000;
      UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

      let dataToSend = {
        rSide: 19,
        level: UserLevelView,
        lSide: 20,
      };

      return dataToSend
    } else if (ans >= 2050000000 && ans <= 20500000000) {
      var UserLevelView = ans / 20500000000;
      UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

      let dataToSend = {
        rSide: 20,
        level: UserLevelView,
        lSide: 21,
      };
      return dataToSend
    }
}


const getLevel = async (req,res) => {
 const { user_id } = req.body;
 // validate user_id
  if(!user_id){
    return res.json({
      success: false,
      msg: "Invalid data"
    })
  }
  let isLevel = await client.GET(`${user_id}_level`);
    if (isLevel) {
      isLevel = JSON.parse(isLevel);
        return rc.setResponse(res, {
          success: true,
          msg: "Data fetch",
          data: isLevel,
        });
    }
  const coinsSum = await UserGiftingTable.Table.aggregate([
    {
      $match: {
        user_id: user_id,
      },
    },
    {
      $addFields: {
        gift_priceNumeric: { $toInt: "$gift_price" }
      }
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$gift_priceNumeric"
        }
      }
    }
  ]);
  if(coinsSum.length === 0|| !coinsSum[0].total){
    let isOk = await UserModel.Table.findOneAndUpdate(
      { username: user_id },
      { level:{currentLevel:1,currentLevelCoin:0}},
      { new: true }
    );
    return res.json({
      success: true,
      msg: "Data fetch",
      data: {
        rSide: 1,
        level: 1.0,
        lSide: 2,
      },
   })
  }
  const level = await calculateLevel(coinsSum[0].total);
  if(!level){
    return res.json({
      success: false,
      msg: "something went wrong"
    })
  }
  let isOk = await UserModel.Table.findOneAndUpdate(
    { username: user_id },
    { level:{currentLevel:level.rSide,currentLevelCoin:coinsSum[0].total}},
    { new: true }
  );
  await client.SETEX(
    `${user_id}_level`,
    21600,
    JSON.stringify(level),
  );
  return res.json({
    success: true,
    msg: "Data fetch",
    data: level,
 })
};

router.post("/transaction", async (req, res) => {
  const { sticker_id, liveStreamingRunningID, userBy, userTo, price ,role} =
    req.body;
  try {
    if (
      !sticker_id ||
      !liveStreamingRunningID ||
      !userBy ||
      !userTo ||
      !price
    ) {
      return res.json({ success: false, msg: "Invalid data" });
    }
    let users = await TableModelBalance.Table.find({
      user_id: { $in: [userBy, userTo] },
    });
    const userData = {};
    if (userBy === userTo) {
      userData.userBy = users[0];
      userData.userTo = users[0];
    } else {
      for (const user of users) {
        if (user.user_id === userBy) {
          userData.userBy = user;
        } else if (user.user_id === userTo) {
          userData.userTo = user;
        }
      }
    }
    if (!userData.userBy || !userData.userTo) {
      return res.json({ success: false, msg: "Invalid data" });
    }
    if (userData.userBy.user_diamond < price) {
      return res.json({ success: false, msg: "Insufficient balance" });
    }
    const stickerData = await TableModelSticker.Table.findOne({
      _id: sticker_id,
    });
    let sticker_price = 0;
    if (!stickerData) {
      sticker_price = stickerData.sticker_price;
    } else {
      sticker_price = price;
    }
    let config_data = await TableCoinConfig.Table.findOne({
      _id: "64cdcbd58a180bb46b36e9e6",
    });
    if (!config_data) {
      return res.json({ success: false, msg: "something went wrong" });
    }
    let is_confirm = await TableModelBalance.Table.findOneAndUpdate(
      { user_id: userBy },
      { $inc: { user_diamond: -sticker_price } },
      { new: true }
    );
    if (!is_confirm) {
      return res.json({ success: false, msg: "something went wrong" });
    }
    let is_confirm2 = await TableModelBalance.Table.findOneAndUpdate(
      { user_id: userTo },
      { $inc: { user_rcoin: price * config_data.one_dimaond_r_coin_price } },
      { new: true }
    );
    if (!is_confirm2) {
      await TableModelBalance.Table.updateOne(
        { user_id: userBy },
        { $inc: { user_diamond: price } },
        { new: true }
      );
      return res.json({ success: false, msg: "something went wrong" });
    }
    let transaction_id1 = crypto.randomBytes(16).toString("hex");
    let data1 = {
      transaction_id: transaction_id1,
      transaction_type: "debited",
      transaction_amount: sticker_price,
      before_tran_balance: is_confirm.user_diamond + sticker_price,
      after_tran_balance: is_confirm.user_diamond,
      transaction_status: "success",
      transaction_date: new Date(),
      sender_type: "user",
      receiver_type: "user",
      sender_id: userBy,
      receiver_id: userTo,
      user_wallet_type_from: "diamonds",
      user_wallet_type_to: "r-coins",
      entity_type: {
        type: "stickers-gifting",
        sticker_id: sticker_id,
      },
    };
    const newRow1 = new TableModelTransaction(data1);
    TableModelTransaction.addRow(newRow1, (err, doc) => {
      if (err) {
        console.log(err.message);
      } else {
        // console.log("this is the transaction error", doc);
      }
    });
    let transaction_id = crypto.randomBytes(16).toString("hex");
    let data = {
      transaction_id: transaction_id,
      transaction_type: "credited",
      transaction_amount:
      sticker_price * Number(config_data.one_dimaond_r_coin_price),
      before_tran_balance:
      is_confirm2.user_rcoin -
      sticker_price * Number(config_data.one_dimaond_r_coin_price),
      after_tran_balance: is_confirm2.user_rcoin,
      transaction_status: "success",
      transaction_date: new Date(),
      sender_type: "user",
      receiver_type: "user",
      sender_id: userBy,
      receiver_id: userTo,
      user_wallet_type_from: "diamonds",
      user_wallet_type_to: "r-coins",
      entity_type: {
        type: "stickers-gifting",
        sticker_id: sticker_id,
      },
    };
    const newRow = new TableModelTransaction(data);
    TableModelTransaction.addRow(newRow, (err, doc) => {
      if (err) {
        console.log(err.message);
      } else {
        // console.log("this is the transaction error", doc);
      }
    });

    /* This below code for send the sticker over the chat */

    if(!liveStreamingRunningID){
      return res.json({
        success: true,
        msg: "Sticker sent successfully",
        data: {
          userBy: {
            user_id: userData.userBy.user_id,
            user_diamond: userData.userBy.user_diamond - sticker_price,
          },
          userTo: {
            user_id: userData.userTo.user_id,
            user_rcoin:
            userData.userTo.user_rcoin +
            sticker_price * config_data.one_dimaond_r_coin_price,
          },
          sticker_path: stickerData.sticker_path,
        },
      })
    }

    await TableModelLiveStreaming.Table.findOneAndUpdate(
      {
        _id: liveStreamingRunningID,
        user_id: userTo,
      },
      {
        $inc: {
          coins: sticker_price * config_data.one_dimaond_r_coin_price,
        },
      },
      { new: true }
    );
    const newRow2 = new UserGiftingTable({
      user_id: userBy,
      gifting_box_type_id: sticker_id,
      gifting_to_user: userTo,
      gift_price: sticker_price,
      livestreaming_id: liveStreamingRunningID,
      role:role
    });
    UserGiftingTable.addRow(newRow2, async(err, doc) => {
      if (err) {
        console.log("this is form userGifting", err.message);
      } else {
        let isUser = await client.GET(`${userBy}_level`);
        if(isUser){
          await client.DEL(`${userBy}_level`);
        }
      }
    });

    await UserCurrentLiveBalance.Table.findOne({
      live_streaming_id: liveStreamingRunningID,
    })
      .then((data) => {
        let CurrentRCoinValue =
          parseInt(data.r_coin_value) +
          sticker_price * config_data.one_dimaond_r_coin_price;
        let starRating = "";
        if (CurrentRCoinValue > 0 && CurrentRCoinValue < 10000) starRating = 1;
        else if (CurrentRCoinValue < 50000) starRating = 2;
        else if (CurrentRCoinValue < 200000) starRating = 3;
        else if (CurrentRCoinValue < 1000000) starRating = 4;
        else starRating = 5;
        return UserCurrentLiveBalance.Table.findByIdAndUpdate(
          { _id: data._id },
          { r_coin_value: CurrentRCoinValue, star_rating: starRating },
          { new: true }
        );
      })
      .then(async(d) => {
        const newComment = {
          comment_type: "live_streaming",
          comment_desc: "gifted" + price,
          comment_entity_id: liveStreamingRunningID,
          comment_by_user_id: userBy,
        };
        const commentToWelcomeUser = await new CommentModel(newComment);
        CommentModel.addRow(commentToWelcomeUser, (err, docs) => {
          if (err) {
            console.log("error!! ");
          } else {
            // console.log("gift details send successfully");
          }
        });
      })
      .catch((err) => {
        return res.json({ success: false, msg: err.message });
      });

      
      const newData = await new TableModelTransactionSticker({
        host_userId: userTo,
        user_id: userBy,
        sticker_id: sticker_id,
        sticker_path: stickerData.sticker_path,
      });
      TableModelTransactionSticker.addRow(newData, (err, document) => {
        if (err) {
          return res.json({ success: false, msg: err.message });
        } else {
          // console.log("this is the document", document)
          return res.json({
            success: true,
            msg: "data set",
            data: document,
          });
        }
      });
  } catch (err) {
    return res.json({ success: false, msg: err.message });
  }
});



router.route('/getLevel').post(asyncErrorHandler(getLevel));

router.post(
  "/getLevel",
  // authenticate,
  async(req, res) => {
    const { user_id } = req.body;
    const userIds = ['111111','111110'];
    if(userIds.includes(user_id)){
      return rc.setResponse(res, {
        success: true,
        msg: "Data fetch",
        data: {
          rSide: 15,
          level: 15.0,
          lSide:14,
        },
      });
    }
    let isLevel = await client.GET(`${user_id}_level`);
    if (isLevel) {
      isLevel = JSON.parse(isLevel);
        return rc.setResponse(res, {
          success: true,
          msg: "Data fetch",
          data: isLevel,
        });
    }
    UserGiftingTable.getDataByFieldName("user_id", user_id, (err, doc) => {
      if (err) {
        res.json({
          success: false,
          msg: "error",
        });
      } else {
        if (doc.length == 0) {
          let dataToSend = {
            rSide: 1,
            level: 1.0,
            lSide: 2,
          };
          return rc.setResponse(res, {
            success: true,
            msg: "No gifting found",
            data: dataToSend,
          });
        }
        function sendLevel(ans, callback) {
          if (ans >= 0 && ans <= 50000) {
            var UserLevelView = ans / 50000;
            UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88
            let dataToSend = {
              rSide: 1,
              level: UserLevelView,
              lSide: 2,
            };
            callback(dataToSend);
          } else if (ans >= 50000 && ans <= 150000) {
            var UserLevelView = ans / 150000;
            UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

            let dataToSend = {
              rSide: 2,
              level: UserLevelView,
              lSide: 3,
            };

            callback(dataToSend);
          } else if (ans >= 150000 && ans <= 300000) {
            var UserLevelView = ans / 300000;
            UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

            let dataToSend = {
              rSide: 3,
              level: UserLevelView,
              lSide: 4,
            };

            callback(dataToSend);
          } else if (ans >= 300000 && ans <= 500000) {
            var UserLevelView = ans / 500000;
            UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

            let dataToSend = {
              rSide: 4,
              level: UserLevelView,
              lSide: 5,
            };

            callback(dataToSend);
          } else if (ans >= 500000 && ans <= 1000000) {
            var UserLevelView = ans / 1000000;
            UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

            let dataToSend = {
              rSide: 5,
              level: UserLevelView,
              lSide: 6,
            };

            callback(dataToSend);
          } else if (ans >= 1000000 && ans <= 2000000) {
            var UserLevelView = ans / 2000000;
            UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

            let dataToSend = {
              rSide: 6,
              level: UserLevelView,
              lSide: 7,
            };

            callback(dataToSend);
          } else if (ans >= 2000000 && ans <= 4000000) {
            var UserLevelView = ans / 4000000;
            UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

            let dataToSend = {
              rSide: 7,
              level: UserLevelView,
              lSide: 8,
            };
            callback(dataToSend);
          } else if (ans >= 4000000 && ans <= 6000000) {
            var UserLevelView = ans / 6000000;
            UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

            let dataToSend = {
              rSide: 8,
              level: UserLevelView,
              lSide: 9,
            };

            callback(dataToSend);
          } else if (ans >= 6000000 && ans <= 10000000) {
            var UserLevelView = ans / 10000000;
            UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

            let dataToSend = {
              rSide: 9,
              level: UserLevelView,
              lSide: 10,
            };

            callback(dataToSend);
          } else if (ans >= 10000000 && ans <= 15000000) {
            var UserLevelView = ans / 15000000;
            UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

            let dataToSend = {
              rSide: 10,
              level: UserLevelView,
              lSide: 11,
            };

            callback(dataToSend);
          } else if (ans >= 15000000 && ans <= 20000000) {
            var UserLevelView = ans / 20000000;
            UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

            let dataToSend = {
              rSide: 11,
              level: UserLevelView,
              lSide: 12,
            };

            callback(dataToSend);
          } else if (ans >= 20000000 && ans <= 25000000) {
            var UserLevelView = ans / 25000000;
            UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

            let dataToSend = {
              rSide: 12,
              level: UserLevelView,
              lSide: 13,
            };

            callback(dataToSend);
          } else if (ans >= 25000000 && ans <= 35000000) {
            var UserLevelView = ans / 35000000;
            UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

            let dataToSend = {
              rSide: 13,
              level: UserLevelView,
              lSide: 14,
            };

            callback(dataToSend);
          } else if (ans >= 35000000 && ans <= 50000000) {
            var UserLevelView = ans / 50000000;
            UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

            let dataToSend = {
              rSide: 14,
              level: UserLevelView,
              lSide: 15,
            };

            callback(dataToSend);
          } else if (ans >= 50000000 && ans <= 80000000) {
            var UserLevelView = ans / 80000000;
            UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

            let dataToSend = {
              rSide: 15,
              level: UserLevelView,
              lSide: 16,
            };

            callback(dataToSend);
          } else if (ans >= 80000000 && ans <= 1100000000) {
            var UserLevelView = ans / 1100000000;
            UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

            let dataToSend = {
              rSide: 16,
              level: UserLevelView,
              lSide: 17,
            };

            callback(dataToSend);
          } else if (ans >= 1100000000 && ans <= 1400000000) {
            var UserLevelView = ans / 1400000000;
            UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

            let dataToSend = {
              rSide: 17,
              level: UserLevelView,
              lSide: 18,
            };

            callback(dataToSend);
          } else if (ans >= 1400000000 && ans <= 1700000000) {
            var UserLevelView = ans / 1700000000;
            UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

            let dataToSend = {
              rSide: 18,
              level: UserLevelView,
              lSide: 19,
            };

            callback(dataToSend);
          } else if (ans >= 1700000000 && ans <= 2050000000) {
            var UserLevelView = ans / 2050000000;
            UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

            let dataToSend = {
              rSide: 19,
              level: UserLevelView,
              lSide: 20,
            };

            callback(dataToSend);
          } else if (ans >= 2050000000 && ans <= 20500000000) {
            var UserLevelView = ans / 20500000000;
            UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

            let dataToSend = {
              rSide: 20,
              level: UserLevelView,
              lSide: 21,
            };

            callback(dataToSend);
          }
        }
        function level(data, callback) {
          let count = 0;
          let sum = 0;
          let GiftPrice = 0;

          data.forEach((ele) => {
            // console.log(ele.gift_price);

            GiftPrice = ele.gift_price;
            if (isNaN(GiftPrice)) {
              GiftPrice = 0;
            }
            sum += Number(GiftPrice);
            count++;
            if (data.length == count) {
              console.log(sum);
              sendLevel(sum, callback);
            }
          });
        }
        level(doc, async(response) => {
          await client.SETEX(
            `${user_id}_level`,
            21600,
            JSON.stringify(response),
          );
          let isOk = await UserModel.Table.findOneAndUpdate(
            { username: user_id },
            { level: response.rSide },
            { new: true }
          );
          return rc.setResponse(res, {
            success: true,
            msg: "Data fetch",
            data: response,
          });
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
        return rc.setResponse(res, {
          success: true,
          msg: "Data Fetched",
          data: docs,
        });
      }
    });
  }
);

router.post(
  "/byFields",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const fieldNames = req.body.fieldNames;
    const fieldValues = req.body.fieldValues;
    TableModel.getDataByFieldNames(fieldNames, fieldValues, (err, docs) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Fetched",
          data: docs,
        });
      }
    });
  }
);

router.put(
  "/update/:id",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
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
  }
);

router.delete(
  "/byId/:id",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
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
  }
);

module.exports = router;
