// 模板子路由
const express = require('express');
const articleModel = require('../db/articleModel');
const moment = require('moment'); //时间格式化
let router = express.Router();

/*  首页路由*/
router.get('/', function(req, res, next) {
    console.log(req.query);
    // 数据类型是Number
    let page = parseInt(req.query.page || 1); //如果page没有传，默认是第一页
    let size = parseInt(req.query.size || 4); //如果size没有传，默认一页显示4条
    let username = req.session.username; //拿到用户名显示
    // 第一步：查询文章总数,并计算计算总数
    articleModel.find().count().then(total => {
        // console.log(total); //total就是文章的总条数
        // 获取总页数
        var pages = Math.ceil(total / size);
        // console.log(page);
        // 第二步：分页查询
        articleModel.find().sort({ 'createTime': -1 }).skip((page - 1) * size).limit(size)
            .then(docs => {
                // docs不是传统意义的js数组,要使用slice方法把他转化成js数组
                var arr = docs.slice();
                // console.log(typeof docs);
                for (let i = 0; i < arr.length; i++) {
                    // 原有的文档的字段值，不能修改吗？
                    // 最好添加一个新的字段，来表示格式化的时间
                    arr[i].createTimeZH = moment(arr[i].createTime).format('YYYY-MM-DD HH:mm:ss')
                };
                // 成功后推给index页面
                res.render('index', {
                    data: {
                        list: arr,
                        total: pages,
                        username
                    }
                })
            })
            .catch(err => {
                res.redirect('/')
            })
    })
});

// 注册页路由
// 注册页路由
router.get('/regist', (req, res, next) => {
    res.render('regist', {})
})

// 登陆页路由
router.get('/login', (req, res, next) => {
    res.render('login', {})
});


// 写文章/编辑文章页路由
router.get('/write', (req, res, next) => {
    // 获取文章id   (顺序:先拿到文章id,再拿id去查询,显示在页面上，然后你能在上面修改,修改后再提交)
    var id = req.query.id;
    if (id) {
        // 编辑
        id = new Object(id);
        // 用id查询
        articleModel.findById(id)
            .then(doc => {
                console.log(doc)
                res.render('write', { doc, username: req.session.username }) //查询到的结果全部给它传过去(doc是写文章的那个人,后面的那个是真正登录的那个人)
            })
            .catch(err => {
                res.redirect('/')
            })
    } else {
        // 新增
        var doc = {
            _id: '',
            username: req.session.username,
            title: '',
            content: ''
        }
        res.render('write', { doc, username: req.session.username })
    }
});

// 详情页路由
router.get('/detail', function(req, res, next) {
    var id = req.query.id;
    // 用id查询
    articleModel.findById(id)
        .then(doc => {
            doc.createTimeZH = moment(doc.createTime).format('YYYY-MM-DD HH:mm:ss');
            res.render('detail', {
                doc,
                username: req.session.username
            });
        })
        .catch(err => {
            res.send(err);
        })
});
module.exports = router;