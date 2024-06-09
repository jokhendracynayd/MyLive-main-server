const mongoose = require("mongoose");

const TableName = "live_streaming";

const TableSchema = mongoose.Schema({
  user_id: {
    type: String,
    required:true,
  },
  live_streaming_channel_id: {
    type: String,
  },
  live_streaming_token: {
    type: String,
  },
  live_streaming_type: {
    type: String,
    enum: ["live_streaming", "live_audio_party"],
  },
  live_name: {
    type: String,
  },
  live_streaming_start_time: {
    type: Date,
  },
  live_streaming_end_time: {
    type: Date,
  },
  live_streaming_current_status: {
    type: String,
    enum: ["live", "ended"],
  },
  ended_by:{
    type:String
  },
  coins:{
    type:Number,
    default:0,
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
    default: new Date(),
  },
  delete_status: {
    type: String,
  },
  agora_ud:{
    type:String,
  }
});

const Table = (module.exports = mongoose.model(TableName, TableSchema));

module.exports.Table = Table;

const OldTable = mongoose.model("old" + TableName, TableSchema);

module.exports.Table = Table;

module.exports.addRow = (newRow, callback) => {
  newRow.created_at = new Date();
  newRow.last_update=new Date();
  newRow.save(callback);
};

module.exports.updateRow = (id, newData, callback) => {
  newData.last_update=new Date();
  Table.findByIdAndUpdate(id, { $set: newData },{new:true}, callback);
};

module.exports.findAndUpdateCoins=(id,newCoins,callback)=>{
  Table.findByIdAndUpdate(id,{$inc:{coins:newCoins}},{new:true},callback)
}

module.exports.getData = (callback) => {
  Table.find(callback);
};

module.exports.getDataById = (id, callback) => {
  Table.findById(id, callback);
};

module.exports.getSpecificDuration=(user_id,startDay,lastDay,callback)=>{
  Table.find({user_id:user_id,live_streaming_start_time:{$gte:startDay,$lt:lastDay}},callback)
}

module.exports.cronJobStatus=(callback)=>{
  let query={'live_streaming_current_status':'live'};
  Table.find(query,{last_update:1,_id:1},callback)
}

/**
 * @description get coins and duration of a single user
 */

module.exports.getDataForDurationAndCoin=(userId,callback)=>{
  // let query={user_id:userId};  
  Table.aggregate([
    {$match:{user_id:userId,live_streaming_end_time:{ $exists: true }}}
  ],callback)
}

/**
 * 
 * @description get all user live streaming daily bases
 */

module.exports.getDataByFieldName = (fieldName, fieldValue, callback) => {
  let query = {};
  query[fieldName] = fieldValue;
  Table.find(query, callback);
};

module.exports.getDataByFieldNameSort=(fieldName,fieldValue,callback)=>{
  let query={};
  query[fieldName]=fieldValue;
  Table.find(query,callback).sort({"live_streaming_start_time":1,"user_id":1})
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
          .then((val) => {
            Table.findByIdAndDelete(id, callback);
          })
          .catch((reason) => {
            callback(reason, null);
          });
      }
    }
  });
};


module.exports.find_OndAndUpdate = (filter, update, callback) => {
  console.log(filter, update);
  Table.updateMany(filter, update, callback);

};


module.exports.fetchLiveStreamingforHomeScreen = (UserID, callback) => {
  
  let query = {};
  query['live_streaming_current_status'] = 'live';
  Table.find(query, callback);

};
