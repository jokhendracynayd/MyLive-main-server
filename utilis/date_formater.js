function date_format(date_to_change){
  // console.log("date_to_change: ", date_to_change);
  // console.log(typeof date_to_change);
  if(date_to_change.length == 13){
    return new Date(parseInt(date_to_change)).toLocaleDateString();
  }else{
    return new Date(date_to_change).toLocaleDateString();
  }
}


module.exports = {date_format};