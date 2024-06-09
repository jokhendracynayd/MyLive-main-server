const mongoose = require("mongoose");

const TableName = "purchase_trxn";

const TableSchema = mongoose.Schema({
   
    
    id: {
        type: String,
    },
    user_purchase_id: {
        type: String,
    },
    rech_start_date: {
        type: String,
    },
    rech_close_date: {
        type: Number,
    },
    rech_status: {
        type: String,
    },
    rech_gateway: {
        type: String,
    },
    rech_gateway_id: {
        type: String,
    },
    rech_amount: {
        type: String,
    },
    rech_currency: {
        type: String,
    },
    rech_trxn_bank: {
        type: String,
    },
    rech_trxn_ref_no: {
        type: String,
    },
    rech_trxn_bank_code: {
        type: String,
    },
    rech_trxn_error: {
        type: String,
    },
    rech_trxn_mode: {
        type: String,
    },
    rech_trxn_gateway_key: {
        type: String,
    },
    rech_trxn_message: {
        type: String,
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

