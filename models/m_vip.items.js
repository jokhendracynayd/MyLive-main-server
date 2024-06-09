const mongoose = require("mongoose");
const TableName = "vipItem";
const Schema = new mongoose.Schema({  
  name: { 
    type: String, 
    default: "Royal VIP",
    trim: true,
    lowercase: true, 
  },
  item_id:{
    type: Number,
    default: 0,
    trim: true,
    required: true,
  },
  price: { 
    type: Number, 
    default: 0 
  },
  avatar:{
    type: String,
    default: "",
    trim: true,
    lowercase: true,
  },
  avatar_image:{
    type: String,
    default: "",
    trim: true,
    lowercase: true,
  },
  entery_avatar:{
    type: String,
    default: "",
    trim: true,
    lowercase: true,
  },
  entery_avatar_image:{
    type: String,
    default: "",
    trim: true,
    lowercase: true,
  },
},{
  createdAt: 'created_at', 
  updatedAt: 'updated_at'
});

module.exports = mongoose.model(TableName, Schema);