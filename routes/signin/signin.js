var express = require('express');
var router = express.Router();

const title = 'WatchBuy'; 
/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('sign in');
  res.render('./signin/signin', { title: title });
});


module.exports = router;
