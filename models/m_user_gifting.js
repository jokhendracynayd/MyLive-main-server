const mongoose = require("mongoose");

const TableName = "user_gifting";

const TableSchema = mongoose.Schema({
   
    user_id: {
        type: String,
        required: true,
        trim: true
    },
    gifting_type: {
        type: String,
        required: true,
        trim: true,
        enum: ['live', 'audio_party', 'direct'],
        default:"live"
    },
    gifting_box_type_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true
    },
    gifting_to_user: {
        type: String,
        required: true,
        trim: true
    },
    livestreaming_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true
    },
    gifting_box_quantity: {
        type: Number,
        required: true,
        trim: true,
        default:1
    },
    role:{
        type:String,
        required:true,
        enum:['host','co-host','user']
    },
    gift_price:{
        type:Number,
    },
    created_at: {
        type: Date,
        default: new Date()
    },
    created_by: {
        type: String,
    },
    last_update: {
        type: Date,
        default: new Date()
    },
    delete_status: {
        type: String,
    },
});

const  Table = (module.exports = mongoose.model(TableName, TableSchema));

const OldTable = mongoose.model("old" + TableName, TableSchema);

module.exports.Table = Table;
module.exports.OldTable = OldTable;

module.exports.addRow = (newRow, callback) => {
    newRow.save(callback);
};

module.exports.updateRow = (id, newData, callback) => {
    newData.last_update = new Date();
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

