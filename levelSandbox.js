/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './data';
const db = level(DB);

// Add data to levelDB with key/value pair
function addLevelDBData(key,value){

  db.put(key, value , function(err){
    if(err)
    console.log("submission failed")
  });
  
}

// Get data from levelDB with key
function getLevelDBData(key){
  return new Promise((resolve, reject) => {
  db.get(key, function(er, val){
    if(er)
    reject(er);
    resolve(val);
  })
});
}


// Add data to levelDB with value
function addDataToLevelDB(value) {
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
function getLastKey(value) {
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

/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/


// (function theLoop (i) {
//   setTimeout(function () {
//     addDataToLevelDB('Testing data');
//     if (--i) theLoop(i);
//   }, 100);
// })(10);


// Export

module.exports.addLevelDBData = addLevelDBData;
// module.exports.addDataToLevelDB = addDataToLevelDB;
module.exports.getLevelDBData = getLevelDBData;
module.exports.getLastKey = getLastKey;