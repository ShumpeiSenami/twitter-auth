var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var session = require('express-session');
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var GitHubStrategy = require('passport-github2').Strategy;


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

// ユーザー情報をセッションに保存するために初期化 (twitter,github 共通)
app.use(session({
  secret: 'secrete-key',
  resave: true,
  saveUninitialized: true
}));

// passport自体の初期化 (twitter,github 共通)
app.use(session({ secret:'41364e69455ebbdc', resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

// passport-twitterの設定 (twitter認証のためのもの)
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

// passport-githubの設定
var GITHUB_CLIENT_ID = 'b8f5aebffc72210cea55';
var GITHUB_CLIENT_SECRET = 'c6b4d59fcd0ff616a9366aa987ed607f83c74ae5';

passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:8000/auth/github/callback'
},
  function(accessToken, refreshToken, profile, done){
    process.nextTick(function(){
      return done(null, profile);
    });
  }
  ));

// セッションに保存
passport.serializeUser(function(user, done){
  done(null, user);
});
// セッションから復元 routerのreq.userからの利用可能
passport.deserializeUser(function(obj, done){
  done(null, obj);
});



app.use('/', indexRouter);
app.use('/users', usersRouter);

// twitterへの認証を実行した際の動作(twitter認証のためのもの)
app.get('/auth/twitter',
  passport.authenticate('twitter'),
  function(req, res){
  });
app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: 'auth_failed' }),
  function (req, res) {
    res.redirect('/');
  });
// githubへの認証を実行した際の動作（github認証のためのもの）
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }),
  function(req, res){
  });
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res){
    res.redirect('/')
  });

  app.get('/login', function(req, res){
    res.render('login');
  });

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  })

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
