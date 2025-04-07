const mongoose = require("mongoose");
//数据库连接地址+数据库名称（system）
const DBURL='mongodb://127.0.0.1:27017/system'
//连接数据库
 mongoose.connect(DBURL).then(res=>{
    console.log('连接成功')
 }).catch(e=>{
    console.log('连接失败')
 })
 
module.exports = mongoose;
// 启动：net start MongoDB
// 关闭：net stop MongoDB