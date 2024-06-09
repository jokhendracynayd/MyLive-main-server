const mongoose = require("mongoose");

const TableName = "reseller_agency_user_tranx";

const TableSchema = mongoose.Schema({
  transaction_id: {
    type: String,
    required: true,
    // unique: true,
  },
  transaction_type: {
    type: String,
    enum: ["credited", "debited","reclaimed"],
    required: true,
  },
  transaction_amount: {
    type: Number,
    required: true,
  },
  transaction_status: {
    type: String,
    enum: ["pending", "success", "failed","refund"],
    required: true,
  },
  transaction_date: {
    type: Date,
    required: true,
  },
  sender_type: {
    type: String,
    enum: ["self","user", "admin","reseller","agency"],
    required: true,
  },
  receiver_type: {
    type: String,
    enum: ["self","user", "admin","reseller","agency","game"],
    required: true,
  },
  sender_id: {
    type: String,
    required: true,
  },
  receiver_id: {
    type: String,
    required: true,
  },
  before_tran_balance: {
    type: Number,
  },
  after_tran_balance: {
    type:Number
  },
  user_wallet_type_from: {
    type: String,
    enum: ["diamonds", "r-coins","coins"],
    required: true,
  },
  user_wallet_type_to: {
    type: String,
    enum: ["diamonds", "r-coins","coins"],
    required: true,
  },
//   entity_type:{
//     type:Object,
//     required:true,
//   },
  last_update: {
    type: Date,
  },
  cause: {
    type: String,
    },

});

const Table = (module.exports = mongoose.model(TableName, TableSchema));
module.exports.Table=Table;
module.exports.addRow = (newRow, callback) => {
    newRow.last_update=new Date();
    newRow.save(callback);
};

module.exports.pagination = (page, limit, callback) => {
  Table.find({})
  .skip(limit * (page - 1))
  .limit(limit)
  .exec(callback);

}

module.exports.updateOneField=(id,newData,callback)=>{
  Table.findByIdAndUpdate(id,{$set:newData},{new:true},callback);
}

module.exports.updateCount=(id,newData,callback)=>{
  Table.findByIdAndUpdate(id,{$set:newData},{new:true},callback);
}

module.exports.getData = callback => {
    Table.find(callback);
};


module.exports.getDataById = (id, callback) => {
    Table.findById(id, callback);
};

module.exports.lastTransactions=(fieldValue,callback)=>{
  Table.find({"sender_id":fieldValue},callback).sort({$natural:-1}).limit(250);
}

module.exports.getDataByFieldName = (fieldName, fieldValue, callback) => {
    let query = {};
    query[fieldName] = fieldValue;
    Table.find(query, callback);
};

module.exports.getDataByFieldNames = (fieldNames, fieldValues, callback) => {
    let query = {};
    for (let i = 0; i < fieldNames.length; i++) {
        const fieldName = fieldNames[i];
        const fieldValue = fieldValues[i];
        query[fieldName] = fieldValue;
    }
    Table.find(query, callback);
};

module.exports.deleteTableById=(id,callback)=>{
   Table.findByIdAndRemove(id,callback);
}





















// const mongoose = require("mongoose");
// const moment=require('moment');

// const TableName = "reseller_agency_user_tranx";


// const TableSchema = mongoose.Schema({
//     receiver_user_id:{
//         type:String,
//         required:true,
//     },
//     receiver_type:{
//         type:String,
//         required:true,
//         trim:true,
//     },
//     sender_id:{
//       type:String,
//       required:true
//     },
//     sender_type:{
//       type:String,
//       enum:['reseller','agency','admin'],
//       required:true
//     },
//     coins:{
//         type:String,
//     },
//     transaction_id:{
//         type:String,
//     },
//     created_at: {
//         type: Date,
//     },
//     created_by: {
//         type: String,
//     },
//     last_update: {
//         type: String,
//     },
//     delete_status: {
//         type: String,
//     },

// });

// const Table = (module.exports = mongoose.model(TableName, TableSchema));

// module.exports.addRow = (newRow, callback) => {
//     newRow.created_at =moment(new Date()).format('YYYY-MM-DD')
//     newRow.save(callback);
// };

// module.exports.updateRow = (id, newData, callback) => {
//     newData.last_update = Date.now();
//     Table.findByIdAndUpdate(id, { $set: newData }, callback);
// };



// /**
//  * 
//  * @description this is written by jokhendra
//  */

// module.exports.findDatabyFiled=(query,callback)=>{
//     Table.find({$or:query},callback)

// }


// module.exports.upadateByfieldName=(fieldName,newData,callback)=>{
//     Table.findOneAndUpdate(fieldName,{$set:newData},{new: true},callback)
// }


// /**
//  * 
//  * @description this for update the document byfieldname @jokhendra
//  */


// module.exports.findandupdate=(fillter,update,callback)=>{
//     Table.findOneAndUpdate(fillter,update,callback)
// }


// module.exports.getData = callback => {
//     Table.find(callback);
// };

// module.exports.getDataById = (id, callback) => {
//     Table.findById(id, callback);
// };

// module.exports.getDataByFieldName = (fieldName, fieldValue, callback) => {
//     let query = {};
//     query[fieldName] = fieldValue;
//     Table.find(query, callback);
// };

// module.exports.getDataByField=async(query,callback)=>{
//     const data=await Table.find(query);
//     console.log(data);
// }

// module.exports.getDataByFieldNames = (fieldNames, fieldValues, callback) => {
//     let query = {};
//     for (let i = 0; i < fieldNames.length; i++) {
//         const fieldName = fieldNames[i];
//         const fieldValue = fieldValues[i];
//         query[fieldName] = fieldValue;
//     }
//     Table.find(query, callback);
// };

// module.exports.deleteTableById = (id, callback) => {
//     Table.findById(id, (err, doc) => {
//         if (err) {
//             callback(err, null);
//         } else {
//             if (!doc) {
//                 callback(err, doc);
//             } else {
//                 const dataToDel = new OldTable(doc);
//                 OldTable.insertMany(doc)
//                     .then(val => {
//                         Table.findByIdAndDelete(id, callback);
//                     })
//                     .catch(reason => {
//                         callback(reason, null);
//                     });
//             }
//         }
//     });
// };

