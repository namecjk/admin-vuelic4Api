const data = require('./ss.json');
let mongo = require('../Mongodb/mongo')




mongo.getDBS('insertDocuments', data, 'address2',function(res){
    console.log('插入成功');
})

// let datas = { "email": '312316773@qq.com' };
// mongo.getDBS('findDocuments','北京','address2',function(res){
//     console.log(res);
//     console.log('查询成功');
// })