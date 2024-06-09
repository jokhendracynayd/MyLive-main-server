const mongoose = require("mongoose");

const TableName = "audio_party";

const TableSchema = mongoose.Schema({
   
    
    user_id: {
        type: String,
    },
    live_audio_channel_id: {
        type: String,
    },
    live_audio_token: {
        type: String,
    },
    audio_party_name: {
        type: String,
        required: true,
        trim: true
    },
    audio_party_type: {
        type: String,
        enum: ['live_audio_party', 'live_house']
    },
    // audio_party_link: {
    //      type: String,
    //     required: true,
    //     trim: true    
    // },
    live_audio_start_time: {
        type: String,
    },
    live_audio_end_time: {
        type: String,
    },
    live_audio_current_status: {
        type: String,
        enum: ['live', 'ended']
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

