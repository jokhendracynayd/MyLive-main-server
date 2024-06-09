const mongoose = require("mongoose");

const TableName = "live_streaming_join_user_request";

const TableSchema = mongoose.Schema({
   

    live_streaming_id: {
        type: String,
    },
    request_by_user_id: {
        type: String,
    },
    request_to_user_id: {
        type: String,
    },
    request_accept_status: {
        type: String,
        enum: ['pending','accepted','denied', 'expired']
    },
    request_sent_by: {
        type: String,
        // enum: ['host','audience']
    },
    role:{
        type:String,
        enum:['audience','broadcast'],
        default:'audience'
    },
    mute:{
        type:Boolean,
        default:false
    },
    stream_type:{
        type:String,
        enum:['audioParty','videoLive'],
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
    agora_ud:{
        type:String
    },
    video_mute:{
        type:Boolean,
        default:false
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
    Table.findByIdAndUpdate(id, { $set: newData },{new :true}, callback);
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
            localField:'request_to_user_id',
            foreignField:'username',
            as:'userDetails'
        }
    }],callback) 
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

/**
 * custom functions
 */

// function for updating value using user id



module.exports.updateViaUser_idRow = (id, newData, callback) => {
    newData.last_update = Date.now();
    const filter = { request_by_user_id: id };


    console.log(newData);
    Table.findOneAndUpdate(filter,newData,{new:true}, callback);
};


module.exports.find_OndAndUpdate = (filter, update, callback) => {
 
  console.log(filter, update);
  Table.updateMany(filter, update, callback);

  // (filter, update, {
  //     new: true
  //   });
};


// removing from audioParty Seat
module.exports.removefromSeatbyUserId = (id, callback) => {
 filter = { request_to_user_id :  id, request_accept_status:'accepted' }
 update = { request_accept_status : 'expired' }
  Table.updateMany(filter, update, callback);
};
