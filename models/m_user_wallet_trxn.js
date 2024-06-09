const mongoose = require("mongoose");

const TableName = "user_wallet_trxn";

const TableSchema = mongoose.Schema({
   

    user_id: {
        type: String,
        required: true,
        trim: true
    },
    // user_wallet_type: {
    //     type: String,
    //     required: true,
    //     enum:['']
    //     trim: true
    // },
    wallet_trxn_mode_id: {
         type: String,
        required: true,
        trim: true    
    },
    wallet_credited_at: {
         type: String,
        required: true,
        trim: true   
     },
     wallet_credited_desc: {
        type: String,
       required: true,
       trim: true   
    },
    wallet_trxn_entity: {
        type: String,
       required: true,
       enum:['gifting', 'real_money_conversion'],
       trim: true   
    },
    wallet_trxn_type: {
        type: String,
       required: true,
       enum:['online', 'offline'],
       trim: true   
    },
    trxn_id: {
        type: String,
       required: true,
       trim: true   
    },

});

const Table = (module.exports = mongoose.model(TableName, TableSchema));

const OldTable = mongoose.model("old" + TableName, TableSchema);

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

