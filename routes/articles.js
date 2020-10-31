// 文章子路由
const express = require('express');
const { findById } = require('../db/articleModel');
const fs = require('fs')
const path = require('path');
let router = express.Router();
var multiparty = require('multiparty'); //处理文件上传的
let articleModel = require('../db/articleModel');
/* 
文章修改和新增接口
    + 业务接口说明:文章修改和新增业务,登陆后才能访问
    + 请求方式:post请求
    + 入参:title,content,username,id
    + 返回值:重定向,有id是修改业务,无id是新增业务,成功重定向/,失败重定向/write
*/
router.post('/write', (req, res, next) => {
    // 接收post数据
    let { title, content, username, id } = req.body;
    // 当前时间
    let createTime = Date.now();
    if (id) {
        // 修改文章
        id = new Object(id); //mongodb里面的id是 Object(''),所以我们再这里拿需要转成对象
        articleModel.updateOne({ _id: id }, { title, content, createTime, username }) //根据查询到的把新数据放进去
            .then(data => { //data表示成功或失败的对象
                // res.send('文章修改成功');
                res.redirect('/')
            })
            .catch(err => {
                // res.send('文章修改失败')
                res.redirect('/write')
            })
    } else {
        // 插入数据库     新增文章 (新增没有的id的)
        let username = req.session.username; //只要你登录成功,这里就有用户名,就可以插入文章了
        articleModel.insertMany({
            username,
            title,
            content,
            createTime
        }).then(data => {
            // res.send('文章写入成功')
            res.redirect('/')
        }).catch(err => {
            // res.send('文章写入失败')
            res.redirect('/write')
        })
    }
})

/* 
文章删除接口
    + 业务接口说明:文章删除业务
    + 请求方式:get请求
    + 入参:id
    + 返回值:失败成功都重定向到/
*/
router.get('/delete', (req, res, next) => {
    let id = req.query.id;
    id = new Object(id);
    // 删除
    articleModel.deleteOne({ _id: id })
        // 结果一般用data,数据用docs
        .then(data => {
            // res.send('文章删除成功');
            res.redirect('/')
        })
        .catch(err => {
            // res.send('文章删除失败');
            res.redirect('/')
        })
});


/* 
图片上传接口
    + 业务接口说明:图片上传业务
    + 请求方式:post请求
    + 入参:file,使用的副文本编辑插件xheditor里面上次图片的文件有的name是filedata
    + 返回值:json格式,例如:{err:0,msg:'图片路径'}
*/
router.post('/upload', (req, res, next) => {
    // 每次访问该接口,都新建一个form对象来解析文件数据
    var form = new multiparty.Form();
    //开始解析:req请求;err看有没有错误;同时接收表单的所有参数,field专门接收除文件以外的键值对,files接收文件
    form.parse(req, (err, field, files) => {
        if (err) {
            console.log("文件上传失败");
        } else {
            // console.log(file);
            var file = files.filedata[0];
            // console.log(file);
            // 读取流,用fs模块
            var read = fs.createReadStream(file.path);
            // 写入流
            var write = fs.createWriteStream(path.join(__dirname, '..', 'public/imgs', file.originalFilename));
            // 管道流,图片写入指定目录
            read.pipe(write);
            // 当写完了
            write.on('close', function() {
                console.log('图片上传完成');
                res.send({
                    err: 0,
                    msg: '/imgs/' + file.originalFilename //如果上传后能拿到这个路径,可以直接打开
                })
            })
        }
    })
});

module.exports = router;