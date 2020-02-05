var express = require('express');
var signin = require('../../public/model/DataAccessObject/signin.js');
var router = express.Router();

const title = 'WatchBuy';

/* GET home page. */
router.get('/', function (req, res, next) {

  var role = req.cookies.role;
  var token = req.cookies.token;
  if (!role || !token) {
    console.log('[profile.js]: role='+ role +' token=' + token);
    console.log('[profile.js]: No role or token');
    res.redirect('/signin');
  } else {
    signin.personCookieCheck(role, token).then(loginStatus => {
      console.log(loginStatus);
      if(loginStatus.status == 'ok'){
        res.render('profile', { title: title, loginStatus: loginStatus });
    }else{
        res.clearCookie('role');
        res.clearCookie('token');
        console.log('[profile.js]: loginStatus=', loginStatus);
        res.redirect('/signin');
    }
    }).catch((err) =>{
       console.log(err);
    });
  };
});



module.exports = router;
