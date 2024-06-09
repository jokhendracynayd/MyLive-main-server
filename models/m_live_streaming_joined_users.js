// Production server

const mongoose = require("mongoose");

const TableName = "live_streaming_joined_users";

const TableSchema = mongoose.Schema({

    live_streaming_id: {
        type: String,
        required:true,
    },
    joined_user_id: {
        type: String,
        required:true,
    },
    joined_status: {
        type: String,
        default:"yes",
    },
    role:{
        type:String,
        enum:['audience','broadcast'],
        default:'audience'
    },
    kickOut: {
        type: String,
        default:"no",
    },
    created_at: {
        type: Date,
    },
    created_by: {
        type: String,
    },
    last_update: {
        type: Date,
    },
    delete_status: {
        type: String,
    },
    mute:{
        type:String,
        default:"false"
      }

});

const Table = (module.exports = mongoose.model(TableName, TableSchema));

const OldTable = mongoose.model("old" + TableName, TableSchema);
module.exports.Table = Table;

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

module.exports.getUsernamePic=(fieldNames,fieldValues,callback)=>{
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
            localField:'joined_user_id',
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

/**
 * custom functions
 */

module.exports.updateViaUserId=(fieldNames,fieldValues,newData,callback)=>{
    let query = {};
    for (let i = 0; i < fieldNames.length; i++) {
        const fieldName = fieldNames[i];
        const fieldValue = fieldValues[i];
        query[fieldName] = fieldValue;
    }    
    // console.log(query);
    const data=Table.findOne({$and:[query]});
    data.updateOne({$set:newData},callback);

}


// function for updating value using user id
module.exports.updateViaUser_idRow = (id, joinedUser, newData, callback) => {
    newData.last_update = Date.now();
    const filter = { live_streaming_id: id, joined_user_id: joinedUser };
    Table.updateMany(filter,newData, callback);
};


module.exports.find_OndAndUpdate = (filter, update, callback) => {
  // newData.last_update = Date.now();
  console.log(filter, update);
  Table.updateMany(filter, update, callback);

  // (filter, update, {
  //     new: true
  //   });
};
