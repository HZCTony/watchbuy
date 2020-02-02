var express = require('express');
var sigin = require('../../public/model/DataAccessObject/signin.js');
var router = express.Router();

const title = 'WatchBuy';
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('./signin/signin', { title: title });
});

router.post('/check', function (req, res) {
  console.log(req.body);
  const name = req.body.name;
  const password = req.body.password;
  const role = req.body.role;

  if (role == 'user') {
    sigin.userSignInCheck(name, password).then(function (data) {
      if (data.length == 0) {
        res.json({ status: 'You have not been signed up as a user yet.' });
      } else {
        var status = 'Welcome Back! ' + name;
        //做完登入確認要轉跳
        res.cookie('role',role);
        res.cookie('token',data[0].login_access_token);
        res.json({ status: status });
      }
    }).catch(function (err) {
      res.json({ status: err });
    });

  } else if (role == 'host') {
    sigin.hostSignInCheck(name, password).then(function (data) {
      if (data.length == 0) {
        res.json({ status: 'You have not been signed up as a host yet.' });
      } else {
        var status = 'Welcome Back! ' + name;
        //做完登入確認要轉跳
        res.cookie('role',role);
        res.cookie('token',data[0].login_access_token);
        res.json({ status: status });
      }
    }).catch(function (err) {
      res.json({ status: err });
    });

  } else {
    res.json({status:'Error : please check sign in info first.'});
  }

});


router.post('/logout', function (req, res, next) {
  console.log(req.body);
  res.clearCookie('role');
  res.clearCookie('token');
  res.json({msg:'already logout'});
});


module.exports = router;
