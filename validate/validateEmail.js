// 验证邮箱
module.exports =  function validateEmail(str){
    let isEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    return isEmail.test(str) 
}