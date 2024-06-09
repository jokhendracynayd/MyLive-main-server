const TableModel=require('../models/counter');

async function getNextSequenceValue(){
  return new Promise((resolve,reject)=>{
    TableModel.findOneAndUpdate(
      { count_id: "autoInc" },
      { $inc: { seq: 1 } },
      { new: true },
      (err, doc) => {
        if (err) {
          reject(err);
        } else {
          if(doc==null){
            const newCounter=new TableModel({
              count_id:"autoInc",
              seq:111111
            })
            newCounter.save((err,doc)=>{
              if(err){
                reject(err);
              }else{
                resolve(doc.seq);
              }
            })
          }else{
            resolve(doc.seq);
          }
        }
      }
    );
  })
}

module.exports={getNextSequenceValue};