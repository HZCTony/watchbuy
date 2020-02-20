var express = require('express');
var router = express.Router();
var sigin = require('../public/model/DataAccessObject/signin.js');
var product = require('../public/model/DataAccessObject/product.js');
var live = require('../public/model/DataAccessObject/live.js');
const title = 'WatchBuy';
/* GET home page. */
router.get('/:id', function (req, res, next) {
  var id = req.params.id;
  var role = req.cookies.role;
  var token = req.cookies.token;
  if (!role || !token) {
    res.redirect('/signin');
  } else {
    sigin.personCookieCheck(role, token).then(loginStatus => {
      console.log('loginStatus ==',loginStatus);
      if (role == 'host') {
        if (loginStatus.status == 'not ok') {
          res.clearCookie('role');
          res.clearCookie('token');
          res.redirect(`/userlive/${id}`);
        } else {
          if(id == loginStatus.stream_token){
            res.render('hostlive', { title: title, id: id, loginStatus: loginStatus });
          }else{
            res.redirect(`/userlive/${id}`);
          }
        }

      } else {
        res.redirect('/signin');
      }
    });
  };

});

router.post('/updateLiveActivation', function (req, res) {

  console.log(req.body);
  live.updateLiveActivation(req.body).then(UpdatedResult => {
    console.log(UpdatedResult);
    res.json({ status: 'ok' });
  })

})


router.post('/getAllproducts', function (req, res) {
  console.log(req.body);

  product.getAllProducts(req.body.stream_token).then(gotAllProducts => {
    res.send(gotAllProducts);
  })
})


router.post('/getaSingleProduct', function (req, res) {
  console.log(req.body);

  product.getaSingleProduct(req.body.image).then(singleProduct => {
    res.send(singleProduct);
  })
})



module.exports = router;
