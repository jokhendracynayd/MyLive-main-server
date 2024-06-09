const express = require('express');
const router = express.Router();
const asyncErrorHandler = require('../utilis/asyncErrorHandler');
const VipModel = require('../models/m_vip.items');
const UserModel = require('../models/m_user_login');
const BalaceModel = require('../models/m_user_wallet_balance');
const TransactionModel = require('../models/m_transaction');
const crypto = require("crypto");

router.route('/items').get(asyncErrorHandler(async (req, res, next) => {
  const vipItems = await VipModel.find({});
  return res.json({
    success: true,
    msg: "Get vip items success",
    data:vipItems || []
  });
}));



router.route('/purchase').post(asyncErrorHandler(async (req, res, next) => {
  const {user_id, item_id} = req.body;
  if(!user_id || !item_id){
    return res.json({
      success: false,
      msg: "Missing user_id or item_id" 
    });
  }
  let user = await UserModel.Table.findOne({username: user_id});
  let userBalance = await BalaceModel.Table.findOne({user_id: user_id});
  let vipItem = await VipModel.findOne({item_id});
  if(!user || !userBalance || !vipItem){
    return res.json({
      success: false,
      msg: "User or balance or vip item not found" 
    });
  }
  if(userBalance.user_diamond < vipItem.price){
    return res.json({
      success: false,
      msg: "Not enough rcoin" 
    });
  } 
  // Update user vip status
  // Update user balance
  // Create transaction
  // Update vip item
  let is_confirm = await BalaceModel.Table.updateOne({user_id: user_id},{$inc:{user_diamond: -vipItem.price}});
  user.vip.status = vipItem.item_id;
  user.vip.expire_at = new Date();
  user.vip.expire_at.setDate(user.vip.expire_at.getDate() + 30);
  user.save();
  let transaction_id = crypto.randomBytes(16).toString("hex");
  let data = {
    transaction_id: transaction_id,
    transaction_type: "debited",
    transaction_amount:vipItem.price,
    before_tran_balance: userBalance.user_diamond,
    after_tran_balance: is_confirm.user_rcoin,
    transaction_status: "success",
    transaction_date: new Date(),
    sender_type: "user",
    receiver_type: "mylive",
    sender_id: user_id,
    receiver_id: vipItem._id,
    user_wallet_type_from: "diamonds",
    user_wallet_type_to: "diamonds",
    entity_type: {
      type: "vip_item",
      item_id: vipItem.item_id,
    },
  };
  await TransactionModel.Table.create(data);
  return res.json({
    success: true,
    msg: "Purchase success" 
  }); 
}));

module.exports = router;