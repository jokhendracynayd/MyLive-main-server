const express = require('express');
const router = express.Router();
const TableModel = require('../../models/teen_pati/m_game_fruit');
const TableBalance=require('../../models/m_user_wallet_balance');
const rc = require('../../controllers/responseController');
const passport = require("passport");
const {uniqueUserCheck,response}=require('../../utilis/userCheck');
const nodeCache=require('node-cache');
const client =require('../../config/redis');
const {updateBalance,creditBalance}=require('../../controllers/transaction/update_balance');
const {createBulfeAmount}=require('../../utilis/bulfe_value');
const {boat_generate}=require('../../utilis/boat_generate');
const axios=require('axios');
const api=require('../../config/api');
const crypto=require('crypto');
const ObjectId = require('mongoose').Types.ObjectId;
const { parse } = require('querystring'); 
const mongoose=require('mongoose');
const isValidObjectId=require('mongoose').isValidObjectId;
const TransactionModel=require('../../models/m_transaction');
const { promisify } = require('util');

const getAsync = promisify(client.get).bind(client);

// development server

async function check_active_game_and_end() {
  try {
    const docs = await TableModel.Table.find({game_status:"active"});
    for (const doc of docs) {
      const isExist = await client.GET(`${doc._id}`);
      if (isExist === null) {
        try {
          await axios.get(`${api.Api}/fruit-game/winner-announcement/${doc._id}`);
        } catch (error) {
          console.log(error);
        }
      }
    }
  } catch (err) {
    console.log(err.message);
  }
}

router.get('/create', async (req, res) => {
  try {
    // const teen_patti_game = await getAsync("fruit_game");
    const teen_patti_game = await client.GET("fruit_game");
    if (teen_patti_game === null) {
      const Today = new Date();
      const dt = Today.getTime() - 132641626720;
      const game_id = dt.toString().substring(1, dt.toString().length - 2);
      const newRow =await new TableModel({
        game_id: game_id,
      });
      // console.log(newRow)
      const doc = await newRow.save();
      await Promise.all([
        client.SETEX(`${doc._id}`, 28, JSON.stringify(doc)),
        client.SETEX("fruit_game", 23, JSON.stringify(doc))
      ]);

      res.json({
        success: true,
        msg: "Game created",
        data: doc
      });

      check_active_game_and_end();
    } else {
      const ttl = await client.TTL("fruit_game");
      if (ttl >= 13) {
        const docs = await TableModel.Table.findOne({game_status:"active"},{game_last_count:1});
        res.json({
          success: true,
          msg: "Game already created",
          data: docs
        });

        check_active_game_and_end();
      } else {
        res.json({
          success: false,
          msg: "Game already created but time is less than 15 sec",
          wait_time: ttl
        });

        check_active_game_and_end();
      }
    }
  } catch (err) {
    return res.json({
      success: false,
      msg: err.message
    });
  }
});



// async function check_active_game_and_end(){
//   TableModel.getDataByFieldName("game_status","active",(err,docs)=>{
//     if(err){
//       console.log(err.message)
//     }else{
//       if(docs.length>0){
//         docs.forEach(async(doc)=>{
//           const isExist=await client.GET(`${doc._id}`);
//           if(isExist==null){
//            try {
//             await axios.get(`${api.Api}/fruit-game/winner-announcement/`+doc._id)
//            } catch (error) {
//             console.log(error)
//            }
//           }
//         })
//       }
//     }
//   })
// }

// router.get('/create',async(req,res)=>{
  
//  const teen_patti_game=await client.GET("fruit_game");
//  if(teen_patti_game==null){
//   var dt;
//   Today = new Date();
//   dt = Today.getTime();
//   dt = dt-132641626720;
//   var shortNumber = dt+"";
//   game_id = shortNumber.substring(1, shortNumber.length-2);
//   const newRow = new TableModel({
//     game_id:game_id,
//   });
//   TableModel.addRow(newRow,async(err,doc)=>{
//     if(err){
//       return res.json({
//         success:false,
//         msg:err.message
//       })
//     }else{
//       await client.SETEX(`${doc._id}`,28,JSON.stringify(doc));
//       await client.SETEX("fruit_game",23,JSON.stringify(doc));
//       res.json({
//         success:true,
//         msg:"Game created",
//         data:doc
//       })
//       check_active_game_and_end();
//     }
//   })
 
//  }else{
//   const ttl=await client.TTL("fruit_game");
//   if(ttl>=13){
//     TableModel.getData("game_status","active",(err,docs)=>{
//       if(err){
//         console.log(err.message)
//       }else{
//         res.json({
//           success:true,
//           msg:"Game already created",
//           data:docs
//         })
//       }
//     })
//     check_active_game_and_end();
//   }else{
//     res.json({
//     success:false,
//     msg:"Game already created but time is less than 15 sec",
//     wait_time:ttl
//    })
//    check_active_game_and_end();
//   }
//  }
// })

