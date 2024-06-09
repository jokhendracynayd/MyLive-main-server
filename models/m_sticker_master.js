const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const TableName = "sticker_master";

const TableSchema = mongoose.Schema({
   
    sticker_id:{
        type:String,
        unique:true,
        require:true,
        trim:true,

    },
    sticker_name: {
        type: String,
        unique: true,
        require:true
    },
    sticker_path: {
        type: String,
        unique: true,
        require:true
    },
    icon_path:{
        type:String,
        unique:true,
        require:true,
    },
    sticker_price: {
        type: Number,
        require:true
    },
    sticker_type: {
        type: String,
        require:true,
        enum: ['events', 'popular', 'luxury', 'emoji', 'privilege', 'backpack','luckygitft']
    },
    last_update: {
        type: String,
    },
    created_at: {
        type: String,
    },
    created_by: {
        type: String,
    },
    delete_status: {
        type: String,
    },
});

const Table = (module.exports = mongoose.model(TableName, TableSchema));

module.exports.Table=Table;

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

module.exports.getData = callback => {
    console.log(callback);
    Table.find(callback);
};

module.exports.getDataById = (id, callback) => {
    Table.findById(id, callback);
};

module.exports.getDataByFieldName = (fieldName, fieldValue, callback) => {
    // console.log(fieldName, fieldValue);
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
                // const dataToDel = new OldTable(doc);
                // // OldTable.insertMany(doc)
                //     .then(val => {
                //         Table.findByIdAndDelete(id, callback);
                //     })
                //     .catch(reason => {
                //         callback(reason, null);
                //     });
                Table.findByIdAndRemove(id,callback);
            }
        }
    });
};

module.exports.getSingleDataByFieldName = (fieldName, fieldValue, callback) => {
    let query = {};
    query[fieldName] = fieldValue;
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
  



module.exports.searchingViaUsernameMobileEmail = ( fieldValue, callback) => {
    Table.find( { $or:[ {'username': { $regex: '.*' + fieldValue + '.*' }}, {'email':fieldValue}, {'mobile':fieldValue} ]}, callback).limit(15);
};
