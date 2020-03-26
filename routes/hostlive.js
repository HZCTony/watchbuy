let express = require('express');
let router = express.Router();
let sigin = require('../public/model/DataAccessObject/signin.js');
let logo = require('../public/model/DataAccessObject/logo.js');
let product = require('../public/model/DataAccessObject/product.js');
let live = require('../public/model/DataAccessObject/live.js');
const title = 'WatchBuy';

router.get('/:id', function (req, res, next) {
  let id = req.params.id;
  let role = req.cookies.role;
  let token = req.cookies.token;
  if (!role || !token) {
    res.redirect('/signin');
  } else {
    sigin.personCookieCheck(role, token).then(loginStatus => {
      if (role == 'host') {
        if (loginStatus.status == 'not ok') {
          res.clearCookie('role');
          res.clearCookie('token');
          res.redirect(`/userlive/${id}`);
        } else {
          if(id == loginStatus.stream_token){
            logo.getLogoImgPath(loginStatus.role, loginStatus.email).then(logoPath => {
              live.getOnlyOneRoom(id).then(singleRoom =>{
                loginStatus.logo = logoPath.logo;
                loginStatus.instance = singleRoom[0].ec2id;
                res.render('hostlive', { title: title, id: id, loginStatus: loginStatus });
              })
            });

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
  live.updateLiveActivation(req.body).then(UpdatedResult => {
    res.json({ status: 'ok' });
  })

})


router.post('/getAllproducts', function (req, res) {
  product.getAllProducts(req.body.stream_token).then(gotAllProducts => {
    res.send(gotAllProducts);
  })
})


router.post('/getaSingleProduct', function (req, res) {
  product.getSingleProduct(req.body.image).then(singleProduct => {
    res.send(singleProduct);
  })
})



module.exports = router;
