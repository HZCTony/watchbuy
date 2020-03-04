var express = require('express');
var router = express.Router();
var sigin = require('../public/model/DataAccessObject/signin.js');
var live = require('../public/model/DataAccessObject/live.js');
var Logo = require('../public/model/DataAccessObject/Logo.js');
var cart = require('../public/model/DataAccessObject/cart.js');
const title = 'WatchBuy';
/* GET home page. */
router.get('/:id', function (req, res, next) {
  var id = req.params.id;
  var role = req.cookies.role;
  var token = req.cookies.token;

  live.getOnlyOneRoom(id).then(a_single_room => {
    if (!role || !token) {
      res.render('userlive', { title: title, id: id, loginStatus: 'none', room: JSON.stringify(a_single_room[0]) });
    } else {
      sigin.personCookieCheck(role, token).then(loginStatus => {
        Logo.getLogoImgPath(loginStatus.role, loginStatus.email).then(logoPath => {
          if(!logoPath){
            loginStatus.logo = '/images/userundefined.png';
          }else{
            loginStatus.logo = logoPath.logo;
          }
          res.render('userlive', { title: title, id: id, loginStatus: loginStatus, room: JSON.stringify(a_single_room[0]) });
        })
      });
    };
  }).catch(err => {
    console.log(err);
  })


});

router.post('/addtoCart', function (req, res, next) {

  var role = req.cookies.role;
  var email = req.body.email;
  var name = req.body.name;
  var color = req.body.color;
  var size = req.body.size;
  var price = req.body.price;
  var description = req.body.description;
  var stock = req.body.stock;
  var image = req.body.image;

  if (!role || !email) {
    res.json({ error: '[userlive.js]: not a user to do adding to cart' });
  } else {
    cart.InsertSingleProducttoCart(role, email, name, color, size, price, description, stock, image)
      .then(addedResult => {
        res.send(JSON.stringify(addedResult));
      }).catch(err => {
        console.log(err);
      })
  }

});




module.exports = router;
