const TableProfitModel = require('../models/m_games_profit')

const client =require('../config/redis');
const profitController = async(req,res)=>{
  const {type} = req.params;
  let profitData;
  if(type === 'fruit' && type ){
    // profitData = await TableProfitModel.find({},{_id:0,fruit_game_profit:1,date:1}).sort({_id:-1});
    profitData = await TableProfitModel.aggregate([
      {
        $project:{
          _id:0,
          profit: "$fruit_game_profit",
          date:1
        }
      },
      {
        $sort:{
          _id:-1
        }
      }
    ])
  
  }if(type === 'teenPatti' && type ){
    profitData = await TableProfitModel.aggregate([
      {
        $project:{
          _id:0,
          profit: "$teenPatti_game_profit",
          date:1
        }
      },
      {
        $sort:{
          _id:-1
        }
      }
    ])
  }
  if(type === 'greedy' && type ){
    profitData = await TableProfitModel.aggregate([
      {
        $project:{
          _id:0,
          profit: "$greedy_game_profit",
          date:1
        }
      },
      {
        $sort:{
          _id:-1
        }
      }
    ])
  }
  return res.json({
    success:true,
    data:profitData
  })

}

const currentGameProfit = async(req,res)=>{
  const fruitProfit = await client.get('fruitGameRev');
  const teenPattiGameRev = await client.get("teenPattiGameRev");
  const greedyGameRev = await client.get("greedyGameRev");
  return res.json({
    success:true,
    data:{
      fruitProfit:fruitProfit || 0,
      teenPattiGameRev:teenPattiGameRev || 0,
      greedyGameRev:greedyGameRev || 0
    }
  })
}

module.exports = {
  profitController,
  currentGameProfit
}