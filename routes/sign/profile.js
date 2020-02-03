var express = require('express');
var sigin = require('../../public/model/DataAccessObject/signin.js');
var router = express.Router();

const title = 'WatchBuy';

/* GET home page. */
router.get('/', function (req, res, next) {

  var role = req.cookies.role;
  var token = req.cookies.token;
  if (!role || !token) {
    res.redirect('/signin');
  } else {
    sigin.personCookieCheck(role, token).then(loginStatus => {
      console.log(loginStatus);
      res.render('profile', { title: title, loginStatus: loginStatus });
    });
  };
});



module.exports = router;
