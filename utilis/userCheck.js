const uniqueUserCheck=(data)=>{
  let users=[];
  data.users.forEach(ele=>{
    users.push(ele.user_id);
  })
  let temp=new Set(users);
  if(temp.size==1){
    return 1;
  }else if(temp.size==2){
    return 2;
  }else if(temp.size==3){
    return 3;
  }else if(temp.size==4){
    return 4;
  }else if(temp.size>=5){
    return "more";
  }
}

const response=(WiningAmount,winner,callback)=>{
  let TopUserWinner=[];
  var count=0;
  for(let prop in WiningAmount){
    count++;
    let temp={};
    temp[prop]=WiningAmount[prop].WinAmount;
    TopUserWinner.push(temp);
    TopUserWinner.sort((a,b)=>{
      return b[Object.keys(b)[0]]-a[Object.keys(a)[0]];
    })
    TopUserWinner=TopUserWinner.slice(0,3);
  }
  if(WiningAmount.length==count){
    callback(TopUserWinner,winner)
  }
}


module.exports={uniqueUserCheck,response};