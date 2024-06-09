function boat_generate(winner){
   return new Promise((resolve, reject) => {
    let random_user_id=Math.floor(Math.random() * (666666 - 555555 + 1)) + 555555;
    let random_amount=Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;
    if(random_amount>1000&&random_amount<2000){
      random_amount=1000;
    }else if(random_amount>2000&&random_amount<3000){
      random_amount=2000;
   }else if(random_amount>3000&&random_amount<4000){
      random_amount=3000;
    }else if(random_amount>4000&&random_amount<5000){
      random_amount=4000;
    }else if(random_amount>5000&&random_amount<6000){
      random_amount=5000;
    }else if(random_amount>6000&&random_amount<7000){
      random_amount=6000;
    }else if(random_amount>7000&&random_amount<8000){
      random_amount=7000;
    }else if(random_amount>8000&&random_amount<9000){
      random_amount=8000;
    }else if(random_amount>9000&&random_amount<10000){
      random_amount=9000;
    }else if(random_amount>10000&&random_amount<11000){
      random_amount=10000;
    }
    let topWinner={}
    topWinner[random_user_id]=random_amount*3.0;
    let dataToUpdate={};
    let temp={};
    temp[`${random_user_id}`]={"WinAmount":random_amount*3.0,"BetAmount":random_amount};
    dataToUpdate.WiningAmount=temp;
    dataToUpdate.TopUserWinner=[topWinner];
    dataToUpdate.winnedSeat=winner;
    dataToUpdate.winnerAnnounced="yes";
    dataToUpdate.game_status="ended";
    resolve(dataToUpdate);
  })
}

function boat_generate_teen_patti(winner){
  return new Promise((resolve, reject) => {
   let random_user_id=Math.floor(Math.random() * (666666 - 555555 + 1)) + 555555;
   let random_amount=Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;
   if(random_amount>1000&&random_amount<2000){
     random_amount=1000;
   }else if(random_amount>2000&&random_amount<3000){
     random_amount=2000;
  }else if(random_amount>3000&&random_amount<4000){
     random_amount=3000;
   }else if(random_amount>4000&&random_amount<5000){
     random_amount=4000;
   }else if(random_amount>5000&&random_amount<6000){
     random_amount=5000;
   }else if(random_amount>6000&&random_amount<7000){
     random_amount=6000;
   }else if(random_amount>7000&&random_amount<8000){
     random_amount=7000;
   }else if(random_amount>8000&&random_amount<9000){
     random_amount=8000;
   }else if(random_amount>9000&&random_amount<10000){
     random_amount=9000;
   }else if(random_amount>10000&&random_amount<11000){
     random_amount=10000;
   }
   let topWinner={}
   topWinner[random_user_id]=random_amount*3.0;
   let dataToUpdate={};
   let temp={};
   temp[`${random_user_id}`]={"WinAmount":random_amount*2.9,"BetAmount":random_amount};
   dataToUpdate.WiningAmount=temp;
   dataToUpdate.TopUserWinner=[topWinner];
   dataToUpdate.winnedSeat=winner;
   dataToUpdate.winnerAnnounced="yes";
   dataToUpdate.game_status="ended";
   resolve(dataToUpdate);
 })
}
module.exports = {boat_generate,boat_generate_teen_patti};