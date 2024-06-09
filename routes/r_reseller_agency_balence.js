const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_agency_reseller_wallate_balence');
const TableModel1=require('../models/m_reseller_agency_trax');
const passport = require("passport");
const rc = require('./../controllers/responseController');
const authenticate=require('../config/admin_auth');

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
 * @description  add-R-coin @jokhendra
 */



router.put('/addR-coin',authenticate,(req,res)=>{
    var {ra_id,ra_r_coin,name}=req.body;
    const query={ra_id:ra_id}
    var dt;
    Today = new Date();
    dt = Today.getTime();
    dt = dt-1326416267200;
    TableModel.getDataByField(query,(err,docs)=>{
        if(err){
            console.log(err.message);
        }else{
            if(docs.length==0){
                const newRow = new TableModel(req.body);
                if(!newRow){
                    return rc.setResponse(res, {
                        msg: 'No Data to insert'
                    });
                }
                else{
                    TableModel.addRow(newRow,(err,doc)=>{
                        if (err) {
                            return rc.setResponse(res, {
                                msg: err.message
                            });
                        } else {                            
                            const newRow1=new TableModel1({
                                receiver_id:ra_id,
                                receiver:name,
                                receiver_type:doc.ra_type,
                                coins:ra_r_coin,
                                transaction_id:dt,
                            })
                            TableModel.addRow(newRow1,(err,d_c)=>{
                                if(err){
                                    console.log(err.message);
                                }
                            });
                            return rc.setResponse(res, {
                                success: true,
                                msg: 'Data Inserted',
                                data: doc
                            });
                        }
                    })
                }
                
            }else{
                var currentBalance=Number(docs[0].ra_r_coin);
                var updateBalance=String(Number(ra_r_coin)+currentBalance);
                const newData={ra_r_coin:updateBalance};
                TableModel.findByFindNameAndUpdate(query,newData,(err,doc)=>{
                    if(err){
                        console.log(err.message);
                    }else{
                        const newRow1=new TableModel1({
                            receiver_id:ra_id,
                            receiver:name,
                            receiver_type:docs[0].ra_type,
                            coins:ra_r_coin,
                            transaction_id:dt,
                        })
                        TableModel.addRow(newRow1,(err,d_c)=>{
                            if(err){
                                console.log(err.message);
                            }
                        });
                        return rc.setResponse(res,{
                            success:true,
                            msg:"Coin added",
                            data:doc
                        })
                    }
                })
            }
        }
    })
})

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
        console.log("get byid function run")
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