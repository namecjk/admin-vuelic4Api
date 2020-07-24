let mongo = require('../Mongodb/mongo')
const request = require('request');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const fs = require('fs');

// request(url, function (error, response, body) {
//   console.error('error:', error); // Print the error if one occurred
//   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//   console.log('body:', body); // Print the HTML for the Google homepage.
// });


let a = [];
// 封装一个爬虫，默认读取整个页面的html
const requestPromise = (url) =>{
    return new Promise((resolve,reject)=>{
        request(url,{encoding:null}, function (error, response, body) {
            if (response.statusCode ==  200) {
                // 默认读取中文是乱码，使用iconv-lite库转码
                const bufs = iconv.decode(body,'gb2312');//拿到页面的默认码
                const html = bufs.toString('utf8');//转码
                resolve(html);//promise返回一个转码后并抓取的页面
            }else{
                reject(error);
            }
          });

    })
};
// 读取的地址
const baseUrl = 'http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2016/';
// 拼接地址
let  url = `${baseUrl}index.html`;
// 调用request爬虫，拿省份，并拿到 城市的url
requestPromise(url).then(res=>{
    // cheerio 模块是 拿到数据后 用jquery形式 按需抓取
    const $ = cheerio.load(res);//cheerio使用抓取的数据
    $('.provincetr td a').each((i,item)=>{// 拿到需要的html标签数据，并且循环
        // 拿到省份文本
        let province = $(item).text();
        // 存入一个数组
        a.push({id:i,province,city:[]});//放进一个对象
        // 拿到进入城市的url
        let cityUrl = $(item).attr('href');
        // 把继续需要读取的url传出去，并且把当前项的i也传过去
        getCity(cityUrl,i);
    })
})
// 拿到传入的城市url，并且拿到当前项的i
const getCity = async (url,arrIndex) =>{
    const html = await requestPromise(baseUrl + url);
    const $ = cheerio.load(html);
    $('.citytr td:nth-child(2) a').each((i,item)=>{
        // 拿到城市文本
        let citys = $(item).text();
        // 存入当前项的城市
        a[arrIndex].city.push({citys,code:`100${arrIndex}`+i,region:[]});
         // 把继续需要读取的url传出去，并且把当前项的i也传过去
         let regionUrl = $(item).attr('href');
         getRegion(regionUrl,arrIndex,i); 
    });

    //  写入文件
        // let r = JSON.stringify(a,null,"\t");
        // fs.writeFile('./crawler/ss.json',r,function(err){
        //     if (err) console.log(err);
        // })

    // console.log('成功');
};

const getRegion = async (url,arrIndex,ii)=>{
    const html = await requestPromise(baseUrl + url);//抓取出页面
    const $ = cheerio.load(html);
     $('.countytr td:nth-child(2) a').each((i,item)=>{
        //  拿到区
        let regions = $(item).text();
        // 拿到对象
        let obj = a[arrIndex].city[ii].region;
        obj.push({regions});
    });

    //   写入文件
        let r = JSON.stringify(a,null,"\t");
        r.forEach(item=>{
            mongo.getDBS('insertDocuments', item, 'address',function(res){
                console.log('插入成功');
            })
        })
       
        // fs.writeFile('./crawler/ss.json',r,function(err){
        //     if (err) console.log(err);
        // })
    console.log('成功');
}
