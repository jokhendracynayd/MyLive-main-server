const mongoose=require('mongoose')

const counterSchema=new mongoose.Schema({
  count_id:{
    type:String,
  },
  seq:{
    type:Number

  }
}) 

const counterModel=mongoose.model('counter',counterSchema);

module.exports=counterModel;