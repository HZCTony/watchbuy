let express = require('express');
let router = express.Router();
let sigin = require('../public/model/DataAccessObject/signin.js');
let logo = require('../public/model/DataAccessObject/logo.js');
const title = 'WatchBuy';
/* GET home page. */
router.get('/', function(req, res, next) {
  let role = req.cookies.role;
  let token = req.cookies.token;
  if (!role || !token) {
    res.render('index', { title: 'WatchBuy', loginStatus: 'none' });
  } else {
    sigin.personCookieCheck(role, token).then(loginStatus => {
      logo.getLogoImgPath(loginStatus.role, loginStatus.email).then(logoPath => {
        loginStatus.logo = logoPath.logo;
      res.render('index', { title: title ,  loginStatus: loginStatus });
      }).catch(err =>{
        res.render('index', { title: title, loginStatus: 'none' });
      });
    });
  };
});

module.exports = router;
