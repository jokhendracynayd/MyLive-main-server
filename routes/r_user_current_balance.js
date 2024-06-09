const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_user_current_balance.js');
const rc = require('../controllers/responseController');
const passport = require("passport");
const authenticate=require('../config/user_auth')


router.post('/create',
    (req, res) => {        
        const newRow = new TableModel(req.body);
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
    passport.authenticate("jwt", { session: false }),
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
    passport.authenticate("jwt", { session: false }),
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