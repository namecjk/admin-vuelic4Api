var Crawler = require("crawler");
// const temme = require('temme').default;
// const _ = require('lodash');
const fs = require('fs');
 



var c = new Crawler({
    maxConnections: 100,
    // This will be called for each crawled page
    callback: function (error, res, done) {
            if (error) {
                return console.log(error);
            }else{
                // let $ = res.$;
                // let dd = $('.provincetr td');
                //  $('.provincetr td a').each((i,item)=>{
                //         //  以拿到省份
                //         // console.log($(item).text());
                //         a.push({province:$(item).text()})

                // })
                // console.log(res.body);
                return res.body
            }
            done();
    }

});

const baseUrl = 'http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2016/';
let  url = `${baseUrl}index.html`;

const requestPromise = (url) =>{
    return new Promise((res)=>{
        res(c.queue(url))

    })
}


requestPromise(url).then(res=>{
    console.log(111);
    console.log(res);
})