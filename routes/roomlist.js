let express = require('express');
let router = express.Router();
let signin = require('../public/model/DataAccessObject/signin.js');
let liveroomlist = require('../public/model/DataAccessObject/liveroomlist.js');
let logo = require('../public/model/DataAccessObject/logo.js');
const title = 'WatchBuy';

router.get('/', function (req, res, next) {
  let role = req.cookies.role;
  let token = req.cookies.token;

  liveroomlist.getAllRooms().then(rooms => {
    signin.personCookieCheck(role, token).then(loginStatus => {
      logo.getLogoImgPath(loginStatus.role, loginStatus.email).then(logoPath => {
        if (!logoPath) {
          loginStatus.logo = '/images/userundefined.png';
        } else {
          loginStatus.logo = logoPath.logo;
        }
        res.render('roomlist', { title: title, loginStatus: loginStatus, rooms: JSON.stringify(rooms) });
      });
    }).catch(err => {
      res.render('roomlist', { title: title, loginStatus: 'none', rooms: JSON.stringify(rooms) });
    });
  })
});

module.exports = router;
