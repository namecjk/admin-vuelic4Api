// ------------------ 查询数据
const assert = require('assert');
const findDocuments = function(db,data,collectionOne,callback) {
    // Get the documents collection
    const collection = db.collection(collectionOne);
    // Find some documents
    collection.find(data).toArray(function(err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs)
      callback(docs);
    });
  };

exports.findDocuments = findDocuments;