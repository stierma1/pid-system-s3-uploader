
module.exports = async function(){
  while(true){
    var message = await this.receive();
    console.log(message);
  }
}