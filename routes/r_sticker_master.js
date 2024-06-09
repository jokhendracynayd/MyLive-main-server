const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_sticker_master');
const rc = require('../controllers/responseController');
const passport = require("passport");
const mongoose = require('mongoose');


router.post('/create',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        

        const newRow = new TableModel(req.body);
        if (!newRow) {
            return rc.setResponse(res, {
                msg: 'No Data to insert'
            });
        }
        const Today = new Date();
        const dt = Today.getTime() - 132641626720;
        const sticker_id = dt.toString().substring(1, dt.toString().length - 2);
        newRow.sticker_id=sticker_id;
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



router.get('/', async (req, res) => {
    try {
        const data = await TableModel.Table.aggregate([
            {
                $match: {
                    _id: { $ne: mongoose.Types.ObjectId("64f7641ec490ae2fc860cc7b") }
                }
            },
            { $sort: { sticker_price: 1 } }
        ]);
        
        res.json({
            success: true,
            msg: 'All Data Fetched',
            data: data
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});




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