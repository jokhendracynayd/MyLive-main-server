const mongoose = require("mongoose");

const TableName = "user_info";

const TableSchema = mongoose.Schema({
   
    user_id: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    user_first_name: {
        type: String,
        // required: true,
        trim: true
    },
    user_middle_name: {
         type: String,
        // required: true,
        trim: true    
    },
    user_last_name: {
         type: String,
        // required: true,
        trim: true   
     },
    user_nick_name: {
        type: String,
    },
    user_gender: {
        type: String,
        enum: ['male', 'female', 'others']
    },
    user_country: {
        type: String,
    },
    user_alter_mobile: {
        type: Number,
    },
    user_curr_loc_lat: {
        type: String,
    },
    user_mobile_no:{
        type:String,
    },
    user_curr_loc_long: {
        type: String,
    },
    user_profile_pic: {
        type: String,
        default: 'defaultProfileImg.jpg'
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
    Table.findByIdAndUpdate(id, { $set: newData },{new:true}, callback);
};

module.exports.getData = callback => {
    Table.find(callback);
};

module.exports.getDataById = (id, callback) => {
    Table.findById(id, callback);
};

module.exports.getDataByUserId = (id, callback) => {
    Table.findOne({user_id: id}, callback);
    
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

/**
 * custom functions
 */

// function for updating value using user id
module.exports.updateViaUser_idRow = (id, newData, callback) => {
    newData.last_update = Date.now();
    const filter = { user_id: id };


    console.log(newData);
    Table.findOneAndUpdate(filter,newData, callback);
};

module.exports.searchingModelforusername = (fieldName, fieldValue, callback) => {
    let query = {};
    query[fieldName] = fieldValue;
    Table.find(query, callback);

};