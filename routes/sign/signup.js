let express = require('express');
let router = express.Router();
let signup = require('../../public/model/DataAccessObject/signup.js');

const title = 'WatchBuy';
let resobj = {status:""};

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
  let loginInfo  = signup.loginTokenGenerator(req.body.email);
  let streamToken = signup.streamTokenGenerator(req.body.name);
  signup.hostSignUp(
    req.body.name,
    req.body.password,
    req.body.email,
    loginInfo.loginAccessToken,
    streamToken,
    req.body.room_name,
    loginInfo.expire
  ).then(insertHostDataResult =>{
    resobj.status = insertHostDataResult;
    res.cookie('role','host');
    res.cookie('token',loginInfo.loginAccessToken);
    res.json(resobj);
  });
});


router.post('/user', function(req, res){
  let loginInfo  = signup.loginTokenGenerator(req.body.email);
  signup.userSignUp(
    req.body.name,
    req.body.password,
    req.body.email,
    loginInfo.loginAccessToken,
    loginInfo.expire
  ).then(insertUserDataResult =>{
    resobj.status = insertUserDataResult;
    res.cookie('role','user');
    res.cookie('token',loginInfo.loginAccessToken);
    res.json(resobj);
  });
});


module.exports = router;
