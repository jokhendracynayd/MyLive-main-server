// Production server

const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_live_streaming_joined_users');
const UserTableModelLogin=require('../models/m_user_login')
const rc = require('./../controllers/responseController');
const passport = require("passport");
const CommentModel = require('../models/m_comments');
const authenticate=require('../config/user_auth');
const asyncErrorHandler = require('../utilis/asyncErrorHandler');
const UserJoinedOnSeataModel = require('../models/m_live_streaming_join_user_requests');


router.route('/create').post(asyncErrorHandler(async(req,res)=>{
    const {live_streaming_id,live_streaming_type,live_name,joined_user_id,created_by,joined_status}=req.body;
    const propertiesToCheck = [live_streaming_id, live_streaming_type, live_name, joined_user_id, created_by, joined_status];
    // Check if all properties have data (not undefined, null, or empty string)
    const allPropertiesHaveData = propertiesToCheck.every(property => property !== undefined && property !== null && property !== "");
    if (!allPropertiesHaveData) {
        return res.status(400).json({
            success: false,
            msg: "Please provide all required data"
        });
    }
    // Check if the live streaming id exists
    // I want to first check based on {joined_user_id: joined_user_id, joined_status: "yes"}
    // if exists then update the joined_status to "no" and create a new row
    const query = {
        joined_user_id: joined_user_id,
        joined_status: "yes"
      };
      
      // Create an update operation
    const update = {
        $set: {
          joined_status: "no"
        }
    };
    const isOk = await TableModel.Table.updateMany(query, update);
    if(!isOk){
        return res.status(400).json({
            success: false,
            msg: "Something went wrong"
        });
    }
    const newRow = new TableModel.Table({...req.body, created_at: Date.now()});
    const savedRow = await newRow.save();
    if(!savedRow){
        return res.status(400).json({
            success: false,
            msg: "Something went wrong"
        });
    }
    const newComment = {
        comment_type: "live_streaming",
        comment_desc: "Joined",
        comment_entity_id:live_streaming_id,
        comment_by_user_id: joined_user_id
    }
    const commentToWelcomeUser = new CommentModel(newComment);
    CommentModel.addRow(commentToWelcomeUser, (err, docsss) => {
        if (err) {
            // console.log('error!! user joined is not added');
        } else {
            // console.log('user joined comment is added');
        }
    })
    return res.status(200).json({
        success: true,
        msg: "Data Inserted",
        data: savedRow
    });
}));


router.post(
  "/create",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const userId = req.body.joined_user_id;

    /**
     * dissabling the other live streaming if already running
     */

    const filter = { joined_user_id: userId };
    const update = { joined_status: "no" };
    TableModel.find_OndAndUpdate(filter, update, (err, docs) => {
      if (err) {
        // return rc.setResponse(res, {
        //     msg: err.message
        // })

        console.log("Error!! While ending removing user from live streaming");
      } else {
        
            const newRow = new TableModel(req.body);
            if (!newRow) {
              return rc.setResponse(res, {
                msg: "No Data to insert",
              });
            }
            TableModel.addRow(newRow, (err, doc) => {
              if (err) {
                return rc.setResponse(res, {
                  msg: err.message,
                });
              } else {

                    const newComment = {

                        comment_type: "live_streaming",
                        comment_desc: "Joined",
                        comment_entity_id: req.body.live_streaming_id,
                        comment_by_user_id: userId
                    }


                       
                         const commentToWelcomeUser = new CommentModel(newComment);

                            // inserting data in comment section 
                            CommentModel.addRow(commentToWelcomeUser, (err, docsss) => {
                                if (err) {
                                    console.log('error!! user joined is not added');
                                } else {
                                //    console.log('user joined comment is added');
                                }
                            })



                return rc.setResponse(res, {
                  success: true,
                  msg: "Data Inserted",
                  data: doc,
                });
              }
            });
      }
    });

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
                if(docs.length==0){
                    return rc.setResponse(res,{
                        msg:'No data found'
                    })
                }
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Fetched',
                    data: docs
                });
            }
        })
    }
);

router.post('/userJoinedList',(req,res)=>{
    const fieldNames = req.body.fieldNames;
    const fieldValues = req.body.fieldValues;
    TableModel.getUsernamePic(fieldNames, fieldValues, (err, docs) => {
        if (err) {
            return rc.setResponse(res, {
                msg: err.message
            })
        } else {
            if(docs.length==0){
                res.json({
                    success:false,
                    msg:'No data found'
                })
            }
           else{
           res.json({
            success:true,
            msg:'Data Fetched',
            data:docs
           })
           }
        }
    })
})
    
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
                if(docs.length==0){
                    return rc.setResponse(res,{
                        success:true,
                        msg:"data fetched",
                    })
                }
                setUserName(docs,(response)=>{
                    return rc.setResponse(res,{
                        success:true,
                        msg:'Data Fetched',
                        data:response
                    })
                })
                function setUserName(data,callback){
                    let count=0;
                    let sendToData=[];
                    data.forEach(ele=>{
                        UserTableModelLogin.getDataByFieldName("username",ele.joined_user_id,(err,docss)=>{
                            if(err){
                                console.log(err.message)
                            }else{
                                ele._doc.user_nick_name=docss[0].user_nick_name;
                                ele._doc.user_profile_pic=docss[0].user_profile_pic
                                count++;
                                sendToData.push(ele)
                                if(data.length==count){
                                    callback(sendToData);
                                }   
                            }
                        })
                    })
                }
            }
        })
    }
);

router.post('/updateViauserId/',async(req,res)=>{
    const {fieldNames,fieldValues,kickOut,role}=req.body;
    let newData;
    if(role)newData={role:role};        
    if(kickOut)newData={kickOut:kickOut};
    let live_streaming_id = fieldValues[0];
    let joined_user_id = fieldValues[1];
    const query = {
        live_streaming_id: live_streaming_id,
        $or: [
            { request_by_user_id: joined_user_id },
            { request_to_user_id: joined_user_id },
        ],
    };    
    const isOk = await UserJoinedOnSeataModel.updateMany(query, { joined_status: "expired" });
    TableModel.updateViaUserId(fieldNames,fieldValues,newData,(err,docs)=>{
        if(err){
            return rc.setResponse(res,{
                msg:err.message
            })
        }
        else{
            return rc.setResponse(res,{
                success:true,
                msg:"Data Update",
                data:docs
            })
        }
    })
    // res.send("hello");
})

router.put('/update/:id',
authenticate,
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
 * custom routes
 */


// router for dissabled the live streaming

router.put('/updateViaLiveStreamingID/:id',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {

        TableModel.updateViaUser_idRow(req.params.id, req.body.joineduser ,req.body, (err, docs) => {
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

module.exports = router;