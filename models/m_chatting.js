const mongoose = require("mongoose");

const TableName = "chatting";

const TableSchema = mongoose.Schema({
   
    
    from_user_id: {
        type: String,
        require:true,
        trim:true,
    },
    to_user_id: {
        type: String,
        require:true,
        trim:true
    },
    to_user_message: {
        type: String,
    },
    read_status: {
        type: String,
        default: 'no'
    },
    created_at: {
        type: String,
    },
    created_by: {
        type: String,
    },
    last_update: {
        type: String,
    },
    delete_status: {
        type: String,
    },
    

});

const Table = (module.exports = mongoose.model(TableName, TableSchema));

const OldTable = mongoose.model("old" + TableName, TableSchema);

module.exports.addRow = (newRow, callback) => {
    var date=new Date();
    var current_time=date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
    newRow.created_at = current_time;
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

