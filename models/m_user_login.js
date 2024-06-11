const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const TableName = "user_login";

const TableSchema = mongoose.Schema({
    UID: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    mobile: {
        type: String,
    },
    gender:{
        type:String,
        enum:['male','female','other']
    },
    Ucoins:{
        type:Number,
        default:0
    },
    Udiamonds:{
        type:Number,
        default:0
    },
    country:{
        type:String,
        default:null
    },
    password: {
        type: String,
    },
    hashPassword: {
        type: String,
    },
    account_create_method: {
        type: String,
        default: 'fill_form_method',
    },
    facebook_token: {
        type: String,
           },
    gmail_token: {
        type: String,
          },
    twitter_token: {
        type: String,
    },
    account_status: {
        type: String,
        enum: ['active', 'un_active'],
        default: 'active'
    },
    live_status: {
        type: String,
    },
    user_profile_pic: {
        type: String,
        default: 'defaultProfileImg.jpg'
    },
    user_nick_name:{
        type:String,
    },
    device_token: {
        type: String,
        default:null
    },
    deviceId:{
        type:String,
        default:null
    },
    device_status:{
        type:String,
        enum:['active','un_active'],
        default:'active'
    },
    
    delete_status: {
        type: Boolean,
        default: false
    },
    status:{
        type:Boolean,
        default:false
    },
    level:{
        type:Number,
        default:0
    },
    vip:{
        type:Number,
        default:0
    },
    is_verified:{
        type:Boolean,
        default:false
    },
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

module.exports.getDataByUserId = (id, callback) => {
    Table.findOne({username: id, status: 'unblock'}, callback);
    
};

module.exports.adminUser=(callback)=>{
    Table.aggregate([{
        $lookup:{
            from:"user_wallet_balances",
            localField:"username",
            foreignField:"user_id",
            as:"common"
        }
    }],callback);
}

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

module.exports.getByIdAndDelete = (id, callback) => {
    Table.findByIdAndRemove(id, callback);
};

module.exports.deleteTableById = (idRemove, callback) => {
    // idRemove=ObjectId.fromString(idRemove);
    // console.log(mongoose.Types.ObjectId.isValid(idRemove));
    Table.findById({_id:idRemove}, (err, doc) => {
        if (err) {
            callback(err, null);
        } else {
            if (!doc) {

                callback(err, doc);
            } else {
                console.log(doc)
                const dataToDel = new OldTable(doc)
                OldTable.insertMany(doc)
                    .then(val => {
                        Table.findByIdAndRemove({_id:idRemove}, callback);
                    })
                    .catch(reason => {
                        callback(reason, null);
                    });
            }
        }
    });
};

module.exports.getSingleDataByFieldName = (fieldName, fieldValue, callback) => {
  let query = {
    [fieldName]: fieldValue,
    status: 'unblock'
  };
  Table.findOne(query, callback);
};


  module.exports.getSingleDataByFieldNames = (fieldNames, fieldValues, callback) => {
    let query = {};
    for (let i = 0; i < fieldNames.length; i++) {
      const fieldName = fieldNames[i];
      const fieldValue = fieldValues[i];
      query[fieldName] = fieldValue;
    }
    Table.findOne(query, callback);
  };
  


// Custom Functions

module.exports.updateLastRoute = (id, url, method, routePath, params, body) => {
    // console.log('hello-' + url);
    Table.findOneAndUpdate({ _id: id }, {
      $set: {
        'lastUrl': {
          server: {
            url: routePath,
            date: Date.now()
          },
          api: {
            url: url,
            type: method,
            params: params,
            body: body,
            date: Date.now()
          }
        }
      }
    }, (err, doc) => {
        console.log(doc.lastUrl);
    });
  };
  
  module.exports.getUserByIdForPassport = (id, callback) => {
    console.log('i am before login tracked');
    Table.findOneAndUpdate({ _id: id }, { $set: { lastRequest: Date.now() } }, (err, doc) => {
      console.log('log in tracked');
    });
    Table.findById(id, callback);
  };
  
  module.exports.comparePassword = (password, hash, callback) => {
    bcrypt.compare(password, hash, (err, isMatch) => {
      if (err) throw err;
      callback(null, isMatch);
    });
  };
  
// function for updating value using user id
module.exports.updateViaUser_idRow = (id, newData, callback) => {
    newData.last_update = Date.now();
    const filter = { username: id };


    console.log(newData);
    Table.findOneAndUpdate(filter,newData, callback);
};



module.exports.searchingViaUsernameMobileEmail = ( fieldValue, callback) => {
    Table.find( { $or:[ {'username': { $regex: '.*' + fieldValue + '.*' },status:'unblock'}, {'email':fieldValue}, {'mobile':fieldValue} ]}, callback).limit(15);
};