router.get('/',
    (req, res) => {
        TableModel.getData((err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
              // console.log(docs)
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
              if(doc==null){
                return res.json({
                  success:true,
                  msg:"No data found"
                })
              }
              let bulfe=[5240,63584,20324]
              doc.seat.A_total_amount=doc.seat.A_total_amount+bulfe[0];
              doc.seat.B_total_amount=doc.seat.B_total_amount+bulfe[1];
              doc.seat.C_total_amount=doc.seat.C_total_amount+bulfe[2];
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
                return res.json({
                  success:false,
                  msg:"No data found"
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

router.get('/ended/:id',(req,res)=>{
    const id=req.params.id;
    console.log(id);
    TableModel.updateOneField(id,{game_status:'ended'},(err,doc)=>{
      if(err){
        console.log(err.message);
      }else{
        if(doc==null){
          res.json({
            success:true,
            msg:"No data found"
          })
        }
        res.json({
          success:true,
          msg:"Data update",
          data:doc,
        })
      }
    })
})


// TODO:


async function helper(req,res,doc,rc,winner,newRC,rc_on_port_a,rc_on_port_b,rc_on_port_c){
  if(rc_on_port_a>0 && rc_on_port_b>0 && rc_on_port_c>0){
    if(rc_on_port_a<rc_on_port_b && rc_on_port_a<rc_on_port_c){
      winner="A";
      newRC=rc_on_port_a;
    }else if(rc_on_port_b<rc_on_port_a && rc_on_port_b<rc_on_port_c){
      winner="B";
      newRC=rc_on_port_b;
    }else{
      winner="C";
      newRC=rc_on_port_c;
    }
  }else if(rc_on_port_a<0 && rc_on_port_b<0 && rc_on_port_c<0){
    if(rc_on_port_a>rc_on_port_b && rc_on_port_a>rc_on_port_c){
      winner="A";
      newRC=rc_on_port_a;
    }else if(rc_on_port_b>rc_on_port_a && rc_on_port_b>rc_on_port_c){
      winner="B";
      newRC=rc_on_port_b;
    }else{
      winner="C";
      newRC=rc_on_port_c;
    }
  }else if(rc_on_port_a>=0&&rc_on_port_b<=0&&rc_on_port_c<=0){
    winner="A";
    newRC=rc_on_port_a;
  }else if(rc_on_port_a<=0&&rc_on_port_b>=0&&rc_on_port_c<=0){
    winner="B";
    newRC=rc_on_port_b;
  }else if(rc_on_port_a<=0&&rc_on_port_b<=0&&rc_on_port_c>=0){
    winner="C";
    newRC=rc_on_port_c;
  }else if(rc_on_port_a>0&&rc_on_port_b>0&&rc_on_port_c<=0){
    if(rc_on_port_a<rc_on_port_b){
      winner="A";
      newRC=rc_on_port_a;
    }else{
      winner="B";
      newRC=rc_on_port_b;
    }
  }
  else if(rc_on_port_a>0&&rc_on_port_b<=0&&rc_on_port_c>0){
    if(rc_on_port_a<rc_on_port_c){
      winner="A";
      newRC=rc_on_port_a;
    }else{
      winner="C";
      newRC=rc_on_port_c;
    }
  }else if(rc_on_port_a<=0&&rc_on_port_b>0&&rc_on_port_c>0){
    if(rc_on_port_b<rc_on_port_c){
      winner="B";
      newRC=rc_on_port_b;
    }else{
      winner="C";
      newRC=rc_on_port_c;
    }
  }else{
    winner="A";
    newRC=rc_on_port_a;
  }
  if(winner==undefined||newRC==undefined){

//TODO: latter

  }else{
    await client.SET("fruitRC",parseInt(newRC));
    await client.INCRBY("fruitCounter",1)
    let count=0;
    doc.users.forEach(async(ele)=>{
    count++;
    if(ele.seat==winner){
      winnerUser.push(ele);
    }if(doc.users.length==count){
      await creditBalance(winnerUser,winner,id).then(result=>{
        TableModel.updateOneField(id,result,(err,docs)=>{
          if(err){
          return  res.json({
              success:false,
              msg:err.message
            })
          }else{
            return res.json({
              success:true,
              msg:`Winner declared`,
              winnerSeat:winner,
              TopUserWinner:docs.TopUserWinner,
              WiningAmount:docs.WiningAmount,
              data:docs.winnedSeat
            })
          }
        })
      }).catch(err=>{
        return res.json(err)
      })
    }
  })
  }
}

router.get('/new-winner-announcement/:id',(req,res)=>{
  const id=req.params.id;
  if(id!=undefined){
    TableModel.getDataById(id,async(err,doc)=>{
      if(err){
        return res.json({
          success:false,
          msg:err.message
        })
      }else{
        if(doc.winnerAnnounced=="yes"){
          return res.json({
            success:true,
            msg:"Winner already declared",
            data:doc.winnedSeat,
            wining:doc.WiningAmount,
            TopUserWinner:doc.TopUserWinner
          })
        }else if(doc.winnerAnnounced=="no"){
          let winnerUser=[];
          let total_bidding = doc.seat.A_total_amount+doc.seat.B_total_amount+doc.seat.C_total_amount;
          let winner;
          if(doc.user.length==0){
            let luck=['A','B','C'];
            winner=luck[Math.floor(Math.random() * 3)];
            await boat_generate(winner).then(result=>{
              TableModel.updateOneField(id,result,(err,doc)=>{
                if(err){
                  return res.json({
                    success:false,
                    msg:err.message
                  })
                }else{
                  return res.json({
                    success:true,
                    msg:"Winner declared",
                    winnerSeat:winner,
                    data:doc.winnedSeat,
                    wining:doc.WiningAmount,
                    TopUserWinner:doc.TopUserWinner
                  })
                }
              })
            }) 
          }else{
            if(await client.EXISTS("fruitRC")){
              // if key is exists
              let rc= await client.GET("fruitRC");
              let counter=await client.GET("fruitCounter");
              let newRC;
              let A_winning=total_bidding-doc.seat.A_total_amount*3.0;
              let B_winning=total_bidding-doc.seat.B_total_amount*3.0;
              let C_winning=total_bidding-doc.seat.C_total_amount*3.0;
              let rc_on_port_a=parseInt(A_winning) + parseInt(rc);
              let rc_on_port_b=parseInt(B_winning) + parseInt(rc);
              let rc_on_port_c=parseInt(C_winning) + parseInt(rc);

              if(counter>=5){
                // if counter is greater than 5
                if(rc>=0){
                  // if rc is greater than 0
                  if(rc_on_port_a > 0 && rc_on_port_b > 0 && rc_on_port_c > 0){
                    if(rc_on_port_a<rc_on_port_b && rc_on_port_a<rc_on_port_c){
                      winner="A";
                    }else if(rc_on_port_b<rc_on_port_a && rc_on_port_b<rc_on_port_c){
                      winner="B";
                    }else{
                      winner="C";
                    }
                  }else if(rc_on_port_a < 0 && rc_on_port_b<0 &&rc_on_port_c < 0 ){

                    // TODO: latter


                  }else if(rc_on_port_a<0 && rc_on_port_b>0 && rc_on_port_c>0){
                    if(rc_on_port_b<rc_on_port_c){
                      winner="B";
                    }else{
                      winner="C";
                    }
                  }else if(rc_on_port_a>0 && rc_on_port_b<0 && rc_on_port_c<0 ){
                    winner="A";
                  }else if(rc_on_port_a<0 && rc_on_port_b>0&& rc_on_port_c<0){
                    winner="B";
                  }else if(rc_on_port_a>0&& rc_on_port_b<0 && rc_on_port_c>0){
                    if(rc_on_port_a<rc_on_port_c){
                      winner="A";
                    }else{
                      winner="C";
                    }
                  }else if(rc_on_port_a>0&& rc_on_port_b>0 &&rc_on_port_c<0){
                    if(rc_on_port_a<rc_on_port_b){
                      winner="A";
                    }else{  
                      winner="B";
                    }
                  }else if(rc_on_port_a<0&&rc_on_port_b<0&&rc_on_port_c>0){
                    winner="C";
                  }else if(rc_on_port_a==0&&rc_on_port_b==0&&rc_on_port_c==0){
                    let luck=['A','B','C'];
                    winner=luck[Math.floor(Math.random() * 3)];
                  }else if(rc_on_port_a==0&&rc_on_port_b>0&&rc_on_port_c>0){
                    if(rc_on_port_b<rc_on_port_c){
                      winner="B";
                    }else{
                      winner="C";
                    }
                  }else if(rc_on_port_a==0&&rc_on_port_b<0&&rc_on_port_c<0){
                    winner="A";
                  }else if(rc_on_port_a>0&&rc_on_port_b==0&&rc_on_port_c>0){
                    if(rc_on_port_a<rc_on_port_c){
                      winner="A";
                    }else{
                      winner="C";
                    }
                  }else if(rc_on_port_a<0&&rc_on_port_b==0&&rc_on_port_c<0){
                    winner="B";
                  }else if(rc_on_port_a<0&&rc_on_port_b<0&&rc_on_port_c==0){
                    winner="C";
                  }else if(rc_on_port_a>0&&rc_on_port_b>0&&rc_on_port_c==0){
                    if(rc_on_port_a<rc_on_port_b){
                      winner="A";
                    }else{
                      winner="B";
                    }
                  }
                  if(winner==undefined){

                    // TODO: latter

                  }else{
                    await client.SET("fruitRC",0);
                    await client.SET("fruitCounter",0);
                    let count=0;
                    doc.users.forEach(async(ele)=>{
                    count++;
                    if(ele.seat==winner){
                    winnerUser.push(ele);
                    }if(doc.users.length==count){
                    await creditBalance(winnerUser,winner,id).then(result=>{
                    TableModel.updateOneField(id,result,(err,docs)=>{
                    if(err){
                      return res.json({
                        success:false,
                        msg:err.message
                      })
                    }else{
                      return res.json({
                        success:true,
                        msg:`Winner declared`,
                        winnerSeat:winner,
                        TopUserWinner:docs.TopUserWinner,
                        WiningAmount:docs.WiningAmount,
                        data:docs.winnedSeat
                      })
                    }
                  })
                }).catch(err=>{
                  return res.json(err)
                  })
                  }
                })
                }  
                }else{
                  // if rc is less than 0
                  if(A_winning>=B_winning && A_winning>=C_winning){
                    winner="A";
                    newRC=rc_on_port_a;
                  }else if(B_winning>=C_winning && B_winning>=A_winning){
                    winner="B";
                    newRC=rc_on_port_b;
                  }else{
                    winner="C";
                    newRC=rc_on_port_c;
                  }
                  if(winner==undefined||newRC==undefined){
                    //TODO: latter
                  }else{
                    await client.SET("fruitRC",parseInt(newRC));
                    await client.INCRBY("fruitCounter",1)
                    let count=0;
                    doc.users.forEach(async(ele)=>{
                    count++;
                    if(ele.seat==winner){
                      winnerUser.push(ele);
                    }if(doc.users.length==count){
                      await creditBalance(winnerUser,winner,id).then(result=>{
                        TableModel.updateOneField(id,result,(err,docs)=>{
                          if(err){
                          return  res.json({
                              success:false,
                              msg:err.message
                            })
                          }else{
                            return res.json({
                              success:true,
                              msg:`Winner declared`,
                              winnerSeat:winner,
                              TopUserWinner:docs.TopUserWinner,
                              WiningAmount:docs.WiningAmount,
                              data:docs.winnedSeat
                            })
                          }
                        })
                      }).catch(err=>{
                        return res.json(err)
                      })
                    }
                  })
                  }
                }
                }else{
                // if counter is less than 5
                         
                if(rc>=0){
                  // if rc is greater than 0
                  
                }else if(rc<0){
                  // if rc is less than 0
                }
              }
            }else{
              // if key is not exists
              let luck=['A','B','C'];
              winner=luck[Math.floor(Math.random() * 3)];
              let count=0;
              let total_winning=0;
              if(winner=="A"){
              total_winning=doc.seat.A_total_amount*3.0;
              }else if(winner=='B'){
                total_winning=doc.seat.B_total_amount*3.0;
              }else{
                total_winning=doc.seat.C_total_amount*3.0;
              }
              let rc=total_bidding-total_winning;
              await client.SET("fruitRC",parseInt(rc));
              await client.SET("fruitCounter",1);
              doc.users.forEach(async(ele)=>{
              count++;
              if(ele.seat==winner){
                winnerUser.push(ele);
              }if(doc.users.length==count){
                await creditBalance(winnerUser,winner,id).then(result=>{
                  TableModel.updateOneField(id,result,(err,docs)=>{
                    if(err){
                      return res.json({
                      success:false,
                      msg:err.message
                      })
                    }else{
                      return res.json({
                        success:true,
                        msg:`Winner declared`,
                        winnerSeat:winner,
                        TopUserWinner:docs.TopUserWinner,
                        WiningAmount:docs.WiningAmount,
                        data:docs.winnedSeat
                      })
                    }
                  })
                  }).catch(err=>{
                  return res.json(err)
                  })
                }
              })
            }
          }
        }
      }
    })
  }else{
    return res.json({
      success:false,
      msg:"Please provide id"
    })
  }
})

router.get('/winner-announcement/:id',(req,res)=>{
  const id=req.params.id;
  TableModel.getDataById(id,async(err,doc)=>{
    if(err){
      return res.json({
        success:false,
        msg:err.message
      })
    }else{
      if(doc.winnerAnnounced=="yes"){
        return res.json({
          success:true,
          msg:"Winner already declared",
          data:doc.winnedSeat,
          wining:doc.WiningAmount,
          TopUserWinner:doc.TopUserWinner
        })
      }else if(doc.winnerAnnounced=="no"){
        let winnerUser=[];
        let a=doc.seat.A_total_amount;
        let b=doc.seat.B_total_amount;
        let c=doc.seat.C_total_amount;
        let winner;
        if(doc.users.length==0){
          let luck=['A','B','C'];
          winner=luck[Math.floor(Math.random() * 3)];
          await boat_generate(winner).then(result=>{
            TableModel.updateOneField(id,result,(err,doc)=>{
              if(err){
                return res.json({
                  success:false,
                  msg:err.message
                })
              }else{
                return res.json({
                  success:true,
                  msg:"Winner declared",
                  winnerSeat:winner,
                  data:doc.winnedSeat,
                  wining:doc.WiningAmount,
                  TopUserWinner:doc.TopUserWinner
                })
              }
            })
          })
        }else{
          // check key is exists or not
          if(await client.EXISTS("fruitRC")){
            // if key is exists
           let rc= await client.GET("fruitRC");
           let counter=await client.GET("fruitCounter");
           if(counter>=8){
             if(rc>0){
              let newRC;
              let total_bidding = doc.seat.A_total_amount+doc.seat.B_total_amount+doc.seat.C_total_amount;
              let A_winning=total_bidding-doc.seat.A_total_amount*3.0;
              let B_winning=total_bidding-doc.seat.B_total_amount*3.0;
              let C_winning=total_bidding-doc.seat.C_total_amount*3.0;
              let rc_on_port_a=parseInt(A_winning) + parseInt(rc);
              let rc_on_port_b=parseInt(B_winning) + parseInt(rc);
              let rc_on_port_c=parseInt(C_winning) + parseInt(rc);
              console.log("this is line number 301 👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻")
              if(rc_on_port_a>=0 && rc_on_port_b>=0 && rc_on_port_c>=0){
                if(rc_on_port_a<=rc_on_port_b && rc_on_port_a<=rc_on_port_c){
                  newRC=rc_on_port_a;
                  winner="A";
                }else if(rc_on_port_b<=rc_on_port_a && rc_on_port_b<=rc_on_port_c){
                  newRC=rc_on_port_b;
                  winner="B";
                }else{
                  newRC=rc_on_port_c;
                  winner="C";
                }
              }else if(rc_on_port_a<=0&&rc_on_port_b>=0&&rc_on_port_c>=0){
                if(rc_on_port_b<=rc_on_port_c){
                  newRC=rc_on_port_b;
                  winner="B";
                }else{
                  newRC=rc_on_port_c;
                  winner="C";
                }
              }else if(rc_on_port_b<=0&&rc_on_port_a>=0&&rc_on_port_c>=0){
                if(rc_on_port_a<=rc_on_port_c){
                  newRC=rc_on_port_a;
                  winner="A";
                }else{
                  newRC=rc_on_port_c;
                  winner="C";
                }
              }else if(rc_on_port_c<=0&&rc_on_port_a>=0&&rc_on_port_b>=0){
                if(rc_on_port_b<=rc_on_port_a){
                  newRC=rc_on_port_b;
                  winner="B";
                }else{
                  newRC=rc_on_port_a;
                  winner="A";
                }
              }else if(rc_on_port_a<=0&&rc_on_port_b<=0&&rc_on_port_c<=0){
                if(rc_on_port_a>=rc_on_port_b&&rc_on_port_a>=rc_on_port_c){
                  newRC=rc_on_port_a;
                  winner="A";
                }else if(rc_on_port_b>=rc_on_port_c&&rc_on_port_b>=rc_on_port_a){
                  newRC=rc_on_port_b;
                  winner="B";
                }else{
                  newRC=rc_on_port_c;
                  winner="C";
                }
              }
              if(winner==undefined){
                // let luck=['A','B','C'];
                winner="A";
                newRC=rc_on_port_a;
              }
              await client.INCRBY("fruitGameRev",parseInt(newRC));
              await client.SET("fruitRC",0);
              await client.SET("fruitCounter",0);
              let count=0;
              doc.users.forEach(async(ele)=>{
              count++;
              if(ele.seat==winner){
                winnerUser.push(ele);
              }if(doc.users.length==count){
                await creditBalance(winnerUser,winner,id).then(result=>{
                  TableModel.updateOneField(id,result,(err,docs)=>{
                    if(err){
                      return res.json({
                        success:false,
                        msg:err.message
                      })
                    }else{
                      return res.json({
                        success:true,
                        msg:`Winner declared`,
                        winnerSeat:winner,
                        TopUserWinner:docs.TopUserWinner,
                        WiningAmount:docs.WiningAmount,
                        data:docs.winnedSeat
                      })
                    }
                  })
                }).catch(err=>{
                  return res.json(err)
                })
              }
            })
            }else{
              let newRC;
              let total_bidding = doc.seat.A_total_amount+doc.seat.B_total_amount+doc.seat.C_total_amount;
              let A_winning=total_bidding-doc.seat.A_total_amount*3.0;
              let B_winning=total_bidding-doc.seat.B_total_amount*3.0;
              let C_winning=total_bidding-doc.seat.C_total_amount*3.0;
              let rc_on_port_a=parseInt(A_winning)+parseInt(rc);
              let rc_on_port_b=parseInt(B_winning)+parseInt(rc);
              let rc_on_port_c=parseInt(C_winning)+parseInt(rc);
             console.log("this is line number 377 ���👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻")
              if(A_winning>=B_winning && A_winning>=C_winning){
                winner="A";
                newRC=rc_on_port_a;
              }else if(B_winning>=C_winning && B_winning>=A_winning){
                winner="B";
                newRC=rc_on_port_b;
              }else{
                winner="C";
                newRC=rc_on_port_c;
              }
              if(winner==undefined||newRC==undefined){
                winner="A";
                newRC=rc_on_port_a;
              }
              await client.SET("fruitRC",parseInt(newRC));
              await client.INCRBY("fruitCounter",1)
              let count=0;
              doc.users.forEach(async(ele)=>{
              count++;
              if(ele.seat==winner){
                winnerUser.push(ele);
              }if(doc.users.length==count){
                await creditBalance(winnerUser,winner,id).then(result=>{
                  TableModel.updateOneField(id,result,(err,docs)=>{
                    if(err){
                     return  res.json({
                        success:false,
                        msg:err.message
                      })
                    }else{
                      return res.json({
                        success:true,
                        msg:`Winner declared`,
                        winnerSeat:winner,
                        TopUserWinner:docs.TopUserWinner,
                        WiningAmount:docs.WiningAmount,
                        data:docs.winnedSeat
                      })
                    }
                  })
                }).catch(err=>{
                  return res.json(err)
                })
              }
            })
            }

           }else{
            if(rc==0){
              // if key is exists with value 0
              let luck=['A','B','C'];
              winner=luck[Math.floor(Math.random() * 3)];
              let count=0;
              let total_winning=0;
             let total_bidding = doc.seat.A_total_amount+doc.seat.B_total_amount+doc.seat.C_total_amount;
             if(winner=="A"){
              total_winning=doc.seat.A_total_amount*3.0;
             }else if(winner=='B'){
              total_winning=doc.seat.B_total_amount*3.0;
             }else{
              total_winning=doc.seat.C_total_amount*3.0;
             }
          
             console.log("this is line number 436 ���🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️")
             let rc=parseInt(total_bidding)-parseInt(total_winning);
             await client.SET("fruitRC",parseInt(rc));
             await client.INCRBY("fruitCounter",1)
            doc.users.forEach(async(ele)=>{
              count++;
              if(ele.seat==winner){
                winnerUser.push(ele);
              }if(doc.users.length==count){
                await creditBalance(winnerUser,winner,id).then(result=>{
                  TableModel.updateOneField(id,result,(err,docs)=>{
                    if(err){
                      return res.json({
                        success:false,
                        msg:err.message
                      })
                    }else{
                      return res.json({
                        success:true,
                        msg:`Winner declared`,
                        winnerSeat:winner,
                        TopUserWinner:docs.TopUserWinner,
                        WiningAmount:docs.WiningAmount,
                        data:docs.winnedSeat
                      })
                    }
                  })
                }).catch(err=>{
                  return res.json(err)
                })
              }
            })
             }
             else if(rc>0){
              //if key is exists with positive value
              let newRC;
              let total_bidding = doc.seat.A_total_amount+doc.seat.B_total_amount+doc.seat.C_total_amount;
              let A_winning=total_bidding-doc.seat.A_total_amount*3.0;
              let B_winning=total_bidding-doc.seat.B_total_amount*3.0;
              let C_winning=total_bidding-doc.seat.C_total_amount*3.0;
              let rc_on_port_a=parseInt(A_winning)+parseInt(rc);
              let rc_on_port_b=parseInt(B_winning)+parseInt(rc);
              let rc_on_port_c=parseInt(C_winning)+parseInt(rc);
              console.log("this is line number 479🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️")
              if(rc_on_port_a>=0 && rc_on_port_b>=0 && rc_on_port_c>=0){
                if(rc_on_port_a<=rc_on_port_b && rc_on_port_a<=rc_on_port_c){
                  newRC=rc_on_port_a;
                  winner="A";
                }else if(rc_on_port_b<=rc_on_port_a && rc_on_port_b<=rc_on_port_c){
                  newRC=rc_on_port_b;
                  winner="B";
                }else{
                  newRC=rc_on_port_c;
                  winner="C";
                }
              }else if(rc_on_port_a<=0&&rc_on_port_b>=0&&rc_on_port_c>=0){
                if(rc_on_port_b<=rc_on_port_c){
                  newRC=rc_on_port_b;
                  winner="B";
                }else{
                  newRC=rc_on_port_c;
                  winner="C";
                }
              }else if(rc_on_port_b<=0&&rc_on_port_a>=0&&rc_on_port_c>=0){
                if(rc_on_port_a<=rc_on_port_c){
                  newRC=rc_on_port_a;
                  winner="A";
                }else{
                  newRC=rc_on_port_c;
                  winner="C";
                }
              }else if(rc_on_port_c<=0&&rc_on_port_a>=0&&rc_on_port_b>=0){
                if(rc_on_port_b<=rc_on_port_a){
                  newRC=rc_on_port_b;
                  winner="B";
                }else{
                  newRC=rc_on_port_a;
                  winner="A";
                }
              }else if(rc_on_port_a<=0&&rc_on_port_b<=0&&rc_on_port_c<=0){
                if(rc_on_port_a>=rc_on_port_b&&rc_on_port_a>=rc_on_port_c){
                  newRC=rc_on_port_a;
                  winner="A";
                }else if(rc_on_port_b>=rc_on_port_c&&rc_on_port_b>=rc_on_port_a){
                  newRC=rc_on_port_b;
                  winner="B";
                }else{
                  newRC=rc_on_port_c;
                  winner="C";
                }
              }
              else if(rc_on_port_a<=0&&rc_on_port_b<=0&&rc_on_port_c>=0){
                newRC=rc_on_port_c;
                winner="C";
              }else if(rc_on_port_a<=0&&rc_on_port_b>=0&&rc_on_port_c<=0){
                newRC=rc_on_port_b;
                winner="B";
              }else if(rc_on_port_a>=0&&rc_on_port_b<=0&&rc_on_port_c<=0){
                newRC=rc_on_port_a;
                winner="A";
              }
              if(winner==undefined||newRC==undefined){
                console.log("this is inside the unidefined 604 😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂")
                newRc=rc_on_port_a;
                winner="A"; 
              }
              console.log("this is first condition 538",newRC,winner)

              await client.SET("fruitRC",parseInt(newRC));
              await client.INCRBY("fruitCounter",1);
              let count=0;
              doc.users.forEach(async(ele)=>{
              count++;
              if(ele.seat==winner){
                winnerUser.push(ele);
              }if(doc.users.length==count){
                await creditBalance(winnerUser,winner,id).then(result=>{
                  TableModel.updateOneField(id,result,(err,docs)=>{
                    if(err){
                      return res.json({
                        success:false,
                        msg:err.message
                      })
                    }else{
                     return res.json({
                        success:true,
                        msg:`Winner declared`,
                        winnerSeat:winner,
                        TopUserWinner:docs.TopUserWinner,
                        WiningAmount:docs.WiningAmount,
                        data:docs.winnedSeat
                      })
                    }
                  })
                }).catch(err=>{
                 return res.json(err)
                })
              }
            })
            
             }else if(rc<0){
              // if key is exists with negative value
              let newRC;
              let total_bidding = doc.seat.A_total_amount+doc.seat.B_total_amount+doc.seat.C_total_amount;
              let A_winning=total_bidding-doc.seat.A_total_amount*3.0;
              let B_winning=total_bidding-doc.seat.B_total_amount*3.0;
              let C_winning=total_bidding-doc.seat.C_total_amount*3.0;
              let rc_on_port_a=parseInt(A_winning) +parseInt(rc);
              let rc_on_port_b=parseInt(B_winning) +parseInt(rc);
              let rc_on_port_c=parseInt(C_winning) +parseInt(rc);
             console.log("this is line number 581 ���🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️")
              if(rc_on_port_a<=0 && rc_on_port_b<=0 && rc_on_port_c<=0){
                if(rc_on_port_a>=rc_on_port_b && rc_on_port_a>=rc_on_port_c){
                  newRC=rc_on_port_a;
                  winner="A";
                }else if(rc_on_port_b>=rc_on_port_a && rc_on_port_b>=rc_on_port_c){
                  newRC=rc_on_port_b;
                  winner="B";
                }else{
                  newRC=rc_on_port_c;
                  winner="C";
                }
              }else if(rc_on_port_a>=0 && rc_on_port_b>=0 && rc_on_port_c>=0){
                if(rc_on_port_a<=rc_on_port_b && rc_on_port_a<=rc_on_port_c){
                  newRC=rc_on_port_a;
                  winner="A";
                }else if(rc_on_port_b<=rc_on_port_a && rc_on_port_b<=rc_on_port_c){
                  newRC=rc_on_port_b;
                  winner="B";
                }else{
                  winner="C";
                }
              }
              else if(rc_on_port_a>=0&&rc_on_port_b<=0 && rc_on_port_c<=0){
                newRC=rc_on_port_a;
                winner="A";
              }else if(rc_on_port_b>=0 &&rc_on_port_a<=0 && rc_on_port_c<=0){
                newRC=rc_on_port_b;
                winner="B";
              }else if(rc_on_port_c>=0 && rc_on_port_a<=0 && rc_on_port_b<=0){
                newRC=rc_on_port_c;
                winner="C";
              }else if(rc_on_port_a<=0 && rc_on_port_b>=0 && rc_on_port_c>=0){
                if(rc_on_port_b<=rc_on_port_c){
                  newRC=rc_on_port_b;
                  winner="B";
                }else{
                  newRC=rc_on_port_c;
                  winner="C";
                }
              }else if(rc_on_port_b<=0 && rc_on_port_a>=0 && rc_on_port_c>=0){
                if(rc_on_port_a<=rc_on_port_c){
                  newRC=rc_on_port_a;
                  winner="A";
                }else{
                  newRC=rc_on_port_c;
                  winner="C";
                }
              }else if(rc_on_port_c<=0 && rc_on_port_a>=0 && rc_on_port_b>=0){
                if(rc_on_port_a<=rc_on_port_b){
                  newRC=rc_on_port_a;
                  winner="A";
                }else{
                  newRC=rc_on_port_b;
                  winner="B";
                }
              }
              if(winner==undefined||newRC==undefined){
                console.log("this is inside the unidefined 710 😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂")
                newRc=rc_on_port_a;
                winner="A"; 
              }
              console.log("this is second condition 638",newRC,winner)
              await client.SET("fruitRC",parseInt(newRC));
              await client.INCRBY("fruitCounter",1)
              let count=0;
              doc.users.forEach(async(ele)=>{
              count++;
              if(ele.seat==winner){
                winnerUser.push(ele);
              }if(doc.users.length==count){
                await creditBalance(winnerUser,winner,id).then(result=>{
                  TableModel.updateOneField(id,result,(err,docs)=>{
                    if(err){
                      return res.json({
                        success:false,
                        msg:err.message
                      })
                    }else{
                      return res.json({
                        success:true,
                        msg:`Winner declared`,
                        winnerSeat:winner,
                        TopUserWinner:docs.TopUserWinner,
                        WiningAmount:docs.WiningAmount,
                        data:docs.winnedSeat
                      })
                    }
                  })
                }).catch(err=>{
                  return res.json(err)
                })
              }
            })
             }
           }
          }else{
            // if key is not exists
            let luck=['A','B','C'];
            winner=luck[Math.floor(Math.random() * 3)];
            let count=0;
            let total_winning=0;
           let total_bidding = doc.seat.A_total_amount+doc.seat.B_total_amount+doc.seat.C_total_amount;
           if(winner=="A"){
            total_winning=doc.seat.A_total_amount*3.0;
           }else if(winner=='B'){
            total_winning=doc.seat.B_total_amount*3.0;
           }else{
            total_winning=doc.seat.C_total_amount*3.0;
           }
           let rc=total_bidding-total_winning;
           await client.SET("fruitRC",parseInt(rc));
           await client.SET("fruitCounter",1);
          doc.users.forEach(async(ele)=>{
            count++;
            if(ele.seat==winner){
              winnerUser.push(ele);
            }if(doc.users.length==count){
              await creditBalance(winnerUser,winner,id).then(result=>{
                TableModel.updateOneField(id,result,(err,docs)=>{
                  if(err){
                    return res.json({
                      success:false,
                      msg:err.message
                    })
                  }else{
                    return res.json({
                      success:true,
                      msg:`Winner declared`,
                      winnerSeat:winner,
                      TopUserWinner:docs.TopUserWinner,
                      WiningAmount:docs.WiningAmount,
                      data:docs.winnedSeat
                    })
                  }
                })
              }).catch(err=>{
                return res.json(err)
              })
            }
          })
          }
        }
      }
    }
  })
})

// router.get('/winner-announcement/:id',(req,res)=>{
//   const id=req.params.id;
//   TableModel.getDataById(id,async(err,doc)=>{
//     if(err){
//       res.json({
//         success:false,
//         msg:err.message
//       })
//     }else{
//       if(doc.winnerAnnounced=="yes"){
//         res.json({
//           success:true,
//           msg:"Winner already declared",
//           data:doc.winnedSeat,
//           wining:doc.WiningAmount,
//           TopUserWinner:doc.TopUserWinner
//         })
//       }else if(doc.winnerAnnounced=="no"){
//         let winnerUser=[];
//         let a=doc.seat.A_total_amount;
//         let b=doc.seat.B_total_amount;
//         let c=doc.seat.C_total_amount;
//         let winner;
//         if(doc.users.length==0){
//           let luck=['A','B','C'];
//           winner=luck[Math.floor(Math.random() * 3)];
//           await boat_generate(winner).then(result=>{
//             TableModel.updateOneField(id,result,(err,doc)=>{
//               if(err){
//                 res.json({
//                   success:false,
//                   msg:err.message
//                 })
//               }else{
//                 res.json({
//                   success:true,
//                   msg:"Winner declared",
//                   winnerSeat:winner,
//                   data:doc.winnedSeat,
//                   wining:doc.WiningAmount,
//                   TopUserWinner:doc.TopUserWinner
//                 })
//               }
//             })
//           })
//         }else{
//           if(await client.EXISTS("rc")){

//           }
//           let count=0;
//           doc.users.forEach(async(ele)=>{
//             totalFruitBidingAmount+=Number(ele.amount);
//             count++;
//             if(ele.seat==winner){
//               winnerUser.push(ele);
//             }if(doc.users.length==count){
//               await creditBalance(winnerUser,winner,id).then(result=>{
//                 TableModel.updateOneField(id,result,(err,docs)=>{
//                   if(err){
//                     res.json({
//                       success:false,
//                       msg:err.message
//                     })
//                   }else{
//                     res.json({
//                       success:true,
//                       msg:`Winner declared`,
//                       winnerSeat:winner,
//                       TopUserWinner:docs.TopUserWinner,
//                       WiningAmount:docs.WiningAmount,
//                       data:docs.winnedSeat
//                     })
//                   }
//                 })
//               }).catch(err=>{
//                 res.json(err)
//               })
//             }
//           })
//         }
//       }
//     }
//   })
// })

// router.get('/winner-announcement/:id',(req,res)=>{
//   const id=req.params.id;
//   TableModel.getDataById(id,(err,doc)=>{
//     if(err){
//       res.json({
//         success:false,
//         msg:err.message
//       })
//     }else{
//       if(doc.winnerAnnounced=="yes"){
//         res.json({
//           success:true,
//           msg:"Winner already decleared",
//           data:doc.winnedSeat,
//           wining:doc.WiningAmount,
//           TopUserWinner:doc.TopUserWinner
//         })
//       }else if(doc.winnerAnnounced=="no"){
//         TableModel.getDataById(id,(err,doc)=>{
//           if(err){
//             console.log(err.message)
//           }else{
//             let winnerUser=[];
//             let a=doc.seat.A_total_amount;
//             let b=doc.seat.B_total_amount;
//             let c=doc.seat.C_total_amount;
//             let winner;
//             if(uniqueUserCheck(doc)){
//               let luck=['A','B','C'];
//               winner=luck[Math.floor(Math.random() * 3)];
//             }
//             else{
//               if(a<=b&&a<=c ){
//                 winner='A';
//               }
//               else if(b<=a&&b<=c){
//                 winner='B';
//               }
//               else{
//                 winner='C';
//               }
//             }
//             function winnerUserBalanceIncrease(data,callback){
//               if(data.length==0){
//                 TableModel.updateOneField(id,{WiningAmount:{"555555": {"WinAmount": 580,"BetAmount": 200}},TopUserWinner:[{"555555":456}],winnedSeat:winner,winnerAnnounced:"yes",game_status:"ended"},(err,doc)=>{
//                         if(err){
//                           console.log(err.message)
//                         }else{
//                           // console.log(doc);
//                         }
//                       })
//                       return res.json({
//                         success:true,
//                         msg:`No user bid on winner seat ${winner}`,
//                         data:winner,
//                         wining: {"555555": {"WinAmount": 580,"BetAmount": 200}},
//                         TopUserWinner:[{"555555":456}]

//                       })
//               }else{   
//               TableModel.updateOneField(id,{winnedSeat:winner,winnerAnnounced:"yes",game_status:"ended"},(err,doc)=>{
//                 if(err){
//                   console.log(err.message)
//                 }else{
//                   // console.log(doc);
//                 }
//               })
//              let count=0;
//              let sendToData={};
//              data.forEach(ele=>{
//             if(`${ele.user_id}` in sendToData){
//             sendToData[`${ele.user_id}`].BetAmount+=Number(ele.amount);
//             sendToData[`${ele.user_id}`].WinAmount+=Number(ele.amount)*2.9;
//             }else{
//               sendToData[`${ele.user_id}`]={BetAmount:Number(ele.amount),WinAmount:Number(ele.amount)*2.9};
//              }
//           TableBalance.findAndUpdateBalance({user_id:ele.user_id},ele.amount*2.9,(err,doc)=>{
//             if(err){
//               console.log(err.message);
//             }else{
//               count++;
//               if(data.length==count){
//                 callback(sendToData)
//               }
//             }
//           })
//         })
//               }
//          }
//             let count=0;
//             if(doc.users.length==0){
//               TableModel.updateOneField(id,{WiningAmount:{"555555": {"WinAmount": 580,"BetAmount": 200}},TopUserWinner:[{"555555":456}],winnedSeat:winner,winnerAnnounced:"yes",game_status:"ended"},(err,doc)=>{
//                 if(err){
//                   console.log(err.message)
//                 }else{
//                   res.json({
//                     success:true,
//                     msg:"this is first Winner Result",
//                     wining:{"555555": {"WinAmount": 580,"BetAmount": 200}},
//                     TopUserWinner:[{"555555":456}],
//                     data:winner
//                   })
//                 }
//               })
//             }
//             doc.users.forEach(ele=>{
//               count++;
//               if(ele.seat==winner){
//                 winnerUser.push(ele);
//               }
//               if(doc.users.length==count){
//                   winnerUserBalanceIncrease(winnerUser,(WiningAmount)=>{
//                     let TopUserWinner=[];
//                     for(let prop in WiningAmount){
//                       let temp={};
//                       temp[prop]=WiningAmount[prop].WinAmount;
//                       TopUserWinner.push(temp);
//                     }
//                     TopUserWinner.sort((a,b)=>{
//                       return b[Object.keys(b)[0]]-a[Object.keys(a)[0]];
//                     })
//                     TopUserWinner=TopUserWinner.slice(0,3);
//                     TableModel.updateOneField(id,{WiningAmount:WiningAmount.length!=0?WiningAmount: {"555555": {"WinAmount": 580,"BetAmount": 200}},TopUserWinner:TopUserWinner.length!=0?TopUserWinner:[{"555555":456}]},(err,doc)=>{
//                       if(err){
//                         console.log(err.message);
//                       }
//                       else{
//                         res.json({
//                           success:true,
//                           msg:"Winner result",
//                           data:winner,
//                           wining:WiningAmount.length!=0?WiningAmount: {"555555": {"WinAmount": 580,"BetAmount": 200}},
//                           TopUserWinner:TopUserWinner.length!=0?TopUserWinner:[{"555555":456}]
//                         })
//                       }
//                     })
                    
//                   })
//               }
//             })
//           }
//         })
//       }
//     }
//   })
// })

router.get('/resulthistory',(req,res)=>{
  TableModel.lastGameResult((err,doc)=>{
    if(err){
      res.json({
        success:false,
        msg:"Not found"
      })
    }else{
      res.json({
        success:true,
        msg:"Data fetch",
        data:doc
      })
    }
  })
})


router.put('/updateSeatAmount/:id', async (req, res) => {


  // console.log("this is inside updateSeatAmount👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍")
  const id = req.params.id;
  const { user_id, amount, seat } = req.body;

  if (id===undefined || user_id === undefined || amount === undefined || seat === undefined) {
    return res.json({
      success: false,
      msg: "Invalid data"
    });
  }

  try {
    const table = await TableModel.Table.findById(id);

    if (!table) {
      return res.json({
        success: false,
        msg: "No data found"
      });
    }
    if (table.game_status === "ended" || table.winnerAnnounced === "yes") {
      return res.json({
        success: false,
        msg: "This game has ended, please wait"
      });
    }

    const tableBalance = await TableBalance.Table.findOne({ user_id });

    if (!tableBalance) {
      return res.json({
        success: false,
        msg: "No data found"
      });
    }

    const userDiamond = tableBalance.user_diamond;

    if (userDiamond < amount) {
      return res.json({
        success: false,
        msg: "Insufficient balance"
      });
    }

    const updateObj = { $push: { users: { user_id, seat, amount } } };

    if (seat === "A") {
      updateObj.$inc = { "seat.A_total_amount": amount };
    } else if (seat === "B") {
      updateObj.$inc = { "seat.B_total_amount": amount };
    } else if (seat === "C") {
      updateObj.$inc = { "seat.C_total_amount": amount };
    }
   
    const updatedBalance = await TableBalance.Table.findByIdAndUpdate(tableBalance._id, { $inc: { user_diamond: -amount } }, { new: true });

    if (!updatedBalance || parseInt(updatedBalance.user_diamond) + parseInt(amount) !== userDiamond) {
      return res.json({
        success: false,
        msg: "Something went wrong"
      });
    }

    const updatedTable = await TableModel.Table.findByIdAndUpdate(id, updateObj, { new: true });

    if (updatedTable) {

      let transaction_id = crypto.randomBytes(16).toString("hex");
        let data={
          transaction_id:transaction_id,
          transaction_type:"debited",
          transaction_amount:amount,
          transaction_status:"success",
          transaction_date:new Date(),
          sender_type:"user",
          receiver_type:"game",
          sender_id:user_id,
          before_tran_balance:userDiamond,
          after_tran_balance:updatedBalance.user_diamond,
          receiver_id:id,
          user_wallet_type_from:"diamonds",
          user_wallet_type_to:"diamonds",
          entity_type:{
            type:"game",
            game_id:id,
            game_name:"fruit"
          }
      }

     const newRow=new TransactionModel(data);
     TransactionModel.addRow(newRow,(err,doc)=>{
      if(err){
        console.log(err.message)
      }else{
        console.log("Transaction added")
      }

     })
      let msg="Amount added successfully";
      return res.json({
        success: true,
        data: updatedTable,
        msg
      });
    } else {
      const creditBalance = await TableBalance.Table.findByIdAndUpdate(tableBalance._id, { $inc: { user_diamond: amount } }, { new: true });
      if (!creditBalance || parseInt(creditBalance.user_diamond) - parseInt(amount) !== userDiamond) {
        return res.json({
          success: false,
          msg: "Something went wrong"
        });
      }
      return res.json({
        success: false,
        msg: "Something went wrong"
      });
    }
  } catch (err) {
    return res.json({
      success: false,
      msg: err.message
    });
  }
});

// router.put('/update/:id',
//     (req, res) => {
//       const id=req.params.id;
//       let updateSeatAmount={}
//       const {user_id,amount,seat}=req.body;
//       TableModel.getDataById(id,(err,doc)=>{
//         if(err){
//           console.log(err.message);
//         }else{
//           if(doc.game_status=="ended" || doc.winnerAnnounced=="yes"){
//             res.json({
//               success:false,
//               msg:"This game has ended pls wait"
//             })
//           }else{
//             TableBalance.getDataByFieldName('user_id',user_id,(err,docss)=>{
//               if(err){
//                 return res.json({
//                   success:false,
//                   msg:err.message,
//                 })
//               }else{
//                 if(docss==null){
//                   return res.json({
//                     success:false,
//                     msg:'user not found',
//                   })
//                 }
//                 if(docss.user_diamond>=amount){
//                   TableModel.getDataById(id,(err,doc)=>{
//                     if(err){
//                       console.log(err.message);
//                     }else{
//                       if(seat=='A'){
//                         updateSeatAmount.A_total_amount=doc.seat.A_total_amount+Number(amount);
//                         updateSeatAmount.B_total_amount=doc.seat.B_total_amount;
//                         updateSeatAmount.C_total_amount=doc.seat.C_total_amount;
//                       }
//                       else if(seat=='B'){
//                         updateSeatAmount.A_total_amount=doc.seat.A_total_amount;
//                         updateSeatAmount.B_total_amount=doc.seat.B_total_amount+Number(amount);
//                         updateSeatAmount.C_total_amount=doc.seat.C_total_amount;
//                       }
//                       else if(seat=='C'){
//                         updateSeatAmount.A_total_amount=doc.seat.A_total_amount;
//                         updateSeatAmount.B_total_amount=doc.seat.B_total_amount;
//                         updateSeatAmount.C_total_amount=doc.seat.C_total_amount+Number(amount);
//                       }
//                       const pushUser={user_id:user_id,seat:seat,amount:amount}
//                       TableBalance.getDataByFieldName("user_id",user_id,(err,doc)=>{
//                         if(err){
            
//                         }else{
//                           let updateBalance=String(Number(doc.user_diamond)-Number(amount))
//                           TableBalance.updateRow(doc._id,{user_diamond:updateBalance},(err,docs)=>{
//                             if(err){
            
//                             }else{
//                               // console.log(docs);
//                             }
//                           })
//                         }
//                       })
//                       TableModel.updateRow(id,updateSeatAmount,pushUser,(err,docs)=>{
//                         if(err){
//                           res.json({
//                             success:false,
//                             msg:err.message,
//                             })
//                         }else{
//                           let bulfe=[5240,63584,20324]
//                           docs.seat.A_total_amount=docs.seat.A_total_amount+bulfe[0];
//                           docs.seat.B_total_amount=docs.seat.B_total_amount+bulfe[1];
//                           docs.seat.C_total_amount=docs.seat.C_total_amount+bulfe[2];
//                           res.json({
//                           success:true,
//                           msg:"Data update",
//                           data:docs
//                         });
//                         }
//                       })
//                     }
//                   })
    
//                 }else{
//                   return res.json({
//                     success:false,
//                     msg:"insufficient diamond",
//                   })
//                 }
//               }
//           })
//           }
//         }
//       })
     
//     }
// );

router.post('/userBid', (req, res) => {
  const { game_id, user_id } = req.body;

  TableModel.getDataById(game_id, (err, docs) => {
    if (err) {
      return res.json({
        success: false,
        msg: err.message
      });
    }

    if (!docs) {
      return res.json({
        success: true,
        msg: "No data found"
      });
    }

    const sendToData = {};
    for (const ele of docs.users) {
      if (ele.user_id === user_id) {
        sendToData[ele.seat] = (sendToData[ele.seat] || 0) + Number(ele.amount);
      }
    }

    res.json(sendToData);
  });
});


module.exports = router;