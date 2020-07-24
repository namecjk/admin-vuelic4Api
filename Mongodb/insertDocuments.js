// const assert = require('assert');
// ------------------ 插入数据方法
const insertDocuments = function (db, data, collectionOne, callback) {
  // Get the documents collection
  const collection = db.collection(collectionOne);
  // Insert some documents
  // data === array[json] [{a : 1}, {a : 2}, {a : 3}]
    collection.insertMany(data, function (err, result) { // insertMany 批量添加
    // collection.insert(data, function (err, result) {
      // assert.equal(err, null);
      // assert.equal(1, result.result.n);
      // assert.equal(1, result.ops.length);
      console.log("Inserted all documents into the collection");
      callback(result);
    });
  };

  exports.insertDocuments = insertDocuments;
