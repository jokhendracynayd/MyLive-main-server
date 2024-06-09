const mongoose = require("mongoose");
const TableName="Messages";

const MessageSchema = mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    users: Array,
    sender: {
      type: String,
      ref: "User",
      required: true,
    },
    read_status: {
        type: String,
        default: 'no'
    },
    created_by: {
        type: String,
    },
    delete_status: {
        type: String,
    },
    time:{
        type:String,
        default:Date()
    }
  },

  {
    timestamps: true,
  }
);

const Table = (module.exports = mongoose.model(TableName, MessageSchema));


module.exports.findPrimaryUser=(primary_user,callback)=>{
  Table.find({sender:primary_user},callback);
}

