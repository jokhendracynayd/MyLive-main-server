const mongoose = require("mongoose");

const TableName = "live_streaming";


const UserJoinedOnSeatSchema = new mongoose.Schema({
  onseat_UID: {
    type: String,
    required:true
  },
  onseat_user_details:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user_login'
  },
  request_accept_status: {
    type: String,
    enum: ['pending','accepted','denied', 'expired'],
    default:'pending'
  },
  request_sent_by: {
    type: String,
    enum: ['host','audience'],
  },
  seatNo: {
    type: Number,
  },
  voiceMute:{
    type:Boolean,
    default:false
  },
  videoMute:{
    type:Boolean,
    default:false
  },
  coins:{
    type:Number,
    default:0
  }
  // role:{
  //   type:String,
  //   enum:['audience','broadcast'],
  //   default:'audience'
  // },
  // agora_ud:{
  //   type:String
  // }
},{timestamps:true});

const UserJoinedSchema = new mongoose.Schema({
  joined_user_details:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'user_login'
  },
  joined_times:{
    type:Number,
    default:1
  },
  textMute:{
    type:Boolean,
    default:false
  },
  joined_UID:{
    type:String,
    required:true
  },
  joined_status:{
    type:String,
    enum:["yes","no"],
    default:"yes"
  },
  role:{
    type:String,
    enum:["audience","broadcast"],
    default:"audience"
  },
  kickOut:{
    type:String,
    enum:["yes","no"],
    default:"no"
  },
},{
  timestamps:true
});


const TableSchema = mongoose.Schema({
  UID: {
    type: String,
    required:[true, 'UID is required to create live streaming'],
  },
  live_streaming_channel_id: {
    type: String,
    required:[ true, 'Live streaming channel id is required to create live streaming']
  },
  live_streaming_token: {
    type: String,
  },
  star:{
    type:Number,
    default:0
  },
  backGroundImage:{
    type:String,
    default:"aesthentic_night.jpeg"
  },
  live_streaming_type: {
    type: String,
    enum: ["live_streaming", "live_audio_party"],
    // required:[ true, 'Live streaming type is required' ]
  },
  voiceMute:{
    type:Boolean,
    default:false
  },
  videoMute:{
    type:Boolean,
    default:false
  },
  live_name: {
    type: String,
  },
  live_description: {
    type: String,
  },
  role: {
    type: String,
    enum: ["host", "co-host"],
    default: "host",
  },
  userJoined:[UserJoinedSchema],
  userJoinedOnSeat:[UserJoinedOnSeatSchema],

  live_streaming_start_time: {
    type: Date,
    default: new Date(),
  },
  live_streaming_end_time: {
    type: Date,
  },
  ended_by:{
    enum:["host","admin","system","while creating new live streaming"],
    type:String
  },
  live_streaming_current_status: {
    type: String,
    enum: ["live", "ended"],
    default: "live",
  },
  coins:{
    type:Number,
    default:0,
  },
  agora_ud:{
    type:String,
  },
  last_update: {
    type: Date,
    default: () => new Date(Date.now() + 10000),
  },
},{
  timestamps: {
    createdAt:true, 
    updatedAt: false
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
