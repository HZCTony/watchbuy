var express = require('express');
var router = express.Router();
var signin = require('../public/model/DataAccessObject/signin.js');
var liveroomlist = require('../public/model/DataAccessObject/liveroomlist.js');
const title = 'WatchBuy';

/* GET users listing. */
router.get('/', function(req, res, next) {
  var role = req.cookies.role;
  var token = req.cookies.token;
  if (!role || !token) {
    res.render('roomlist', { title: title, loginStatus: 'none', rooms: 'none' });
  } else {
    signin.personCookieCheck(role, token).then(loginStatus => {
      console.log('loginStatus ==',loginStatus);
      liveroomlist.getAllRooms().then(rooms =>{
        console.log(rooms);
        res.render('roomlist', { title: title, loginStatus: loginStatus , rooms: JSON.stringify(rooms) });
      })
    });
  };
});

module.exports = router;
