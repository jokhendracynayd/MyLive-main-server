const mongoose = require('mongoose')

const TableName = 'games_profit';


const TableSchema = new mongoose.Schema({
  fruit_game_profit:{
    type:Number,
    require:[true,"This field required"]
  },
  teenPatti_game_profit:{
    type:Number,
    require:[true,"This field required"]
  },
  greedy_game_profit:{
    type:Number,
    require:[true,"This field required"]
  },
  date:{
    type:String,
  }
})

module.exports = mongoose.model(TableName,TableSchema);
