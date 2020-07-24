const assert = require('assert');
// ------------------ 更新数据
 const updateDocument = function(db,data,upData,collectionOne,callback) {
    // Get the documents collection
    const collection = db.collection(collectionOne);
    // Update document where a is 2, set b equal to 1
    collection.updateOne(data
      , { $set: upData }, function(err, result) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      console.log("Updated the document with the field a equal to 2");
      callback(result);
    });  
  };
exports.updateDocument = updateDocument;
