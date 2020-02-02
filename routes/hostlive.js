var express = require('express');
var router = express.Router();
var sigin = require('../public/model/DataAccessObject/signin.js');

const title = 'WatchBuy';
/* GET home page. */
router.get('/:id', function(req, res, next) {
  var id = req.params.id;
  var role = req.cookies.role;
  var token = req.cookies.token;
  if (!role || !token) {
    res.render('hostlive', { title: title, id: id, loginStatus: 'none' });
  } else {
    sigin.personCookieCheck(role, token).then(loginStatus => {
      console.log(loginStatus);
      if(role=='host'){
      res.render('hostlive', { title: title, id: id, loginStatus: loginStatus });
    }else{
      //待確認的邏輯
      res.redirect('/signin');
    }
    });
  };

});

module.exports = router;
