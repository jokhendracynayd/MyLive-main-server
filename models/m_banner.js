const mongoose = require("mongoose");

const TableName = "banner";

const TableSchema = mongoose.Schema({
    banner_path:{
        type:String,
        required:true,
    },
    banner_name:{
        type:String
    },
});

const TableModel = mongoose.model(TableName, TableSchema);

module.exports = TableModel;
