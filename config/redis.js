var {createClient}=require("redis");

var client;
async function redisConnection(){
  try {
   client=createClient();
   await client.connect()
   client.on("connect",()=>{
    console.log("redis server connected successfully!!");
   })
  } catch (error) {
    console.error("something is worng in redis server",error);
  }
}

redisConnection();
module.exports=client