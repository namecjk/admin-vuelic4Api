let nodemailer = require('nodemailer')

//创建一个smtp服务器
const config = {
    host :'smtp.163.com',
    port : 465,
    auth: {
        user:'cjk9888@163.com',
        pass:'JQHDWOUUFQDSWDPW'
    }
}

// 创建一个SMTP客户端对象
const transporter = nodemailer.createTransport(config);

//发送邮件
module.exports = function (mail){
    console.log("处理中..............")
    transporter.sendMail(mail, function(error, info){
        if(error) {
            console.log(mail)
            console.log('发送错误')
            return console.log(error);
        }
        console.log("已发送验证码")
        console.log(mail)
        console.log('mail sent:', info.response);
    });
};