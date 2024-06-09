const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_otp_gen');
const rc = require('./../controllers/responseController');
const passport = require("passport");
// var EmailController = require('./../controllers/emailController');
const sendSms = require("./../controllers/smsController");
const UserLoginModel = require('../models/m_user_login');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/database");

router.post('/create',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        // const newRow = req.body;
        const newRow = new TableModel(req.body);

        const getMail = req.body.mobile_email;
        const getCode = req.body.otp;

        console.log(req.body);
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

                // if the OTP is successfully added in the database, then sending Via mail to user
                var EmailBody = 'Hello User, it looks you forgot password of the Dona Live. Use this code ' + getCode;
               
                // EmailController.sendMailAPI(getMail,'Dona Live Forgot Password',EmailBody);
                
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
    passport.authenticate("jwt", { session: false }),
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
    passport.authenticate("jwt", { session: false }),
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
    passport.authenticate("jwt", { session: false }),
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

        console.log(req.body);
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


/**
 * Custom Routes
 */


 router.put('/ExpireLink/:id',
//  passport.authenticate("jwt", { session: false }),
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





router.post('/sendMobileOTPforLoginAuth',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        // const newRow = req.body;
        const newRow = new TableModel(req.body);

       
        const mobile_email = req.body.mobile_email;
        const getCode = req.body.otp;
        const message = 'Dona Live OTP is ' + getCode;

        console.log(req.body);

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

                // sending sms to mobile
                sendSms(mobile_email, message);
               
                
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Inserted',
                    data: doc
                });

                
            }
        })
    }
);



router.post('/VerifyMobileOTPforLoginAuth/:id',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const fieldNames = req.body.fieldNames;
        const fieldValues = req.body.fieldValues;
        const userId = req.params.id;
        TableModel.getDataByFieldNames(fieldNames, fieldValues, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {

                if(docs[0]){



                // fething the user information
                 /**
                 * if the account is available in the database, then login the user
                 */
                  UserLoginModel.getDataById(userId, (err, user) => {
                    if (err) {
                    res.status(200).json({ success: false, msg: "error occured", err: err });
                    } else {
                        
                        var t_user = {
                            id: user._id,
                            username: user.username,
                            mobile: user.mobile,
                            email: user.email,
                            };
                            const token = jwt.sign(t_user, config.secret, {
                            expiresIn: 604800,
                            });
                            res.status(200).json({
                            success: true,
                            msg: "Welcome " + user.username,
                            token: "JWT " + token,
                            user: t_user,
                            });
                            
                    }
                });

}else{

                        return rc.setResponse(res, {
                            success: false,
                            msg: 'Data Inserted',
                            data: docs
                        });
}
            }
        })

    }
);


module.exports = router;