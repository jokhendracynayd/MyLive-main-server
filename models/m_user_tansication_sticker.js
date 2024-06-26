const mongoose = require("mongoose");

const TableName = "user_transication_sticker";
const TableSchema = mongoose.Schema({

    host_userId:{
        require:true,
        type:mongoose.Schema.Types.Mixed
    },
    user_id:{
        type:String,
        require:true
    },
    sticker_id:{
        type:String,
        require:true,
    },
    sticker_path:{
        type:String,
        require:true,
    },
    sticker_show_status:{
        type:String,
        default: 'yes',
        require:true,
    }

});


const Table = (module.exports = mongoose.model(TableName, TableSchema));

// const OldTable = mongoose.model("old" + TableName, TableSchema);
module.exports.Table=Table;

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


module.exports.stickerpath = (hostUserId, userId, callback) => {
    // console.log(PrimaryUser, SecondaryUser)


// Table.findOne({host_userId:hostUserId, user_id: userId}, callback);
Table.findOne({host_userId:hostUserId,sticker_show_status: 'yes' }, callback);
};