const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const TableName = "user_current_gifiting_balance";

const TableSchema = mongoose.Schema({
   
    live_streaming_id:{
        type:String,
        unique:true,
        require:true,
        trim:true,

    },
    r_coin_value: {
        type: String,
        require:true
    },
    star_rating: {
        type: String,
        require:true
    },
    last_update: {
        type: String,
    },
    created_at: {
        type: String,
    },
    created_by: {
        type: String,
    },
    delete_status: {
        type: String,
    },
});

const Table = (module.exports = mongoose.model(TableName, TableSchema));

const OldTable = mongoose.model("old" + TableName, TableSchema);

module.exports.Table = Table;

module.exports.addRow = (newRow, callback) => {
    newRow.created_at = Date.now();
    newRow.save(callback);
};

module.exports.updateRow = (id, newData, callback) => {
    newData.last_update = Date.now();
    Table.findByIdAndUpdate(id, { $set: newData }, callback);
};

module.exports.getData = callback => {
    Table.find(callback);
};

module.exports.getDataById = (id, callback) => {
    Table.findById(id, callback);
};

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
  


// Custom Functions

