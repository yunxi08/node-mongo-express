var createError = require('http-errors'); //处理http错误的
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser'); //处理cookie的模块
var logger = require('morgan'); //打印日志的模块
var session = require('express-session'); //session是服务端存储用户信息的模块

var indexRouter = require('./routes/index'); //导入模板子路由
var usersRouter = require('./routes/users'); //导入用户子路由
var articlesRouter = require('./routes/articles') //导入文章子路由

// 连接数据库
var db = require('./db/connect');
// favicon
var favicon = require('serve-favicon');

var app = express();
// favicon配置
app.use(favicon(path.join(__dirname, "public", 'favicon.ico')));
// 配置ejs模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 关于日志的
app.use(logger('dev'));
// 使用body-parser中间件,就可以使用req.body解析post请求主体(这个解析post不能解析文件,只能解析名字密码)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// 使用cookieParser中间件，就可以解析cookie
app.use(cookieParser());
// 配置服务端的session
app.use(session({
    secret: 'sz2009html5', //这是加密的信息
    resave: false, //存储数据库吗
    saveUninitialized: true, //什么时候存储？刚初始化时
    cookie: {
        maxAge: 1000 * 60 * 60 //指定session的有效时长(session这是服务器空间),单位毫秒值
    }
}));
// 配置静态路由
app.use(express.static(path.join(__dirname, 'public')));

// 用户登录拦截
app.get('*', (req, res, next) => {
    let { username } = req.session; //获取用户名
    let url = req.path; //拿到路径
    if (url != '/login' && url != '/regist') {
        // 如果不是登录和注册，需要有用户名（登录状态）
        if (!username) {
            //用户未登录
            res.redirect('/login')
        } else {
            next()
        }
    } else {
        next()
    }
})

// 配置子路由
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/articles', articlesRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;