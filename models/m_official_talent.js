const mongoose = require("mongoose");

const TableName = "offical_talent";

const TableSchema = mongoose.Schema({
    
    UID: {
        type: String,
        require:true,
        unique: true,
        trim:true,
    },
    real_name: {
        require:true,
        type: String,
        trim:true,
    },
    email: {
        type: String,
        unique: true,
        trim:true,
    },
    IDPicPath: {
        type: String,
    },
    streaming_type:{
        type:String,
        enum:['video','audio','both']
    },
    agencyId: {
        type: String,
        trim:true,
    },
    mobile_no: {
        type: String,
        trim:true
    },
    host_status: {
        type: String,
        enum:['pending','accepted','rejected','deleted'],
        default:"pending"
    },
    created_at: {
        type: Date,
        default: new Date(),
    },
    created_by: {
        type: String,
    },
    last_update: {
        type: Date,
    },
    delete_status: {
        type: Boolean,
        default: false,
    },
});

const Table = (module.exports = mongoose.model(TableName, TableSchema));

const OldTable = mongoose.model("old" + TableName, TableSchema);

module.exports.Table = Table;
module.exports.OldTable = OldTable;

module.exports.addRow = (newRow, callback) => {
    newRow.created_at = new Date();
    newRow.save(callback);
};

module.exports.updateRow = (id, newData, callback) => {
    newData.last_update = new Date();
    Table.findByIdAndUpdate(id, { $set: newData },{new:true}, callback);
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

