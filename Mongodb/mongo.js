module.exports.getDBS = function(name,data,collection,callbackToFront,upData){
  // console.log('------------------')
  // console.log(name,data,collection,upData)

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'namecjk';

// Create a new MongoClient
const client = new MongoClient(url);

// 引入方法
let insertDocuments = require('./insertDocuments');
let findDocuments = require('./findDocuments');
let updateDocument = require('./updateDocument');
let removeDocument = require('./removeDocument');

// Use connect method to connect to the Server
client.connect(function(err) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  const db = client.db(dbName);
      // 判断调用数据库方法
      if (name == 'findDocuments') {// ------------------查询数据
        findDocuments.findDocuments(db,data,collection,function(result){
          console.log('执行成功---------------findDocuments');            

          callbackToFront(result);
        })
      }else if(name == 'insertDocuments'){// ------------------插入数据
        insertDocuments.insertDocuments(db,data,collection,function(result){
          console.log('执行成功---------------insertDocuments');            
          callbackToFront(result);
        });
      }else if(name == 'updateDocument'){// ------------------更新数据
        updateDocument.updateDocument(db,data,upData,collection,function(result){
          console.log('执行成功---------------updateDocument');            
          callbackToFront(result);
        });
      }else if(name == 'removeDocument'){// ------------------删除数据
        removeDocument.removeDocument(db,data,collection,function(result){
          console.log('执行成功---------------removeDocument');            
          callbackToFront(result);
        })          
      }else{
        return console.log('错误')
      }
      // 结束数据库调用
      client.close();
});
}







