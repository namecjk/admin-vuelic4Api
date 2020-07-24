// ------------------ 删除数据
const assert = require('assert');
const removeDocument = function(db,data,collectionOne,callback) {
    // Get the documents collection
    const collection = db.collection(collectionOne);
    // Delete document where a is 3
    collection.deleteOne(data, function(err, result) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      console.log("Removed the document with the field a equal to 3");
      callback(result);
    });    
  }
exports.removeDocument = removeDocument;
