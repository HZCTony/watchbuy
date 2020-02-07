var express = require('express');
var router = express.Router();
var sigin = require('../public/model/DataAccessObject/signin.js');
var live = require('../public/model/DataAccessObject/live.js');
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
      if(loginStatus.status == 'not ok'){
        res.clearCookie('role');
        res.clearCookie('token');
        res.render('userlive', { title: title, id: id, loginStatus: loginStatus });
      }
      res.render('hostlive', { title: title, id: id, loginStatus: loginStatus });
    }else{
      //待確認的邏輯
      res.redirect('/signin');
    }
    });
  };

});

router.post('/updateLiveActivation', function(req,res){

  console.log(req.body);
  live.updateLiveActivation(req.body).then(UpdatedResult=>{
    console.log(UpdatedResult);
    res.json({status:'ok'});
  })

})

module.exports = router;
