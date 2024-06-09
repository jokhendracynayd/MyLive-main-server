const TableModelTeenPatti=require('../models/teen_pati/m_game_teen_pati');

cosnt = gameStatus_teenPatti=async(req,res,next)=>{
  TableModelTeenPatti.getDataById(req.params.id,(err,doc)=>{
    if(err){
      res.status(500).json({
        success:false,
        msg:"Internal Server Error"
      });
    }else{
      if(!doc){
        res.status(404).json({
          success:false,
          msg:"Table Not Found"
        });
      }else{
        if(doc.game_status=="endend"||doc.winnerAnnounced=="yes"){
          res.json({
            success:false,
            msg:"This game has ended pls wait",
            data:doc
          });
        }else{
          next();
        }
      }
    }
  })
}


const isWinnerAnnounced=async(req,res,next)=>{
  TableModelTeenPatti.getDataById(req.params.id,(err,doc)=>{
    if(err){
      res.status(500).json({
        success:false,
        msg:"Internal Server Error"
      });
    }else{
      if(!doc){
        res.status(404).json({
          success:false,
          msg:"Table Not Found"
        });
      }else{
        if(doc.winnerAnnounced=="yes"||doc.game_status=="endend"){
          res.json({
            success:true,
            msg:"Winner already decleared",
            data:doc.winnedSeat,
            wining:doc.WiningAmount,
            TopUserWinner:doc.TopUserWinner
          });
        }else if(doc.winnerAnnounced=="no"||doc.game_status=="active"){
          console.log(doc)
          next();
        }
      }
    }
  })
}


module.exports={gameStatus_teenPatti,isWinnerAnnounced};