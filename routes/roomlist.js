var express = require('express');
var router = express.Router();
var sigin = require('../public/model/DataAccessObject/signin.js');
const title = 'WatchBuy';

/* GET users listing. */
router.get('/', function(req, res, next) {
  var role = req.cookies.role;
  var token = req.cookies.token;
  if (!role || !token) {
    res.render('roomlist', { title: title, loginStatus: 'none' });
  } else {
    sigin.personCookieCheck(role, token).then(loginStatus => {
      console.log(loginStatus);
      res.render('roomlist', { title: title, loginStatus: loginStatus });
    });
  };
});

module.exports = router;
