var path = require('path');
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var config = require('config-lite');
var routes = require('./routes');
var pkg = require('./package');  // package.json

var app = express();

// 设置模板目录
app.set('views', path.join(__dirname, 'views'));
// 设置模板引擎为 ejs
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  name: config.session.key,       // 设置 cookie 中保存 session id 的字段名称
  secret: config.session.secret,  // 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
  resave: true,                   // 强制更新 session
  saveUninitialized: false,       // 设置为 false，强制创建一个 session，即使用户未登录
  cookie: {
    maxAge: config.session.maxAge // 过期时间，过期后 cookie 中的 session id 自动删除
  },
  store: new MongoStore({         // 将 session 存储到 mongodb
    url: config.mongodb           // mongodb 地址
  })
}));
app.use(flash()); // *****

routes(app); //注册路由

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke! 内部错误 500');
});

app.listen(config.port, () => {
  console.log(`${pkg.name} listening on port ${config.port}`);
});

