const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_reseller_agency_trax');
const ResellerAgencyUserTran=require('../models/m_reseller_agency_user_recharge_trax');
const TableLogin=require('../models/m_user_login')
const rc = require('./../controllers/responseController');
const asyncErrorHandler = require('../utilis/asyncErrorHandler');
const UserWalletTable = require('../models/m_user_wallet_balance');
const ResellerWalletTable = require('../models/m_agency_reseller_wallate_balence');
const ResellerTable = require('../models/m_sub_admin');

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


router.route('/reclaim/:transactionId').post(asyncErrorHandler(async(req,res)=>{
    //DONE: 1 Confirm the transaction is successfull debited from reseller 
    //DONE: 2 Confirm the transaction is successfull credited to user
    //DONE: 3 If both are successfull then reclaim the transaction
    //DONE: 4 If any one of them is failed then return the error message
    //DONE: 5 first debit the amount from user wallet
    //DONE: 6 then credit the amount to reseller wallet
    //DONE: 7 then update the transaction status to reclaim
    const transactionId=req.params.transactionId;
    const resellerId = req.body.resellerId;
    const password = req.body.password;
    const reseller = await ResellerTable.Table.findById(resellerId,{password:1});
    if(!reseller || reseller.password != password){
        return res.json({
            success:false,
            msg:"Invalid Password",
        });
    }
    const data=await ResellerAgencyUserTran.Table.find({transaction_id:transactionId}).sort({_id:1});
    if(data.length==0){
        return res.json({
            success:false,
            msg:"Something Went Wrong please contact to admin",
        })
    }
    if(
        data[0].transaction_status != data[1].transaction_status &&
        data[0].transaction_amount != data[1].transaction_amount &&
        data[0].receiver_id != data[1].receiver_id &&
        data[0].transaction_status != "success" &&
        data[1].transaction_status != "success"
    )return res.json({
        success:false,
        msg:"Something Went Wrong please contact to admin",
    })

    let userWallet = await UserWalletTable.Table.findOne({user_id:data[0].receiver_id});
    if(!userWallet){
        return res.json({
            success:false,
            msg:"Something Went Wrong please contact to admin",
        })
    }
    let resellerWallet = await ResellerWalletTable.Table.findOne({ra_id:resellerId});
    if(!resellerWallet){
        return res.json({
            success:false,
            msg:"Something Went Wrong please contact to admin",
        })
    }
    let temp = resellerWallet.ra_r_coin;
    userWallet.user_diamond = userWallet.user_diamond - data[0].transaction_amount;
    resellerWallet.ra_r_coin = resellerWallet.ra_r_coin + data[0].transaction_amount;
    data[0].transaction_status = "refund";
    data[1].transaction_status = "refund";
    data[0].last_update = Date.now();
    data[1].last_update = Date.now();
    // save the data
    let isCreated = await ResellerAgencyUserTran.Table.create({
        transaction_id:transactionId,
        transaction_type:"reclaimed",
        transaction_amount:data[0].transaction_amount,
        transaction_status:"success",
        transaction_date:Date.now(),
        sender_type:"user",
        receiver_type:"reseller",
        sender_id:data[0].receiver_id,
        receiver_id:data[0].sender_id,
        before_tran_balance:temp,
        after_tran_balance:resellerWallet.ra_r_coin,
        user_wallet_type_from:"diamonds",
        user_wallet_type_to:"diamonds",
        last_update:Date.now(),
    });

    await data[0].save();
    await data[1].save();
    // create a new tranaaction of reclaim
    let isOk = await userWallet.save();
    let isOk2 = await resellerWallet.save();
    if(!isOk && !isOk2 && !isCreated){
        return res.json({
            success:false,
            msg:"Something Went Wrong please contact to admin",
        })
    }
    return res.json({
        success:true,
        msg:"Reclaim Successfull",
        data:[]
    })
}));

router.get('/reseller-agency-user-tran/:id',async(req,res)=>{
    const id=req.params.id;
    const data = await ResellerAgencyUserTran.Table.find({$or:[{sender_id:id},{receiver_id:id}],transaction_type:{$ne:"credited"}}).sort({_id:-1});
    if(data){
        return res.json({
            success:true,
            msg:'Data Fetched',
            data:data
        });
    }
    return res.json({
        success:false,
        msg:'Data Not Found',
        data:[]
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
                // console.log(doc.user_diamond)
                // res.json(doc);
                
            }
        })
    }
);






router.post('/byField',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        console.log("i got the request");
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




module.exports = router;