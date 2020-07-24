const express = require('express');
const app = express();
const routes = require('./Api');
const path = require('path');



const mutipart= require('connect-multiparty');
app.use(mutipart({uploadDir:'./public'}));
// 使用express自带中间件设置所有的静态资源
app.use(express.static(path.join(__dirname, 'public')))

// 中间件  请求之前做的 解析json
app.use(express.json());
app.set('trust proxy', true);// 设置以后，req.ips是ip数组；如果未经过代理，则为[]. 若不设置，则req.ips恒为[]
routes(app);

// let ipList = {};
// app.get('/',(req,res)=>{
//     let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//     console.log(ipList)
//     console.log(ipList[ip])


//     if (ipList[ip] > 10) {

//         res.send({msg:'超出限制，明天再试'})

//    }else{


//     if(!!ipList[ip]){

//         ipList[ip] = ipList[ip]+1;
        
//     }else{
    
//         ipList[ip] = 1;
    
//     }

//     // console.log('---------------------------')
//     // console.log(req)
//     // console.log('---------------------------')
//     // console.log("headers = " + JSON.stringify(req.headers));// 包含了各种header，包括x-forwarded-for(如果被代理过的话)
//     // console.log("x-forwarded-for = " + req.header('x-forwarded-for'));// 各阶段ip的CSV, 最左侧的是原始ip
//     // console.log("ips = " + JSON.stringify(req.ips));// 相当于(req.header('x-forwarded-for') || '').split(',')
//     // console.log("remoteAddress = " + req.connection.remoteAddress);// 未发生代理时，请求的ip
//     // console.log("ip = " + req.ip);// 同req.connection.remoteAddress, 但是格式要好一些


//     res.send([
//                 {msg:'200'},
//                 req.headers,
//                 {xforwardedfor:req.header('x-forwarded-for')},
//                 req.ips,
//                 {remoteAddress:req.connection.remoteAddress},
//                 {ip:req.ip}

//             ])




//    }


   
// })

app.post('/',(req,res)=>{
    console.log('收到请求:',req.body)
    res.status(201).send();
})

// 一般用来更新数据库上资源，需要拿到数据库id标识
app.put('/:id',(req,res)=>{
    console.log('收到请求id为:',req.params.id);
    console.log('收到请求:',req.body)

    res.send();
})

// 删除也需要标识
app.delete('/:id',(req,res)=>{
    console.log('收到请求id为:',req.params.id);
    res.status(204).send();
})

const port = 4948;
app.listen(port,()=>{
    console.log(`runing---------http://localhost:${port}`);
})