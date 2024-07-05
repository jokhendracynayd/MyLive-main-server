const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_user_wallet_balance');
const ResellerAgencyWallet=require('../models/m_agency_reseller_wallate_balence')
const ResellerAgencyUserTran=require('../models/m_reseller_agency_user_recharge_trax')
const rc = require('./../controllers/responseController');
const authenticate=require('./../config/reseller_auth');
const user_authenticate=require('./../config/user_auth');
const mongoose = require('mongoose');
const asyncErrorHandler = require('../utilis/asyncErrorHandler');
const crypto = require('crypto');
const {sendRechargeMessage} = require('../controllers/send.recharge.messge');
const UserLoginModel = require('../models/m_user_login');
router.post('/create',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        // const newRow = req.body;
        const newRow = new TableModel(req.body);
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


/**
 * @description add R-coin to Agency and Reseller @jokhendra
 */




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


router.get('/total-diamond',(req,res)=>{
    TableModel.total_diamond((err,docs)=>{
        if(err){
            return rc.setResponse(res,{
                msg:err.message
            })
        }else{
            return rc.setResponse(res,{
                success:true,
                msg:'Total Diamond',
                data:docs
            })
        }
    }
    )
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
                // console.log(doc.user_diamond)
                // res.json(doc);
                
            }
        })
    }
);



router.post('/byField',
//user_authenticate,
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


async function Transaction(props){
    let ok = await ResellerAgencyUserTran.Table.create(props);
    if(ok){
        return true;
    }else{
        return false;
    }

}


router.put('/rechargeUser',asyncErrorHandler(async(req,res,next)=>{
    let {user_id,coins,resellerId}=req.body;
    coins = +coins;
    if(!Number(coins)||!user_id||!mongoose.Types.ObjectId.isValid(resellerId)){
        return res.json({
            success:false,
            msg:"Invalid Data"
        })
    }
    const IsUserWalletDetails = await UserLoginModel.Table.findOne({UID:user_id},{Udiamonds:1});
    if(!IsUserWalletDetails){
        return res.json({
            success:false,
            msg:"User not exists"
        })
    } 
    const IsResellerWalletDetails = await ResellerAgencyWallet.Table.findOne({ra_id:resellerId});
    if(!IsResellerWalletDetails){
        return res.json({
            success:false,
            msg:"Reseller not exists"
        })
    }
    let transaction_id = crypto.randomBytes(16).toString('hex');
    if(IsResellerWalletDetails.ra_r_coin>=coins){

        let transaction = {
            transaction_id : transaction_id,
            transaction_type :"credited",
            transaction_amount : coins,
            transaction_status : "pending",
            transaction_date : Date.now(),
            sender_type : "reseller",
            receiver_type : "user",
            sender_id : resellerId,
            receiver_id : user_id,
            before_tran_balance : IsUserWalletDetails.Udiamonds,
            after_tran_balance : IsUserWalletDetails.Udiamonds + coins,
            user_wallet_type_from : "diamonds",
            user_wallet_type_to : "diamonds",
        }

        // update the balance of reseller
        let newResellerBalance = IsResellerWalletDetails.ra_r_coin - coins;
        let updateResellerBalance = await ResellerAgencyWallet.Table.updateOne({ra_id:resellerId},{ra_r_coin:newResellerBalance},{new:true});
        if(!updateResellerBalance.ok){

            /**
             * here we can add the transaction details in the transaction table
             */
            transaction.transaction_status = "failed";
            transaction.before_tran_balance = 0;
            transaction.after_tran_balance = 0;
            if(Transaction(transaction)){
                // transaction inserted successfully
            }else{
                // transaction failed
            }
            return res.json({
                success:false,
                msg:"Something went wrong"
            })
        }

        // update the balance of user
        let newUserBalance = IsUserWalletDetails.Udiamonds + coins;
        let updateUserBalance = await UserLoginModel.Table.updateOne({UID:user_id},{Udiamonds:newUserBalance},{new:true});
        if(!updateUserBalance.ok){
                
                /**
                * here we can add the transaction details in the transaction table and refund the reseller balance
                */
            // refund the reseller balance
            let newResellerBalance = IsResellerWalletDetails.ra_r_coin + coins;
            let updateResellerBalance = await ResellerAgencyWallet.Table.updateOne({ra_id:resellerId},{ra_r_coin:newResellerBalance},{new:true});
            if(!updateResellerBalance.ok){

                /**
                 * make a transaction details of failed during refund
                */
                transaction.transaction_status = "failed";
                transaction.before_tran_balance = 0;
                transaction.after_tran_balance = 0;
                if(Transaction(transaction)){
                    // transaction inserted successfully
                }else{
                    // transaction failed
                }

                return res.json({
                    success:false,
                    msg:"Something went wrong"
                })
            }
            // this transaction logs for user record
            
            transaction.transaction_status = "failed";
            transaction.transaction_type = "debited";
            transaction.before_tran_balance = 0;
            transaction.after_tran_balance = 0;
            if(Transaction(transaction)){
                // transaction inserted successfully
            }else{
                // transaction failed
            }


            return res.json({
                success:false,
                msg:"Something went wrong"
            })
        }

        /**
         *  here add to the transaction details of the user and reseller of the recharge success
        */
        transaction.transaction_status = "success";
        if(Transaction(transaction)){
            // transaction inserted successfully
        }else{
            // transaction failed
        } 

        // this transaction logs for reseller record
        transaction.transaction_status = "success";
        transaction.transaction_type = "debited";
        transaction.before_tran_balance = IsResellerWalletDetails.ra_r_coin;
        transaction.after_tran_balance = IsResellerWalletDetails.ra_r_coin - coins;
        transaction.transaction_amount = coins;
        transaction.transaction_id = transaction_id;

        if(Transaction(transaction)){
            // transaction inserted successfully
        }else{
            // transaction failed
        }

        // send notification to the user
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Dhaka',
          };
          
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const formattedDateTime = formatter.format(new Date());
        const message = `Great news! At ${formattedDateTime}, your reseller credited your account with ${coins} diamonds. Dive into your upgraded experience and make the most of it! Happy exploring`;
        // let message = `${coins} diamonds added to your account`;
        // let ok = await sendRechargeMessage("11111",user_id,message);
        return res.json({
            success:true,
            msg:"Recharge Success"
        })

        
    }else{
       return res.json({
            success:false,
            msg:"Insufficient Balance"
        })
    }
}));



