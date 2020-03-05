let express = require('express');
let router = express.Router();
let sigin = require('../public/model/DataAccessObject/signin.js');
let live = require('../public/model/DataAccessObject/live.js');
let logo = require('../public/model/DataAccessObject/logo.js');
let cart = require('../public/model/DataAccessObject/cart.js');
const title = 'WatchBuy';
/* GET home page. */
router.get('/:id', function (req, res, next) {
  let id = req.params.id;
  let role = req.cookies.role;
  let token = req.cookies.token;

  live.getOnlyOneRoom(id).then(singleRoom => {
    if (!role || !token) { // if not login, user can still watch live view
      res.render('userlive', { title: title, id: id, loginStatus: 'none', room: JSON.stringify(singleRoom[0]) });
    } else {
      sigin.personCookieCheck(role, token).then(loginStatus => {
        logo.getLogoImgPath(loginStatus.role, loginStatus.email).then(logoPath => {
          if(!logoPath){
            loginStatus.logo = '/images/userundefined.png';
          }else{
            loginStatus.logo = logoPath.logo;
          }
          res.render('userlive', { title: title, id: id, loginStatus: loginStatus, room: JSON.stringify(singleRoom[0]) });
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
    cart.insertSingleProducttoCart(role, email, name, color, size, price, description, stock, image)
      .then(addedResult => {
        res.send(JSON.stringify(addedResult));
      }).catch(err => {
        console.log(err);
      })
  }
});

module.exports = router;
