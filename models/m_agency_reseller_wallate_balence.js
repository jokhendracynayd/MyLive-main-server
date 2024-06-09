const { update, after } = require("lodash");
const mongoose = require("mongoose");

const TableName = "reseller_agency_wallet";

const TableSchema = mongoose.Schema({
   
   
    ra_id: {
        type: String,
        required: true,
        trim: true,
        unique:true
    },
    ra_r_coin: {
        type: Number,
        required: true,
        trim: true
    },
    ra_type:{
        type:String,
        required:true,
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
module.exports.Table = Table;
module.exports.addRow = (newRow, callback) => {
    newRow.created_at = Date.now();
    newRow.save(callback);
};

module.exports.updateRow = (id, newData, callback) => {
    newData.last_update = Date.now();
    Table.findByIdAndUpdate(id, { $set: newData }, callback);
};


module.exports.findByFindNameAndUpdate=(query,newData,callback)=>{
    Table.findOneAndUpdate(query,{$set:newData},{new:true},callback);
}


/**
 * 
 * @description this is written by jokhendra
 */

module.exports.findDatabyFiled=(query,callback)=>{
    Table.find({$or:query},callback)

}


module.exports.upadateByfieldName=(fieldName,newData,callback)=>{
    Table.findOneAndUpdate(fieldName,{$set:newData},{new: true},callback)
}


/**
 * 
 * @description this for update the document byfieldname @jokhendra
 */


module.exports.findandupdate=(fillter,update,callback)=>{
    Table.findOneAndUpdate(fillter,update,callback)
}


module.exports.getData = callback => {
    Table.find(callback);
};

module.exports.getDataById = (id, callback) => {
    Table.findById(id, callback);
};

module.exports.getDataByFieldName = (fieldName, fieldValue, callback) => {
    let query = {};
    query[fieldName] = fieldValue;
    Table.findOne(query, callback);
};

module.exports.getDataByField=async(query,callback)=>{
    const data=await Table.find(query,callback);
    // console.log(data);
}

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