router.put('/rechargeUser',authenticate,(req,res)=>{
    const {user_id,coins,resellerId}=req.body;
    const filter={user_id:user_id}
    TableModel.getDataByFieldName("user_id",user_id,(err,doc)=>{
        if(err){
            console.log(err.message);
        }else{
            if(doc!=null){
                ResellerAgencyWallet.getDataByFieldName("ra_id",resellerId,(err,docs)=>{
                    if(err){
                        console.log(err.message)
                    }else{
                        if(Number(docs.ra_r_coin)<Number(coins)){
                            return rc.setResponse(res,{
                                success:false,
                                msg:"Insufficient Balance"
                            })
                        }
                        else{
                            let R_newCoins=String(Number(docs.ra_r_coin)-Number(coins));
                            ResellerAgencyWallet.upadateByfieldName({"ra_id":resellerId},{"ra_r_coin":R_newCoins},(err,docss)=>{
                                if(err){
                                    console.log(err.message)
                                }else{
                                    const newRow=new ResellerAgencyUserTran({
                                        receiver_user_id:user_id,
                                        receiver_type:"user",
                                        sender_id:resellerId,
                                        sender_type:docs.ra_type,
                                        coins:coins,
                                        transaction_id:Date.now()
                                    })
                                    ResellerAgencyUserTran.addRow(newRow, (err, docsss) => {
                                        if (err) {
                                            
                                        } else {
                                            // console.log(docsss)
                                        }
                                    })
                                }
                            })
                            let newCoins=String(Number(doc.user_diamond)+Number(coins));
                            TableModel.upadateByfieldName(filter,{"user_diamond":newCoins},(err,docs)=>{
                                if(err){
                                    console.log(err.message)
                                }else{
                                    return rc.setResponse(res,{
                                        success:true,
                                        msg:"Data Updated",
                                        data:docs
                                    })
                                }
                            })
                        }
                    }
                })
               
            }else{
                return rc.setResponse(res,{
                    success:false,
                    msg:"User not found",
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




module.exports = router;