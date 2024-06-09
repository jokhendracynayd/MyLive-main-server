const TableModelBalance=require('../models/m_user_wallet_balance');
const {transaction}=require('./transaction/update_balance');
const debitBalance=async(req,res,next)=>{
  TableModelBalance.getDataByField({user_id:req.body.user_id},(err,doc)=>{
    if(err){
      res.status(500).json({
        status:false,
        message:"Internal Server Error"
      });
    }else{
      if(!doc){
        res.status(404).json({
          status:false,
          message:"Table Not Found"
        });
      }else{
        if(doc.user_diamond<parseInt(req.body.amount)){
          res.json({
            status:false,
            message:"Insufficient Balance"
          });
        }else{
          let data={
            transaction_type:"debited",
            transaction_amount:parseInt(req.body.amount),
            sender_type:"user",
            sender_id:req.body.user_id,
            receiver_type:"user",
            receiver_id:req.params.id,
            current_balance:doc.user_diamond,
            user_wallet_type_from:"diamonds",
            user_wallet_type_to:"diamonds",
            entity_type:{
              type:"game",
              game_name:"teen_patti",
              game_id:req.params.id
            }
          }
          TableModelBalance.updateRow(doc._id,{user_diamond:doc.user_diamond-parseInt(req.body.amount)},async(err,doc)=>{
            if(err){
              data.transaction_status = "failed";
              await transaction(data).then(data=>{
                res.status(500).json({
                  success:false,
                  msg:"Internal Server Error"
                });
              }).catch(err=>{
                res.status(500).json({
                  success:false,
                  msg:"Internal Server Error"
                });
              })
            }else{
              data.transaction_status = "success";
              await transaction(data).then(data=>{
                next();
              }).catch(err=>{
                res.status(500).json({
                  success:false,
                  msg:"Internal Server Error"
                });
              })
            }
          })
        }
      }
    }
  })
}

module.exports={debitBalance};