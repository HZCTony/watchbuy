var express = require('express');
var router = express.Router();
var sigin = require('../public/model/DataAccessObject/signin.js');

/* GET home page. */
router.get('/', function(req, res, next) {

  var role = req.cookies.role;
  var token = req.cookies.token;
  if (!role || !token) {
    res.render('index', { title: 'WatchBuy', loginStatus: 'none' });
  } else {
    sigin.personCookieCheck(role, token).then(loginStatus => {
      console.log(loginStatus);
      
      res.render('index', { title: 'WatchBuy' ,  loginStatus: loginStatus });
    });
  };



});

module.exports = router;
