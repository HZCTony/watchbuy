var createError = require('http-errors');
var express = require('express');
var path = require('path');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var favicon = require('serve-favicon');
var cors = require('cors');
var testOBSRouter = require('./routes/testOBS');
var homepage = require('./routes/index');
var signup = require('./routes/sign/signup');
var signin = require('./routes/sign/signin');
var profile = require('./routes/sign/profile');
var roomlist = require('./routes/roomlist');
var userlive = require('./routes/userlive');
var hostlive = require('./routes/hostlive');
var usersRouter = require('./routes/users');
var multer			= require('multer');
var app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const corsOptions = {
  origin: [
    'http://www.example.com',
    'http://localhost:8080',
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
};



app.use(cors(corsOptions));
app.use((req, res, next)=>{
  res.set('Cache-Control', 'no-cache');
  next()
})
app.use(favicon(path.join(__dirname,'public/images/favicon.ico')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:false}));
//home
app.use('/', homepage);


//signup & signin pages
app.use('/signup', signup);
app.use('/signin', signin);
app.use('/profile', profile);

//live streaming pages
app.use('/roomlist', roomlist);
app.use('/userlive', userlive);
app.use('/hostlive', hostlive);
app.use('/users', usersRouter);


app.use('/testOBS', testOBSRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var roomInfo = {};


io.on('connection', function (socket) {
  var url = socket.request.headers.referer;
  console.log(url);
  var roomID;
  var A_real_user = '';
  console.log('user id ==', socket.id, ' is connected');

  socket.on('usr_message', function (msg) {

    if (roomInfo[roomID].indexOf(A_real_user) === -1) {  
      return false;
    }
    console.log(msg);
    io.to(roomID).emit('gotMessage', msg);
  })


  socket.on('join', function (user) {
    A_real_user = user.name;
    roomID = user.room;

    // 将用户昵称加入房间名单中
    if (!roomInfo[roomID]) {
      roomInfo[roomID] = [];
    }
    roomInfo[roomID].push(A_real_user);

    socket.join(roomID);    // 加入房间
    // notice all users in the room with roomID
    io.to(roomID).emit('sys', A_real_user + ' joined in this room :', roomInfo[roomID]);  
    console.log(A_real_user + ' joined in this room ' + roomID);
  });

  socket.on('disconnect', function () {
    // 从房间名单中移除
    // var index = roomInfo[roomID].indexOf(A_real_user);
    // if (index !== -1) {
    //   roomInfo[roomID].splice(index, 1);
    // }

    // socket.leave(roomID);    // 退出房间
    // io.to(roomID).emit('sys', A_real_user + '退出了房间', roomInfo[roomID]);
    // console.log(A_real_user + '退出了' + roomID);
  });



});




server.listen(80, function () {
  console.log('listening on port 80');
});

module.exports = app;
