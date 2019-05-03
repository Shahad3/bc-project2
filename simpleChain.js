/////////* ===== SHA256 with Crypto-js ===============================
//|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
//|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);
// const level = require('level');
// // 1) Create our database, supply location and options.
// //    This will create or open the underlying store.
// var db = level('chaindb')


// /* ===== Datase functions ==============================
// |  The required functions to write or read from the database 			   |
// |  ===============================================*/

// // Add data to levelDB with key/value pair
// function addLevelDBData(key,value){

//   db.put(key, value)
//   .catch(error => console.log(error));
// }


// // Get data from levelDB with key
// function getLevelDBData(key){
//   db.get(key)
//   .catch(error => console.log(error));
// }

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
    this.chain = [];
    addDataToLevelDB(chain);
    this.addBlock(new Block("First block in the chain - Genesis block"));
  }

  // Add new block
  addBlock(newBlock){
    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    // previous block hash
    this.getLastKey().then(function (chainHeight){
      newBlock.height = chainHeight;
      if(newBlock.height>0){
        console.log("------------------------"+ (newBlock.heigh-1));
        db.getLevelDBData(newBlock.heigh-1).then(function(value){
          console.log("block GET + " + value);
        newBlock.previousBlockHash = JSON.parse(value).hash;          
        })
        .catch(error => console.log(error + " addBlock/getLevelDBData"));
        
    }

  })
  .catch(error => console.log(error + "Getting the block"));
  
  
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    // Adding block object to chain
    //this.chain.push(newBlock);
    console.log("key: " + newBlock.height);
    console.log("value: " +JSON.stringify(newBlock).toString() );
    db.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString());

  }

  // Add data to levelDB with key/value pair
addLevelDBData(key,value){

  return db.put(key, value , function(err){
    if(err)
    console.log("submission failed")
  });
  
}

// Get data from levelDB with key
getLevelDBData(key){
  return new Promise((resolve, reject) => {
  db.get(key, function(er, val){
    if(er)
    reject(er);
    resolve(val);
  })
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
            addLevelDBData(i, value);
            resolve();
          });//end of createReadStream
      });//end of Promise
}

// Get DB height (the height of the last record)
getLastKey(value) {
  return new Promise(function(resolve, reject){
      let key = 0;
      db.createKeyStream()
          .on('data', function(data) {
            key++;
          })
          .on('error', function(err) {
              reject(err + "getLastKey");
          })
          .on('close', function() {
            console.log("------------------------"+ key)
            resolve(key);
          });//end of createReadStream
      });//end of Promise
}


    // validate block
    validateBlock(blockHeight){
      // get block object
      let block = this.getLevelDBData(blockHeight);
      // get block hash
      let blockHash = block.hash;
      // remove block hash to test block integrity
      block.hash = '';
      // generate block hash
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
      // Compare
      if (blockHash===validBlockHash) {
          return true;
        } else {
          console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
          return false;
        }
    }

   // Validate blockchain
    validateChain(){
      let errorLog = [];
      for (var i = 0; i < getLastKey()-1; i++) {
        // validate block
        if (!this.validateBlock(i))errorLog.push(i);
        // compare blocks hash link
        let blockHash = getLevelDBData(i).hash;
        let previousHash = getLevelDBData(i+1).previousBlockHash;
        if (blockHash!==previousHash) {
          errorLog.push(i);
        }
      }
      if (errorLog.length>0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: '+errorLog);
      } else {
        console.log('No errors detected');
      }
    }
}


(function theLoop (i) {
  myBlockchain = new Blockchain();
  setTimeout(function () {
      let blockTest = new Block("Test Block - " + (i + 1));
      myBlockchain.addBlock(blockTest);
      //console.log(blockTest);
      console.log(myBlockchain.getLevelDBData(i));
          i++;
          if (i < 10) theLoop(i);
  }, 10000);
})(0);