var express = require('express');
var router = express.Router();
var signin = require('../public/model/DataAccessObject/signin.js');
var liveroomlist = require('../public/model/DataAccessObject/liveroomlist.js');
var Logo = require('../public/model/DataAccessObject/Logo.js');
const title = 'WatchBuy';

/* GET users listing. */
router.get('/', function (req, res, next) {
  var role = req.cookies.role;
  var token = req.cookies.token;

  liveroomlist.getAllRooms().then(rooms => {

    signin.personCookieCheck(role, token).then(loginStatus => {
      Logo.getLogoImgPath(loginStatus.role, loginStatus.email).then(logoPath => {
        loginStatus.logo = logoPath.logo;
        res.render('roomlist', { title: title, loginStatus: loginStatus, rooms: JSON.stringify(rooms) });
      });
    }).catch(err =>{
      res.render('roomlist', { title: title, loginStatus: 'none', rooms: JSON.stringify(rooms) });
    });
    
  })

});

module.exports = router;
