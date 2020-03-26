let createError = require('http-errors');
let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let favicon = require('serve-favicon');
let cors = require('cors');
let homepage = require('./routes/index');
let signup = require('./routes/sign/signup');
let signin = require('./routes/sign/signin');
let profile = require('./routes/sign/profile');
let roomlist = require('./routes/roomlist');
let userlive = require('./routes/userlive');
let hostlive = require('./routes/hostlive');
let checkout = require('./routes/checkout.js');
let multer = require('multer');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.all(cors());

app.all((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  next()
});

app.use(favicon(path.join(__dirname, 'public/images/favicon.ico')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
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

//payment
app.use('/checkout', checkout);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


let roomInfo = {};
io.on('connection', function (socket) {

  let roomID;
  let singleRealUser = '';
  roomInfo[roomID] = [];

  socket.on('join', function (user) {
    singleRealUser = user.name;
    roomID = user.room;
    if (!roomInfo[roomID]) {
      roomInfo[roomID] = [];
    }
    roomInfo[roomID].push(singleRealUser);
    socket.join(roomID);
    io.to(roomID).emit('sys', singleRealUser + ' joined in this room :', roomInfo[roomID]);
  });

  socket.on('usr_message', function (msg) {
    if (roomInfo[roomID].indexOf(singleRealUser) === -1) {
      return false;
    }
    io.to(roomID).emit('gotMessage', msg);
  })

  socket.on('disconnect', function () {
    let index = roomInfo[roomID].indexOf(singleRealUser);
    if (index != -1) {
      roomInfo[roomID].splice(index, 1);
    }
    socket.leave(roomID);
    io.to(roomID).emit('sys', singleRealUser + ' exit the room: ', roomInfo[roomID]);
  });
});

server.listen(80, function () {
  console.log('listening on port 80');
});

module.exports = app;
