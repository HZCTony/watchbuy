var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/:id', function(req, res, next) {
  var id = req.params.id;
  res.render('hostlive', { title: 'Express',id:id });
});

module.exports = router;
