var express = require('express');
var router = express.Router();
var sigin = require('../public/model/DataAccessObject/signin.js');
var Logo = require('../public/model/DataAccessObject/Logo.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  var role = req.cookies.role;
  var token = req.cookies.token;
  if (!role || !token) {
    res.render('index', { title: 'WatchBuy', loginStatus: 'none' });
  } else {
    sigin.personCookieCheck(role, token).then(loginStatus => {
      Logo.getLogoImgPath(loginStatus.role, loginStatus.email).then(logoPath => {
        loginStatus.logo = logoPath.logo;
      res.render('index', { title: 'WatchBuy' ,  loginStatus: loginStatus });
      }).catch(err =>{
        res.render('index', { title: 'WatchBuy', loginStatus: 'none' });
      });
    });
  };
});

module.exports = router;
