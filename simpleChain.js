/////////* ===== SHA256 with Crypto-js ===============================
//|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
//|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);
const Block = require("./block");




/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
   
  }

  // Add new block
  addBlock(newBlock){
    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    // previous block hash
    this.getBlockHeight().then((chainHeight) =>{
      newBlock.height = chainHeight;
    })
    .then(() =>{
      if(newBlock.height>0){
        this.getBlock(newBlock.height-1).then((previousBlock) =>{
        newBlock.previousBlockHash = JSON.parse(previousBlock).hash;
        })
        .then(()=>{
          ///
            // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    this.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString());
        })
        .catch(error => console.log(error + "Getting the height"));
        
        
        
    }

    else{
      newBlock.height = 0;
      newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
      newBlock.body = "First block in the chain - Genesis block"
    // Adding block object to chain
    console.log("key: " + newBlock.height);
    console.log("value: " +JSON.stringify(newBlock).toString() );
    this.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString());
        
    }

    })
    .catch(error => console.log(error + "Getting the height"));

  }

// /* ===== Datase functions ==============================
// |  The required functions to write or read from the database 			   |
// |  ===============================================*/


  // Add data to levelDB with key/value pair
addLevelDBData(key,value){

  return db.put(key, value , function(err){
    if(err)
    console.log("submission failed")
  });
  
}

// Get data from levelDB with key
getBlock(key){
  return new Promise((resolve, reject) => {
   db.get(key, function(er, val){
    if(er)
    console.log(er);
      resolve(val);

  });
});
}


// Add data to levelDB with value
addDataToLevelDB(value) {
  return new Promise(function(resolve, reject){
      let i = 0;
      db.createReadStream()
          .on('data', function(data) {
            i++;
          })
          .on('error', function(err) {
              reject(err + "create read stream");
          })
          .on('close', function() {
            this.addLevelDBData(i, value).then(function(){
            resolve()});
          });//end of createReadStream
      });//end of Promise
}

// Get DB height (the height of the last record)
getBlockHeight(value) {
  return new Promise(function(resolve, reject){
      let key = 0;
      db.createReadStream()
          .on('data', function(data) {
            key++;
          })
          .on('error', function(err) {
              reject(err + "getBlockHeight");
          })
          .on('close', function() {
            resolve(key);
          });//end of createReadStream
      });//end of Promise
}


    // validate block
    validateBlock(blockHeight){
      return new Promise((resolve, reject)=>{
      // get block object
      this.getBlock(blockHeight).then((block)=>{
       block = JSON.parse(block); 
      // get block hash
      let blockHash = block.hash;
      // remove block hash to test block integrity
      block.hash = "";
      // generate block hash
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
      // Compare

       if (blockHash===validBlockHash) {
          resolve(true);
        } else {
          console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
          resolve(false);
        }
      })
      .catch("error in validating the blcok");
    })
    .catch("error in validating the blcok");    
  }

   // Validate blockchain
    validateChain(){
      let errorLog = [];
      this.getBlockHeight().then((chainHeight)=>{
      for (var i = 1; i < chainHeight ; i++) {
        
      Promise.all([this.validateBlock(i), this.getBlock(i), this.getBlock(i-1) ]).then((values)=>{
        // console.log((JSON.parse(values[0])).previousBlockHash + " == " + (JSON.parse(values[1])).hash);
        if(!values[0])
        errorLog.push(i);
        console.log(i, " undefind in the past : ",values[0])
        if((JSON.parse(values[1])).previousBlockHash !== (JSON.parse(values[2])).hash)
        errorLog.push(i);
      })
      .catch("error in validating the chain");

    }
    
      
      if (errorLog.length>0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: '+errorLog);
      } else {
        console.log('No errors detected');
      }
    })
    .catch("error in validating the blcok");
    }
}

let myBlockchain = new Blockchain();

(function theLoop (i) {
  // 
  setTimeout(function () {
      let blockTest = new Block("Test Block - " + (i + 1));
// let myBlockchain = new Blockchain();
// myBlockchain.addBlock(blockTest);
// myBlockchain.validateBlock(i);
myBlockchain.validateChain();

          i++;
          if (i < 10) theLoop(i);
  }, 10000);
})(0);