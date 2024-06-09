const mongoose = require("mongoose");

const TableName = "block_user";

const TableSchema = mongoose.Schema({
   from_user_id:{
    type:String,
    require:true,
   },
   to_user_id:{
    type:String,
    require:true
   },
   status:{
    type:String,
    require:true,
    enum:['block','unblock'],
    default:'block',
   }
   
});

const Table = (module.exports = mongoose.model(TableName, TableSchema));

module.exports.addRow = (newRow, callback) => {
    newRow.created_at = Date.now();
    newRow.save(callback);
};

module.exports.updateRow = (id, newData, callback) => {
    newData.last_update = Date.now();
    Table.findByIdAndUpdate(id, { $set: newData },{new:true}, callback);
};

module.exports.getData = callback => {
    Table.find(callback);
};

module.exports.getDataById = (id, callback) => {
    Table.findById(id, callback);
};

module.exports.blockList=(user_id,status,callback)=>{
    Table.aggregate([{$match:{$and:[{from_user_id:user_id},{status:status}]}
    },
   { $lookup:{
        from:'user_logins',
        localField:'from_user_id',
        foreignField:"username",
        as:"userDetails",
    }}
],callback);
}

module.exports.checkUser=(from_user,to_user,callback)=>{
    Table.aggregate([{$match:{$and:[{from_user_id:from_user},{to_user_id:to_user}]}}],callback)
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

module.exports.deleteTableById = (id, callback) => {
    Table.findById(id, (err, doc) => {
        if (err) {
            callback(err, null);
        } else {
            if (!doc) {
                callback(err, doc);
            } else {
                const dataToDel = new OldTable(doc);
                OldTable.insertMany(doc)
                    .then(val => {
                        Table.findByIdAndDelete(id, callback);
                    })
                    .catch(reason => {
                        callback(reason, null);
                    });
            }
        }
    });
};

module.exports.getSingleDataByFieldName = (fieldName, fieldValue, callback) => {
    let query = {};
    query[fieldName] = fieldValue;
    Table.findOne(query, callback);
  };

module.exports.getSingleDataByFieldNames = (fieldNames, fieldValues, callback) => {
    let query = {};
    for (let i = 0; i < fieldNames.length; i++) {
      const fieldName = fieldNames[i];
      const fieldValue = fieldValues[i];
      query[fieldName] = fieldValue;
    }
    Table.findOne(query, callback);
};
  

