const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_announcement');
const UserLoginTable=require('../models/m_user_login')
const rc = require('../controllers/responseController');
const passport = require("passport");
const asyncErrorHandler = require('../utilis/asyncErrorHandler');
const { sendRechargeMessage } = require('../controllers/send.recharge.messge');

router.route('/create').post(asyncErrorHandler(async (req, res, _) => {
    const {toAll,user_id,message} = req.body;
    if(!message){
        return res.json({
            success:false,
            msg:"Please enter message"
        })
    }
    if(toAll){
        // to all users
        const users = await UserLoginTable.Table.find({},{_id:1,username:1});
        users.forEach(async (user) => {
            await sendRechargeMessage('11111',user.username,message);
        });
        return res.json({
            success:true,
            msg:"Message sent to all users"
        });
    }
    if(user_id){
        // to specific user
        const user = await UserLoginTable.Table.findOne({username:user_id},{_id:1,username:1});
        if(user){
            await sendRechargeMessage('11111',user.username,message);
            return res.json({
                success:true,
                msg:"Message sent to user"
            });
        }
    }
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
        console.log(fieldName)
        const fieldValue = req.body.fieldValue;
        console.log(fieldValue)
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
    passport.authenticate("jwt", { session: false }),
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