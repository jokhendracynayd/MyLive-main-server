var mongoose=require('mongoose');
const TableName = "otp_gen";

var TableSchema=mongoose.Schema({

    // id: {
    //     type: String,
    // },
    user_id: {
        type: String,
    },
    otp: {
        type: String,
    },
    mobile_email: {
        type: String,
    },
    validity: {
        type: String,
        enum: ['yes', 'no'],
        default: 'yes'
    },
    purpose: {
        type: String,
    },
    created_at: {
        type: String,
    },
    created_by: {
        type: String,
    },
    last_update: {
        type: Date
    },
    delete_status: {
        type: String,
        default: 'no'
    },

});

const Table = module.exports=mongoose.model(TableName,TableSchema);

const OldTable = mongoose.model("old" + TableName, TableSchema);

module.exports.addRow = (newRow, callback) => {
    newRow.created_at = Date.now();
    newRow.save(callback);
};

module.exports.updateRow = (id, newData, callback) => {
    newData.last_update = Date.now();
    console.log(newData);
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
console.log(fieldNames);
    for (let i = 0; i < fieldNames.length; i++) {
        const fieldName = fieldNames[i];
        const fieldValue = fieldValues[i];
        query[fieldName] = fieldValue;
    }
    console.log(query);
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
  
