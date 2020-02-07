var express = require('express');
var router = express.Router();
var sigin = require('../public/model/DataAccessObject/signin.js');
var live = require('../public/model/DataAccessObject/live.js');
const title = 'WatchBuy';
/* GET home page. */
router.get('/:id', function (req, res, next) {
  var id = req.params.id;
  var role = req.cookies.role;
  var token = req.cookies.token;

live.getOnlyOneRoom(id).then(a_single_room => {
  console.log('[userlive.js]: ',JSON.stringify(a_single_room[0]));
  if (!role || !token) {
    res.render('userlive', { title: title, id: id, loginStatus: 'none', room: JSON.stringify(a_single_room[0]) });
  } else {
    sigin.personCookieCheck(role, token).then(loginStatus => {
      res.render('userlive', { title: title, id: id, loginStatus: loginStatus, room: JSON.stringify(a_single_room[0]) });
    });
  };
}).catch(err=>{
  console.log(err);
})


});

module.exports = router;
