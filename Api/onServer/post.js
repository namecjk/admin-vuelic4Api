// scp root@106.52.151.159:expressApis/Api/post.js ./
// scp ./post.js root@106.52.151.159:expressApis/Api/
const express = require('express');
let router = express.Router();
let validateEmail = require('../validate/validateEmail');
// let validatePass = require('../validate/validatePass');
let createSixNum = require('../count');
let sendEmail = require('../nodemailer');
let mongo = require('../Mongodb/mongo');
const jwt  = require('jsonwebtoken');
const fs = require('fs');




router.get('/testapp', (req, res) => {
res.send({msg:"test"})
})
router.post('/setMain', (req, res) => {
    let email = req.body.email;
    if (!email || email == '' || email == undefined) return res.send({ msg: '账户错误', code: 1040 });
    let data = { email };
    mongo.getDBS('findDocuments', data, 'account', function (resultFind) {
        if (resultFind.length == 0) {
            return res.send({ msg: "账户不存在，无法查询", code: 1040 })
        } else {
            	
	         let obj = {btn:[
                    "infoList.add",
                    "infoList.edit",
                    "infoList.delete",
                    "infoList.details",
                    "infoList.selectDelete",
                    "infoClass.add",
                    "userList.search",
                    "userList.add",
                    "userList.edit",
                    "userList.delete",
                    "userList.selectDelete"
                ]}

		if(resultFind[0].btn == undefined){
               		 resultFind.push(obj)
           		 } 
			

                   mongo.getDBS('updateDocument', data, 'account', function (result) {
                    console.log('更新插入数据库函数-回调函数响应成功 --- 添加所有数组');
                    res.send({ msg: '修改成功', resultFind });
                    }, obj);
            }
    })
})
//获取角色信息
router.post('/getRole', (req, res) => {
    let emailCount = req.body.email;
    if (emailCount == '' || !validateEmail(emailCount)) return res.send({ msg: '邮箱错误' });
    let data = { "email": emailCount };
    let childData = { "childAccount.userName":emailCount};
    mongo.getDBS('findDocuments', data, 'account', function (resluts) {
        if (resluts.length == 0){
             mongo.getDBS('findDocuments', childData, 'account', function (childRes){
                 if(childRes[0].childAccount.length == 0)return res.send({ msg: '账户不存在，请注册' });
                let childAcc = childRes[0].childAccount.find(item => item.userName == emailCount);
                if(!childAcc.userName || childAcc.userName == '')return res.send({ msg: '账户有问题，联系管理员' });
                res.send({msg:"子账户查找角色成功",role:childAcc.role,childAcc})
            });  
        }else{
            if (resluts.length != 0 && data.email === resluts[0].email) {
                if(!resluts[0].role){
                    resluts[0]['role'] = ['信息管理','用户管理'];
                    let findParentAccount = { "email": resluts[0].email };
                    mongo.getDBS('updateDocument', findParentAccount, 'account', function (result) {
                        return res.send({ msg: '主账户添加role成功', });
                    }, resluts[0]);
                }
                let role = resluts[0].role;
                return res.send({ msg: '主账户查找角色成功',role,resluts });
            } else {
                return res.send({ msg: '账户密码错误', });
            }
        }
    });
});
// 搜索用户api--
router.post('/SearchChildUser',(req,res)=>{
    let Token = req.body.token;
    let email = req.body.email;
    let pageNo = req.body.pageNo;
    let pageSize = req.body.pageSize;
    let type = req.body.type;
    let SearchValue = req.body.SearchValue;
    if (!email || email == '' || email == undefined) return res.send({ msg: '添加失败-账户错误', code: 1040 });
    if (!Token || Token == '' || Token == undefined) return res.send({ msg: '添加失败-token错误', code: 1040 });
    if (!pageNo || pageNo == '' || pageNo == undefined) return res.send({ msg: '添加失败-pageNo错误', code: 1040 });
    if (!pageSize || pageSize == '' || pageSize == undefined) return res.send({ msg: '添加失败-pageSize错误', code: 1040 });
    let data = { email };
    let childData = { "childAccount.userName":email}; //childAccount.userName 查找子账户名称
    mongo.getDBS('findDocuments', data, 'account', function (resultFind) {
        if (resultFind.length == 0) {
            mongo.getDBS('findDocuments', childData, 'account', function (childRes){
                if(childRes[0].childAccount.length == 0)return res.send({ msg: '账户不存在，请注册' });
                                   let childAcc = childRes[0].childAccount.find(item => item.userName == email);
                                   if(!childAcc.userName || childAcc.userName == '')return res.send({ msg: '账户有问题，联系管理员' });
                                   if(childAcc.userName == email ){//成功找到子账户
                                                let array = childRes[0].childAccount;
                                                if (SearchValue == '' && type == '') {
                                                    array.reverse();
                                                        let arrayLength = array.length;
                                                        let offset = (pageNo - 1) * pageSize;
                                                        let result =  offset + pageSize >= array.length ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
                                                        res.send({msg:"搜索成功",code:200,result,arrayLength});           
                                    
                                                }else if(type == 'userName' && SearchValue || type == 'phone' && SearchValue ){
                                                    let arr = [];
                                                    array.forEach(item=>{
                                                        if(item[type] == SearchValue)arr.push(item);
                                                    })
                                                    let arrayLength = arr.length;
                                                    arr.reverse();
                                                    let offset = (pageNo - 1) * pageSize;
                                                    let result =  offset + pageSize >= arr.length ? arr.slice(offset, arr.length) : arr.slice(offset, offset + pageSize);
                                                    res.send({msg:`搜索${type}=${SearchValue}成功)`,result,arrayLength});          
                                                }else{res.send({msg:"请正确选择[搜索类型],并填写对应[搜索值]"});};  
                                    }else{
                                            return res.send({ msg: '子账户错误'})
                                    };
                    });
        } else {
            let array = resultFind[0].childAccount;
	    if (SearchValue == '' && type == '') {
   		    array.reverse();
                    let arrayLength = array.length;
                    let offset = (pageNo - 1) * pageSize;
                    let result =  offset + pageSize >= array.length ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
                    res.send({msg:"搜索成功",code:200,result,arrayLength});           

            }else if(type == 'userName' && SearchValue || type == 'phone' && SearchValue ){
	      	    let arr = [];
                    array.forEach(item=>{
                        if(item[type] == SearchValue)arr.push(item);
                    })
                    let arrayLength = arr.length;
                    arr.reverse();
                    let offset = (pageNo - 1) * pageSize;
                    let result =  offset + pageSize >= arr.length ? arr.slice(offset, arr.length) : arr.slice(offset, offset + pageSize);
                    res.send({msg:`搜索${type}=${SearchValue}成功)`,result,arrayLength});          
	    }else{
                res.send({msg:"请正确选择[搜索类型],并填写对应[搜索值]"});
            }
        };
    });
});
//// 编辑子用户 和 编辑启用状态--
router.post('/EditChildUser', (req, res) => {
    let dataObj = {};
    for(let key in req.body){
        if(req.body[key] == '' || req.body[key] == undefined) return res.send({msg:`请检查”${key}“错误`});
        dataObj[key] = req.body[key];
    };
    if(!dataObj.type) return res.send({msg:"无效编辑状态"});
    let findParentAccount = { "email": dataObj.parentAccount };
    mongo.getDBS('findDocuments', findParentAccount, 'account', function (resluts) {
        if (resluts.length !== 1) {
            res.send({err:"找不到主账号,请联系管理员"});
        }else{
            if (resluts[0].childAccount == undefined) return res.send({msg:"没有子账户,无法编辑"});
            if(dataObj.type == 'EditCurrentStatus'){
		let currentAcc = resluts[0].childAccount.find(item => item.userName == dataObj.userName);
                if(currentAcc == undefined) return res.send({msg:"子账户无效,无法修改状态属性"});
                if(!currentAcc.currentStatus)return res.send({msg:"修改状态属性有误"})
                 currentAcc.currentStatus = currentAcc.currentStatus == "0" ? "1" : "0";
            }else if(dataObj.type == 'EditCurrentAccount'){
		let currentAcc = resluts[0].childAccount.find(item => item.userName == dataObj.oldUserName);
                if(currentAcc == undefined) return res.send({msg:"子账户无效,无法编辑"});
                for(let key in dataObj)currentAcc[key] = dataObj[key];
            }
        }
        mongo.getDBS('updateDocument', findParentAccount, 'account', function (r) {
            if(dataObj.type == 'EditCurrentStatus')res.send({ msg: '修改子账户状态成功',code:200,resluts});
            if(dataObj.type == 'EditCurrentAccount')res.send({ msg: '编辑子账户成功',code:200,resluts});
        }, resluts[0]);
    })
});
// 批量删除用户--
router.post('/batchDeleteChildUser', (req, res) => {
    let dataObj = {};
    for(let key in req.body){
        if(req.body[key] == '' || req.body[key] == undefined) return res.send({msg:`请检查”${key}“错误`});
        dataObj[key] = req.body[key];
    };
    let findParentAccount = { "email": dataObj.parentAccount };
    mongo.getDBS('findDocuments', findParentAccount, 'account', function (resluts) {
        let num = 0;
        if (resluts.length !== 1) {
            res.send({err:"找不到主账号,请联系管理员"});
        }else{
            dataObj.ArruserName.forEach(Deleteitem=>{
                resluts[0].childAccount.forEach((item,i)=>{
                    if(item.userName === Deleteitem.userName){
                        resluts[0].childAccount.splice(i, 1);
                        num++;
                    }
                })
            })
        }
        mongo.getDBS('updateDocument', findParentAccount, 'account', function (result) {
            res.send({ msg:`成功删除子账户${num}个`,code:200});
        }, resluts[0]);
    })
});
//删除子用户--
router.post('/deleteChildUser', (req, res) => {
    let dataObj = {};
    for(let key in req.body){
        if(req.body[key] == '' || req.body[key] == undefined) return res.send({msg:`请检查”${key}“错误`,code:"201"});
        dataObj[key] = req.body[key];
    };
    let findParentAccount = { "email": dataObj.parentAccount };
    mongo.getDBS('findDocuments', findParentAccount, 'account', function (resluts) {
        if (resluts.length !== 1) {
            return res.send({msg:"找不到主账号,请联系管理员",code:"201"});
        }else{
            if (resluts[0].childAccount == undefined) return res.send({msg:"没有子账户,无法删除"});
            if(resluts[0].childAccount.find(item => item.userName == dataObj.userName) == undefined) return res.send({msg:"子账户无效,无法删除"});
            let resData = resluts[0].childAccount.filter(item => item.userName !== dataObj.userName);
            resluts[0].childAccount = resData;
        }
        mongo.getDBS('updateDocument', findParentAccount, 'account', function (result) {
            res.send({ msg: '删除子账户成功',code:"200"});
        }, resluts[0]);
    })
});
//添加子用户--
router.post('/addChildUser', (req, res) => {
    let dataObj = {};
    for(let key in req.body){
        if(req.body[key] == '' || req.body[key] == undefined) return res.send({msg:`请检查”${key}“错误`});
        dataObj[key] = req.body[key];
    };
    let findParentAccount = { "email": dataObj.parentAccount };
    mongo.getDBS('findDocuments', findParentAccount, 'account', function (resluts) {
        if (resluts.length !== 1) {
            return res.send({msg:"找不到主账号,无法添加子账号,请联系管理员",code:"201"});
        }else{
            if (resluts[0].childAccount == undefined){
                console.log('childAccount不存在，添加并push子账户进去');
                resluts[0]["childAccount"] = [];
                resluts[0].childAccount.push(dataObj);
            }else{
                if(resluts[0].childAccount.find(item => item.userName == dataObj.userName)){
                    return res.send({msg:"子账户名已存在,请重新输入",code:"201"});
                }else{
                    console.log('子账户名没有重复，可以注册');
                    resluts[0].childAccount.push(dataObj);
                }
            };
	console.log("查找完成")
            mongo.getDBS('updateDocument', findParentAccount, 'account', function (result) {
                res.send({ msg: '添加子账户成功',code:"200"});
            }, resluts[0]);
        }
    })
});
//查地区
router.post('/getAllAddress',(req,res)=>{
    let Token = req.body.token;
    let email = req.body.email
    let str = req.body.str;
    if (!email || email == '' || email == undefined) return res.send({ msg: '添加失败-账户错误', code: 1040 });
    if (!Token || Token == '' || Token == undefined) return res.send({ msg: '添加失败-token错误', code: 1040 });
    if (!str || str == '' || str == undefined) return res.send({ msg: '添加失败-str错误', code: 1040 });   
    mongo.getDBS('findDocuments',str,'address',function(result){
        res.send({msg:result});
    })
})
//查地区，单个省
router.post('/getOneAddress',(req,res)=>{
    let Token = req.body.token;
    let email = req.body.email;
    let str = req.body.str
    if (!email || email == '' || email == undefined) return res.send({ msg: '添加失败-账户错误', code: 1040 });
    if (!Token || Token == '' || Token == undefined) return res.send({ msg: '添加失败-token错误', code: 1040 });
    if (!str || str == '' || str == undefined) return res.send({ msg: '添加失败-str错误', code: 1040 });
    mongo.getDBS('findDocuments',str,'address',function(result){
        result.forEach(item=>{
            if(item.province === str){
                res.send(item);
                return
            }
        })
    })
})
// 上传文件中间件
var mutipart= require('connect-multiparty');
var mutipartMiddeware = mutipart();
router.post('/upload',mutipartMiddeware,(req,res)=>{
    console.log(req.files);
    fs.rename(req.files.file.path,'./public/img/'+req.files.file.name,(err)=>{
        if (err) console.log(err);
    })
    res.send('upload success')
   
})
router.post('/setAllData',(req,res) => {//设置添加新的数组，如果没有就添加，如果有就更新

    let token = req.body.token;
    let email = req.body.email;
    if (!email || email == '' || email == undefined) return res.send({ msg: '账户错误', code: 1040 });
    if (!token || token == '' || token == undefined) return res.send({ msg: 'token错误', code: 1040 });
    //验证token
    let secret = 'NAMEcjk';
    let payload = jwt.verify(token,secret);
    if (email !== payload) return res.send({ msg: 'token验证失败',payload,email,token});

    let data = { email };
    mongo.getDBS('findDocuments', data, 'account', function (resultFind) {
        console.log(resultFind)
        if (resultFind.length == 0) {
            return res.send({ msg: "账户不存在，无法查询", code: 1040 })
        } else {
	

	   let ClassNameAllData = [];
	  if(resultFind[0].className !== undefined){
          resultFind[0].className.forEach(item=>{
		item.contentData.forEach(items=>{
		ClassNameAllData.push(items)
		})
           })
	   //更新到数据库 
	        let updateData = {ClassNameAllData};
		mongo.getDBS('updateDocument', data, 'account', function (result) {
                    console.log('更新插入数据库函数-回调函数响应成功 --- 添加所有数组');
                    res.send({ msg: '设置分类成功', resultFind });
                }, updateData);	   
           }else{
		console.log(22222222)
		console.log(resultFind.className);
		res.send({msg:"查询失败"});
 	}
     }
    })


})
// Api
router.get('/', (req, res) => {
    // let nowDate = new Date();
    let nowMs = new Date().getTime();
    // console.log(typeof nowMs)Number
    res.send(`Wellcome to CjkApi================${nowMs}`)
})
//获取页码
router.post('/pageList',(req,res)=>{
    let Token = req.body.token;
    let email = req.body.email;
    let pageNo = req.body.pageNo;
    let pageSize = req.body.pageSize;
    if (!email || email == '' || email == undefined) return res.send({ msg: '添加失败-账户错误', code: 1040 });
    if (!Token || Token == '' || Token == undefined) return res.send({ msg: '添加失败-token错误', code: 1040 });
    if (!pageNo || pageNo == '' || pageNo == undefined) return res.send({ msg: '添加失败-pageNo错误', code: 1040 });
    if (!pageSize || pageSize == '' || pageSize == undefined) return res.send({ msg: '添加失败-pageSize错误', code: 1040 });
    let data = { email };
    let childData = { "childAccount.userName":email}; 
   mongo.getDBS('findDocuments', data, 'account', function (resultFind) {
        if (resultFind.length == 0) {
	       mongo.getDBS('findDocuments', childData, 'account', function (childRes){
                if(childRes[0].childAccount.length == 0)return res.send({ msg: '账户不存在，请注册' });
                    let childAcc = childRes[0].childAccount.find(item => item.userName == email);
                    if(!childAcc.userName || childAcc.userName == '')return res.send({ msg: '账户有问题，联系管理员' });
                    if(childAcc.userName == email ){
                            let array = childRes[0].ClassNameAllData;
                            array.reverse();
                            let arrayLength = array.length;
                            if (!array || array == '' || array == undefined) return res.send({ msg: '添加失败-array错误', code: 1040 });
                            let offset = (pageNo - 1) * pageSize;
                            let result =  offset + pageSize >= array.length ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
                            res.send({msg:'查询分页成功',result,arrayLength});
               }else{
                   return res.send({ msg: '子账户错误'})};
           }); 

           // return res.send({ msg: "账户不存在，无法查询", code: 1040 })
        } else {
            let array = resultFind[0].ClassNameAllData;
	    array.reverse();
     	    let arrayLength = resultFind[0].ClassNameAllData.length;
            let offset = (pageNo - 1) * pageSize;
            let result =  offset + pageSize >= array.length ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
	    res.send({msg:'查询分页成功',result,arrayLength,resultFind});
        };
    });
});
//获取user页码
router.post('/UserPageList',(req,res)=>{
    let Token = req.body.token;
    let email = req.body.email;
    let pageNo = req.body.pageNo;
    let pageSize = req.body.pageSize;
    if (!email || email == '' || email == undefined) return res.send({ msg: '添加失败-账户错误', code: 1040 });
    if (!Token || Token == '' || Token == undefined) return res.send({ msg: '添加失败-token错误', code: 1040 });
    if (!pageNo || pageNo == '' || pageNo == undefined) return res.send({ msg: '添加失败-pageNo错误', code: 1040 });
    if (!pageSize || pageSize == '' || pageSize == undefined) return res.send({ msg: '添加失败-pageSize错误', code: 1040 });
    let data = { email };
   let childData = { "childAccount.userName":email};	
    mongo.getDBS('findDocuments', data, 'account', function (resultFind) {
        if (resultFind.length == 0) {
		 mongo.getDBS('findDocuments', childData, 'account', function (childRes){
                    if(childRes[0].childAccount.length == 0)return res.send({ msg: '账户不存在，请注册' });
                        let childAcc = childRes[0].childAccount.find(item => item.userName == email);
                        if(!childAcc.userName || childAcc.userName == '')return res.send({ msg: '账户有问题，联系管理员' });
                        if(childAcc.userName == email ){//成功找到子账户
                            let array = childRes[0].childAccount;
                            array.reverse();
                            let arrayLength = childRes[0].childAccount.length;
                            let offset = (pageNo - 1) * pageSize;
                            let result =  offset + pageSize >= array.length ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
                            result.forEach(item=>{
                                item['status'] = item.status
                            })
                            res.send({msg:'查询分页成功',result,arrayLength,childRes});
                }else{
                    return res.send({ msg: '子账户错误'})};
            }); 

        } else {
            let array = resultFind[0].childAccount;
            array.reverse();
            let arrayLength = resultFind[0].childAccount.length;
            let offset = (pageNo - 1) * pageSize;
            let result =  offset + pageSize >= array.length ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
 res.send({msg:'查询分页成功',result,arrayLength});
        };
    });
});
// 账户---获取分类数据
router.post('/getClassify', (req, res) => {
    let Token = req.body.token;
    let email = req.body.email;
    if (!email || email == '' || email == undefined) return res.send({ msg: '添加失败-账户错误', code: 1040 });
    if (!Token || Token == '' || Token == undefined) return res.send({ msg: '添加失败-token错误', code: 1040 });

    let data = { email };
let childData = { "childAccount.userName":email};
    mongo.getDBS('findDocuments', data, 'account', function (resultFind) {
        if (resultFind.length == 0) {
		 mongo.getDBS('findDocuments', childData, 'account', function (childRes){
 if(childRes[0].childAccount.length == 0)return res.send({ msg: '账户不存在，请注册' });
                    let childAcc = childRes[0].childAccount.find(item => item.userName == email);
                    if(!childAcc.userName || childAcc.userName == '')return res.send({ msg: '账户有问题，联系管理员' });
                    if(childAcc.userName == email ){//成功找到子账户
                        res.send({ msg: '查询分类成功', childRes });
               }else{
                   return res.send({ msg: '子账户错误'})};
           }); 
		
           // return res.send({ msg: "账户不存在，无法查询", code: 1040 })
        } else {
            res.send({ msg: '查询分类成功', resultFind });
        }
    })

})
// 账户---插入分类数据
router.post('/addClassify', (req, res) => {
   
    let Token = req.body.token;
    let email = req.body.email;
    let updateData = req.body.updateData;

    if (!email || email == '' || email == undefined) return res.send({ msg: '添加失败-账户错误', code: 1040 });
    if (!Token || Token == '' || Token == undefined) return res.send({ msg: '添加失败-token错误', code: 1040 });
    if (!updateData || updateData == '' || updateData == undefined) return res.send({ msg: '添加失败-token错误', code: 1040 });
   
    let data = { email };
let childData = { "childAccount.userName":email};   
 mongo.getDBS('findDocuments', data, 'account', function (resultFind) {
        if (resultFind.length == 0) {
	
     mongo.getDBS('findDocuments', childData, 'account', function (childRes){
                if(childRes[0].childAccount.length == 0)return res.send({ msg: '账户不存在，请注册' });
                    let childAcc = childRes[0].childAccount.find(item => item.userName == email);
                    if(!childAcc.userName || childAcc.userName == '')return res.send({ msg: '账户有问题，联系管理员' });
                    if(childAcc.userName == email ){
                        mongo.getDBS('updateDocument', childData, 'account', function (results) {
                            console.log('更新插入数据库函数-回调函数响应成功 --- 添加分类API')
	                        console.log(results)   
				 res.send({ msg: '编辑成功', results });
                        }, updateData)
                        
               }else{
                   return res.send({ msg: '子账户错误'})};
           });       




 } else {

            mongo.getDBS('updateDocument',data, 'account', function (result) {
                console.log('更新插入数据库函数-回调函数响应成功 --- 添加分类API')
                res.send({ msg: 'updateDocument--成功', result });
            },updateData)

        }
    })
})
// 获取登录验证码
router.post('/logincode', (req, res) => {
    let emailCount = req.body.email
    let emailPassword = req.body.passWord
    if (emailPassword == '' || emailPassword == undefined) return res.send({msg:'请输入正确密码'});
    if (emailCount == '' || !validateEmail(emailCount)) return res.send({msg:'请输入正确邮箱'});
    // 封装创建并发送验证函数
    let createCode = ()=>{
        let code = createSixNum();
        if (code == '' && code == undefined) return res.send({ msg: '验证码错误' });
        let nowMs = new Date().getTime();
        let data = [{ "passcode": code, "ms": nowMs }];
        mongo.getDBS('insertDocuments', data, 'passcode', function (result) {
            var mail = {
                from: '<cjk9888@163.com>',
                subject: 'ChangeMan:注册验证码,请查收',
                to: emailCount,
                text: '用' + code + '作为你的验证码'
            };
            sendEmail(mail);
            res.send({ msg: `已发送验证至${emailCount}`,code});
        })
    };
    let data = { "email": emailCount };
    let childData = { "childAccount.userName":emailCount};   
 mongo.getDBS('findDocuments',data,'account', function (reslut) {
	 if (reslut.length == 0) {
             mongo.getDBS('findDocuments', childData, 'account', function (childRes) {
                if(childRes.length == 0)return res.send({ msg: '账户不存在1，请注册' });
                let childAcc = childRes[0].childAccount.find(item => item.userName == emailCount);
                if(!childAcc.userName || childAcc.userName == '')return res.send({ msg: '账户有问题，联系管理员' });
                createCode();
            })
        } else {
            let code = createSixNum();
            if (code == '' && code == undefined) return res.send({msg:'验证码错误'});

            let nowMs = new Date().getTime(); 
            let data = [{"passcode":code,"ms":nowMs}];
            mongo.getDBS('insertDocuments',data,'passcode',function(result){
                console.log('插入数据库函数-回调函数响应成功-插入验证码')
                console.log(result)

                var mail = {
                from: '<cjk9888@163.com>',
                subject: 'ChangeMan:注册验证码,请查收',
                to: emailCount,
                text: '用' + code + '作为你的验证码'
                };
                sendEmail(mail);
                res.send({msg:`已发送验证至${req.body.email}`,code});
            })
        }
    });
})
// 获取注册验证码
router.post('/reqcode', (req, res) => {//请求验证码
    let emailCount = req.body.email//拿到传递过来的邮箱
    let emailPassword = req.body.passWord//拿到传递过来的邮箱
    if (emailPassword == '' || emailPassword == undefined) return res.send({msg:'请输入正确密码'});
    if (emailCount == '' || !validateEmail(emailCount)) return res.send({msg:'请输入正确邮箱'});

    // 查询email
    let data = { "email": emailCount };// 请求数据库
    mongo.getDBS('findDocuments',data,'account', function (reslut) {
        console.log('查询数据库函数-回调函数响应成功-reslut=对象=有数据长度大于0')
        if (reslut.length != 0) {

            return res.send({ msg: '账户存在,请登录' });// 将数据转换为字符串

        } else {//账户不存在才执行获取验证码脚本
            let code = createSixNum();//拿到生成的随机六位数
            if (code == '' && code == undefined) return res.send({msg:'验证码错误'});

            // 将验证码存入数据库
            let nowMs = new Date().getTime(); //获取1970.1.1至今的毫秒数
            let data = [{"passcode":code,"ms":nowMs}];// 存入数据库数据
            mongo.getDBS('insertDocuments',data,'passcode',function(result){
                console.log('插入数据库函数-回调函数响应成功-插入验证码')
                console.log(result)
                // 成功插入验证码 再执行发送验证码
                // 创建发生邮箱作者表
                var mail = {
                // 发件人
                from: '<cjk9888@163.com>',
                // 主题
                subject: 'ChangeMan:注册验证码,请查收',//邮箱主题
                // 收件人
                to: emailCount,//前台传过来的邮箱
                // 邮件内容，HTML格式
                text: '用' + code + '作为你的验证码'//发送验证码
                };
                sendEmail(mail);//发送
                res.send({msg:`已发送验证至${req.body.email}`});//响应
            })
        }
    });
})
// 登录
router.post('/login', (req, res) => {
    // 必须拿到 邮箱 密码 验证码
    let emailCount = req.body.email//拿到传递过来的邮箱
    let emailPassword = req.body.passWord//拿到传递过来密码
    let emailPasscode = req.body.passcode//拿到传递过来的验证码
    if (emailPasscode == '' || emailPasscode.length < 6) return res.send({msg:'请输入正确验证码'});
    if (emailPassword == '' || emailPassword == undefined) return res.send({msg:'请输入正确密码'});
    if (emailCount == '' || !validateEmail(emailCount)) return res.send({msg:'邮箱错误'});

    let data = { "email": emailCount };// 请求账户数据
    let dataCode = { "passcode": emailPasscode };// 请求验证码数据
    let dataPassword = { "password": emailPassword };// 请求验证码数据
    let childData = { "childAccount.userName":emailCount};   
 mongo.getDBS('findDocuments', data, 'account', function (resluts) {
        if(resluts.length == 0){//找子账户	
	   mongo.getDBS('findDocuments', childData, 'account', function (childRes){
                 if(childRes[0].childAccount.length == 0)return res.send({ msg: '账户不存在，请注册' });
                 let childAcc = childRes[0].childAccount.find(item => item.userName == emailCount);
                 if(!childAcc.userName || childAcc.userName == '')return res.send({ msg: '账户有问题，联系管理员' });
                 if(childAcc.userName == emailCount && childAcc.passWord == emailPassword){                    
                    mongo.getDBS('findDocuments', dataCode, 'passcode', function (resPasscode) {//找验证码
                        if (resPasscode.length == 0) {
                            res.send({ msg: '验证码错误或超时，请重新获取'});                         
                        } else {
                             mongo.getDBS('removeDocument', dataCode, 'passcode', function () {
                                console.log('删除验证码函数---------执行成功---子账户')
                            });
                            let secret = 'NAMEcjk';
                            let email = childAcc.userName;
                            let token = jwt.sign(email, secret);
                            return res.send({ msg: '登录成功', email, token,childAcc });
                        }
                    });
                }else{return res.send({ msg: '子账户密码错误'})};
            }); 
        }else{//找主账户
        if (resluts.length != 0 && data.email === resluts[0].email && dataPassword.password === resluts[0].password) {
                // 账户存在 继续执行 查找验证码
                mongo.getDBS('findDocuments',dataCode,'passcode',function(reslut){
			 if (reslut.length == 0) {
                                res.send({ msg: '验证码错误或超时，请重新获取', data: reslut });                           
                        }else{
                            console.log('查找验证码------回调函数执行成功')
                            let nowMs = new Date().getTime();
                            let passMs = nowMs - reslut[0].ms;
                            if (reslut.length != 0 && dataCode.passcode === reslut[0].passcode && passMs < 60000) {
                                        mongo.getDBS('removeDocument',dataCode,'passcode',function(){
                                            console.log('删除验证码函数---------执行成功')            
                                        });
                                       // res.send({ msg: '登录成功', data: resluts });
                                       // let payload = {msg:resluts};
                                        let secret = 'NAMEcjk';
					let email = resluts[0].email;
                                        let token = jwt.sign(email,secret);
                                       // let email = resluts[0].email;
                                        res.send({ msg: '登录成功',email , token,resluts });                             
                            }else{
                                if (dataCode.passcode.length > 0) {
    
                                    mongo.getDBS('removeDocument',dataCode,'passcode',function(){
                                        console.log('删除验证码函数---------执行成功')            
                                    });
                                    
                                    res.send({ msg: '验证码错误或超时，请重新获取', data: reslut });
    
                                }else{
    
                                    res.send({ msg: '验证码错误或超时，请重新获取1', data: reslut });
                                }
                            }
                        }
                })
        } else {
            res.send({ msg: '账户密码错误'});// 将数据转换为字符串
        }

      }
    });

});
// 注册
router.post('/register', (req, res) => {
     // 必须拿到 邮箱 密码 验证码
     let emailCount = req.body.email//拿到传递过来的邮箱
     let emailPassword = req.body.passWord//拿到传递过来的密码
     let emailPasscode = req.body.passcode//拿到传递过来的验证
     if (emailPasscode == '' || emailPasscode.length < 6) return res.send({msg:'请输入正确验证码'});
     if (emailPassword == '' || emailPassword == undefined) return res.send({msg:'请输入正确密码'});
     if (emailCount == '' || !validateEmail(emailCount)) return res.send({msg:'邮箱错误'});

     let data = { "email": emailCount };// 请求账户数据
     let dataCode = { "passcode": emailPasscode };// 请求验证码数据


    mongo.getDBS('findDocuments',data,'account', function (reslut) {
        console.log('查询数据库函数-回调函数响应成功-reslut=对象=有数据长度大于0')
        if (reslut.length != 0) {
            res.send({ msg: '注册账户存在,请更改',data:reslut});// 将数据转换为字符串
        } else { // 不存在 执行 存入数据库 操作
                // 先判断验证码 验证码正确 才插入数据库
                mongo.getDBS('findDocuments',dataCode,'passcode',function(reslut){
                    console.log('查找验证码------回调函数执行成功')
                    let nowMs = new Date().getTime();//获取1970.1.1至今的毫秒数   
		console.log(reslut);  
		 if (reslut.length == 0) return res.send({msg:"验证码错误"});  
		  let passMs = nowMs - reslut[0].ms;//用现在的毫秒 - 当时存入数据库时的毫秒，得到的总数不能大于60000毫秒(1分钟)  
                    if (reslut.length != 0 && dataCode.passcode === reslut[0].passcode && passMs < 60000) {
                                // 验证码正确  可以 执行 插入数据库    执行删除该验证码
                                mongo.getDBS('removeDocument',dataCode,'passcode',function(){//执行删除该验证码
                                    console.log('删除验证码函数---------执行成功')            
                                });
                                     // 注册数据必须是array嵌套json
                                    let date = new Date();
                                    let data = [{"email":emailCount,"password":emailPassword,date,className:[]}];// 存入数据库数据
                                    mongo.getDBS('insertDocuments',data,'account',function(result){
                                        console.log('插入数据库函数-回调函数响应成功')
                                        console.log(result)
                                        res.send({msg:'注册成功，可以登录了'});
                                    })                      
                    }else{

                        // 验证码存在就执行删除,否则就只响应报错
                        if (dataCode.passcode.length > 0) {

                            mongo.getDBS('removeDocument',dataCode,'passcode',function(){
                                console.log('删除验证码函数---------执行成功')            
                            });
                            
                            res.send({ msg: '验证码错误或超时，请重新获取', data: reslut });// 将数据转换为字符串                            

                        }else{

                            res.send({ msg: '验证码错误或超时，请重新获取', data: reslut });// 将数据转换为字符串                            
                        }                          
                    }
            })




            


        }
    });

})



// router.post('/',(req,res)=>{
//     console.log('保存文章:',req.body)
//     res.status(201).send({id:2, ...req.body});
// })

// // 一般用来更新数据库上资源，需要拿到数据库id标识
// router.put('/:id',(req,res)=>{
//     console.log('收到请求，文章id为:',req.params.id);
//     console.log('收到请求，新的文字内容为:',req.body)

//     res.send({id:req.params, ...req.body});
// })

// // 删除也需要标识
// router.delete('/:id',(req,res)=>{
//     console.log('收到请求id文章为:',req.params.id);
//     res.status(204).send();
// })

module.exports = router;
