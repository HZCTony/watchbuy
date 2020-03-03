var express = require('express');
var router = express.Router();
var signup = require('../../public/model/DataAccessObject/signup.js');

const title = 'WatchBuy';
var resobj = {status:""};
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('./signup/role', { title: title });
});

router.post('/', function (req, res) {
  const role = req.body.name;
  if (role == 'host') {
    res.render('./signup/host_signup', { title: title });
  } else if (role == 'user') {
    res.render('./signup/user_signup', { title: title });
  } else {
    res.send('Error happended, failed to load signup page.');
  }
});

router.post('/host', function(req, res){
  var login_info  = signup.loginTokenGenerator(req.body.email);
  var stream_token = signup.StreamTokenGenerator(req.body.name);
  signup.hostSignUp(
    req.body.name,
    req.body.password,
    req.body.email,
    login_info.login_access_token,
    stream_token,
    req.body.room_name,
    login_info.expire
  ).then(insertHostDataResult =>{
    resobj.status = insertHostDataResult;
    res.json(resobj);
  });
});


router.post('/user', function(req, res){
  var login_info  = signup.loginTokenGenerator(req.body.email);
  signup.userSignUp(
    req.body.name,
    req.body.password,
    req.body.email,
    login_info.login_access_token,
    login_info.expire
  ).then(insertUserDataResult =>{
    resobj.status = insertUserDataResult;
    res.json(resobj);
  });
});


module.exports = router;
