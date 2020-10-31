// 文章集合文件
const mongoose = require('mongoose');
// 文章表结构
let articleSchema = mongoose.Schema({
    title: String,
    content: String,
    createTime: Number,
    username: String
});
// 创建表
let articleModel = mongoose.model('articles', articleSchema)

module.exports = articleModel;