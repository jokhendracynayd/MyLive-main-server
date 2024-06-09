// Production


const cron=require('node-cron');
const LiveStreamingTableModel = require('../models/m_live_streaming');
const client =require('../config/redis');
const GameProfitTable = require('../models/m_games_profit')
const LiveJoinedUserModel = require('../models/m_live_streaming_joined_users');
const LiveUserOnSeat = require('../models/m_live_streaming_join_user_requests');
const FruitGameModel = require('../models/teen_pati/m_game_fruit');
const TeenPattiGameModel = require('../models/teen_pati/m_game_teen_pati');
//TASK: This cron job will run every 1 hour 
//and will remove all unecessary data from live streaming joined users and live streaming join user requests table

cron.schedule('0 * * * *', async () => {
  let isDeleted = await LiveJoinedUserModel.Table.deleteMany({joined_status:'no'});
  if(isDeleted){
    console.log('Live streaming joined users table data deleted 👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻 successfully!');
  }
  let isDeleted2 = await LiveUserOnSeat.Table.deleteMany({request_accept_status:{$in:['expired','deny','denied','pending']}});
  if(isDeleted2){
    console.log('Live streaming join user requests table data deleted 🐇🐇🐇🐇🐇🐇🐇🐇🐇🐇🐇🐇🐇🐇🐇🐇 successfully!');
  }
  await FruitGameModel.Table.deleteMany({users:{$eq:[]},game_status:'ended'});
  await TeenPattiGameModel.Table.deleteMany({users:{$eq:[]},game_status:'ended'});
});


cron.schedule('0 0 * * *',async()=>{
  const fruitProfit = await client.GET('fruitGameRev');
  const teenPattiGameRev = await client.GET("teenPattiGameRev")
  if(fruitProfit || teenPattiGameRev){
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so we add 1 and pad with '0'
    const date = String(currentDate.getDate()).padStart(2, '0'); // Pad with '0'
    const formattedDate = `${year}-${month}-${date}`;
    const isCreated = await new GameProfitTable({
      date:formattedDate,
      fruit_game_profit:fruitProfit,
      teenPatti_game_profit:teenPattiGameRev
    }).save();
    if(isCreated){
      await client.SET('fruitGameRev',0);
      await client.SET('teenPattiGameRev',0);
      console.log("Profit created successfully!")
      return;
    }
  }
})

function hasNotUpdatedWithinTime(lastUpdate) {
  const currentTime = new Date();
  const millisecondsDifference = currentTime - lastUpdate;
  const secondsDifference = millisecondsDifference / 1000;

  return secondsDifference >120;
}



async function checkLastUpdateAndEnd(data){
  data.forEach(ele=>{
    let lastUpdate = ele.last_update;
    if(hasNotUpdatedWithinTime(lastUpdate)){
      let newData={live_streaming_current_status:'ended',live_streaming_end_time:new Date(),ended_by:'cron'}
      LiveStreamingTableModel.updateRow(ele.id,newData,(err,doc)=>{
        if(err){
          console.log(err.message);
        }else{
          console.log('Live Streaming is ended by corn at',new Date() );
        }
      })
    }
  });
}

cron.schedule('*/30 * * * * *',async()=>{
  let livesData = await LiveStreamingTableModel.Table.find({live_streaming_current_status:'live'},{last_update:1});
  await checkLastUpdateAndEnd(livesData);
  
});


// cron.schedule('*/30 * * * * *',()=>{
//   // console.log('this is scheduler');
//   LiveStreamingTableModel.cronJobStatus((err,doc)=>{
//     if(err){
//       console.log(err.message);
//     }else{
//       checkLastUpdate(doc,(response)=>{
//         // console.log(response)
//       })
//       function checkLastUpdate(data,callback){
//         let count=0;
//         let sendToData=[];
//         data.forEach(ele=>{
//           let date1=new Date();
//           let date2=ele.last_update;
//           date2=new Date(date2)
//           let distance = Math.abs(date1 - date2);
//           const hours = Math.floor(distance / 3600000);
//           distance -= hours * 3600000;
//           const minutes = Math.floor(distance / 60000);
//           distance -= minutes * 60000;
//           const seconds = Math.floor(distance / 1000);
//           if(seconds>=30){
//             let newData={live_streaming_current_status:'ended',live_streaming_end_time:new Date(),ended_by:'cron'}
//             LiveStreamingTableModel.updateRow(ele.id,newData,(err,doc)=>{
//               if(err){
//                 console.log(err.message);
//               }else{
//                 console.log('Live Streaming is ended by corn at',new Date() );
//                 // console.log(doc)
//               }
//             }) 
//           }
//           sendToData.push(ele.last_update);
//           count++;
//           if(data.length==count){
//             callback(sendToData);
//           }
//         })
//       }
     
//     }
//   })
// })

