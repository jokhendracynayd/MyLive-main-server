const mongoose = require("mongoose");
const UserLoginTableModel=require('./m_user_login')
const TableName = "comments";
const TableSchema = mongoose.Schema({

    comment_type: {
        type: String,
        enum: ['live_streaming', 'audio_party']
    },
    comment_desc: {
        type: String,
    },
    comment_entity_id: {
        type: String,
    },
    comment_by_user_id: {
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
module.exports.getUsername=(fieldNames,fieldValues,callback)=>{

    let query = {};
    for (let i = 0; i < fieldNames.length; i++) {
        const fieldName = fieldNames[i];
        const fieldValue = fieldValues[i];
        query[fieldName] = fieldValue;
    }
    Table.aggregate([
        { $match:query},
        {
        $lookup:{
            from:'user_logins',
            localField:'comment_by_user_id',
            foreignField:'username',
            as:'userDetails'
        }
    }],callback)

}

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

