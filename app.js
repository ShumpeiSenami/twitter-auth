var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var session = require('express-session');
var TwitterStrategy = require('passport-twitter').Strategy;
var passport = require('passport');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use (helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ユーザー情報をセッションに保存するために初期化
app.use(session({
  secret: 'secrete-key',
  resave: true,
  saveUninitialized: true
}));

// passport自体の初期化
app.use(passport.initialize());
app.use(passport.session());

// passport-twitterの設定
passport.use(new TwitterStrategy({
  consumerKey:'k5ybd8wmIKyfD2QH7NHNW7nFT',
  consumerSecret: 'keMHKXgpwntczuOniNuuXREPHLj8lc0tWCGVYaEFBQBDL2Puig',
  callbackURL: '/auth/twitter/callback'
},
// 認証後の処理
function(token, tokenSecret, profile, done){
  return done(null, profile);
}
));
// セッションに保存
passport.serializeUser(function(user, done){
  done(null, user);
});
// セッションから復元 routerのreq.userからの利用可能
passport.deserializeUser(function(user, done){
  done(null, user);
});



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: 'auth_failed' }),
  function (req, res) {
    res.redirect('/users');
  });

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
