var express = require('express');
var router = express.Router();

const title = 'WatchBuy'; 
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('./signup/role', { title: title });
});

router.post('/', function(req, res){
  console.log(req.body.name);
  const role = req.body.name;
  if(role == 'host'){
  res.render('./signup/host_signup', { title: title });
}else if(role == 'user'){
  res.render('./signup/user_signup', { title: title });
}else{
  res.send('Error happended, failed to load signup page.');
}
});


module.exports = router;
