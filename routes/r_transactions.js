const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_transaction');
const rc = require('../controllers/responseController');
const asyncErrorHandler = require('../utilis/asyncErrorHandler')
const UserWallteTable = require('../models/m_user_wallet_balance');
const fs = require('fs');



router.get('/make-transaction/:userId',asyncErrorHandler(async(req,res)=>{
    const userId = req.params.userId;
    let data = await TableModel.aggregate([
        {
          $match: 
            {sender_id:userId,
             sender_type:"user",
             receiver_type:"user",
             transaction_date: {
                $gte: new Date('2024-01-15T00:00:00.232+00:00'),
                $lt: new Date('2024-02-03T06:50:00.000+00:00')
              },
             transaction_type:"debited",
             "entity_type.type":"stickers-gifting",
             transaction_status:"success"
            }
        },{
          $group: {
            _id: "$receiver_id",
            totalCoins: {
              $sum: "$transaction_amount"
            }
          }
        }
      ])
    let totalCoins = 0;
    data.forEach(element => {
        totalCoins += element.totalCoins;
    });
    let truesum = 0;
    let falsesum = 0;
    let jsonData = [];
    for(let user of data){
        let userWallet = await UserWallteTable.findOne({user_id:user._id});
        if(userWallet.user_rcoin>=user.totalCoins){
            truesum+=user.totalCoins;
            let isOk = await UserWallteTable.updateOne({user_id:user._id},{$inc:{user_rcoin:user.totalCoins}},{new:true});
            if(isOk){
                jsonData.push({
                    userId: user._id,
                    userRcoin: userWallet.user_rcoin,
                    totalCoins: user.totalCoins,
                    remaningCoins: userWallet.user_rcoin - user.totalCoins
                });
            }
            // console.table(user._id,userWallet.user_rcoin,user.totalCoins);
            // widraw from user wallet
            // console.log(isOk);
        }
        else{
            falsesum+=user.totalCoins;
        }
        // console.log(userWallet.user_rcoin,`🔥🔥${userWallet.user_rcoin>=user.totalCoins}🔥🔥`,user.totalCoins);
    }
    // console.log(truesum,falsesum);
    fs.writeFileSync(`$new_{userId}_output.json`, JSON.stringify(jsonData, null, 2));
    return res.json({
        success: true,
        msg: 'Data Fetched',
        totalCoins: totalCoins,
        // data: data
    });
}));





router.get('/game-transactions/:id',async(req,res)=>{
    TableModel.lastTransactions(req.params.id,async(err,docs)=>{
      if(err){
        return rc.setResponse(res, {
          msg: err.message
        });
      }else{
          await docs.forEach(element => {
              if(!element.last_update){
                  element.last_update = element.transaction_date;
              }
          });
        return rc.setResponse(res, {
          success: true,
          msg: 'Data Fetched',
          data: docs
        });
      }
    })
  })

//TODO: Move transaction document to old transaction collection after 1 month

router.route('/move-document').get(asyncErrorHandler(async (req, res) => {
    let cutoffDate = new Date("2023-09-30T23:59:59.999Z");
    let document = await TableModel.Table.find({
        transaction_date: {
            $lt: cutoffDate
        }
    });
    if (document.length > 0) {
        await TableModel.OldTable.insertMany(document);
        let deletedResult = await TableModel.Table.deleteMany({
            transaction_date: {
                $lt: cutoffDate
            }
        });
        return res.json({
            success: true,
            msg: 'Data Moved',
            data: deletedResult.deletedCount 
        });
    }
    return res.json({
        success: true,
        msg: 'Data Fetched',
        data: []
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
    // passport.authenticate("jwt", { session: false }),
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