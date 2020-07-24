// 验证密码
module.exports = function validatePass(str){
    let isPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{6,18}$/;
    return isPass.test(str) 
}