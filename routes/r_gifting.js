const router = require('express').Router();
const asyncErrorHandler = require('../utilis/asyncErrorHandler');
const BalanceModel = require('../models/m_user_wallet_balance');
const UserModel = require('../models/m_user_login');
const TableModelTransactionSticker = require("../models/m_user_tansication_sticker");
const TableModelSticker = require("../models/m_sticker_master");
const TableModelTransaction = require("../models/m_transaction");
const TableCoinConfig = require("../models/m_coins_configurations");
const TableModelLiveStreaming = require("../models/m_live_streaming");
const UserGiftingTable = require("../models/m_user_gifting");
const crypto = require("crypto");
const client = require("../config/redis");


router.route('/lucky-gifting').post(asyncErrorHandler(async (req, res) => {
  const { SuseId, RuserIds, streamer_id, sticker_id, quantity } = req.body;
  // first validate all the fields
  if (!SuseId || !RuserIds || !streamer_id || !sticker_id || !quantity) {
    return res
    .json({
      success: false,
      message: "Please provide all the required fields" 
    });
  }
  // fetch the sticker price 
  let sticker = await TableModelSticker.findById(sticker_id);
  let stickerPrice = sticker.sticker_price;
  let totalPrice = stickerPrice * quantity;
  // fetch the sender balance
  let senderBalance = await BalanceModel.findOne({ user_id: SuseId });
  // check if sender have sufficient balance
  let senderBalanceBefore = senderBalance.user_diamond;
  if (senderBalanceBefore < totalPrice) {
    return res.json({
      success: false,
      message: "Insufficient balance"
    });
  }
  let config_data = await TableCoinConfig.Table.findOne({
    _id: "64cdcbd58a180bb46b36e9e6",
  });
  if(!config_data){
    return res.json({
      success: false,
      message: "Something went wrong"
    });
  }
  // fetch the receiver balance is array
  let receiverBalance = await BalanceModel.find({ user_id: { $in: RuserIds } });
  // now deduct the balance from sender
  senderBalance.user_diamond -= totalPrice;
  await senderBalance.save();
  // create the transaction for sender
  let transaction_id1 = crypto.randomBytes(16).toString("hex");
  let data1 = {
    transaction_id: transaction_id1,
    transaction_type: "debited",
    transaction_amount: totalPrice,
    before_tran_balance: senderBalanceBefore,
    after_tran_balance: senderBalance.user_diamond ,
    transaction_status: "success",
    transaction_date: new Date(),
    sender_type: "user",
    receiver_type: "user",
    sender_id: SuseId,
    receiver_id: RuserIds,
    user_wallet_type_from: "diamonds",
    user_wallet_type_to: "r-coins",
    entity_type: {
      type: "lucky-gifting",
      sticker_id: sticker_id,
    },
  };
  await TableModelTransaction.create(data1);
  // now add the balance to receiver till the total price is not zero in loop
  
  let userGiftingDatas = [];
  let transactionsDatas = [];
  let userGets = {};
  while (totalPrice > 0) {
    // fetch the receiver balance
    let receiverBalanceBefore = receiverBalance[0].user_rcoin;
    if(totalPrice >= stickerPrice){
      receiverBalance[0].user_rcoin += stickerPrice*config_data.one_dimaond_r_coin_price ;
      totalPrice -= stickerPrice;
      await receiverBalance[0].save();
    // create the transaction for receiver
    let transaction_id2 = crypto.randomBytes(16).toString("hex");
    transactionsDatas.push({
      transaction_id: transaction_id2,
      transaction_type: "credited",
      transaction_amount: stickerPrice*config_data.one_dimaond_r_coin_price,
      before_tran_balance: receiverBalanceBefore,
      after_tran_balance: receiverBalance[0].user_rcoin,
      transaction_status: "success",
      transaction_date: new Date(),
      sender_type: "user",
      receiver_type: "user",
      sender_id: SuseId,
      receiver_id: receiverBalance[0].user_id,
      user_wallet_type_from: "diamonds",
      user_wallet_type_to: "r-coins",
      entity_type: {
        type: "lucky-gifting",
        sticker_id: sticker_id,
      },
    });
    // move the first element to last and second to first in receiver balance array
    userGiftingDatas.push({
      user_id: SuseId,
      gifting_box_type_id: sticker_id,
      gifting_to_user: receiverBalance[0].user_id,
      gift_price: stickerPrice,
      livestreaming_id: streamer_id,
      role:'co-host'
    })
    // calculate how many times one user get the sticker
    
    userGets.hasOwnProperty(`user${receiverBalance[0].user_id}`) ? userGets[`user${receiverBalance[0].user_id}`] += 1 : userGets[`user${receiverBalance[0].user_id}`] = 1;
    receiverBalance.push(receiverBalance.shift());
    }else{
      // set remaining balance to redis
      if(await client.GET(`luckyGiftRev`)){
        // increment the value
        await client.INCRBY(`luckyGiftRev`,totalPrice);
      }else{
        // set the value
        await client.SET(`luckyGiftRev`,totalPrice);
      }
      break;
    }
  }

  // insert the transaction data
  await TableModelTransaction.insertMany(transactionsDatas);

  // insert the user gifting data
  await UserGiftingTable.Table.insertMany(userGiftingDatas);


  let document = await TableModelTransactionSticker.create({
    host_userId: RuserIds,
    user_id: SuseId,
    sticker_id: sticker_id,
    sticker_path: sticker.sticker_path,
  });

  // check here user is lucky or not

  
  
  return res.json({
    success: true,
    message: "lucky gifting",
    data: document,
    userGets:userGets
  });
}));


module.exports = router;