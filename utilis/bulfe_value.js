function createBulfeAmount(){
  return new Promise((resolve, reject) => {
    let bulfe=[];
    bulfe.push(Math.floor(Math.random()*100000+1))
    bulfe.push(Math.floor(Math.random()*100000+1))
    bulfe.push(Math.floor(Math.random()*100000+1))
    resolve(bulfe);
  });
}

module.exports = {createBulfeAmount};

