var express = require('express');
var signin = require('../../public/model/DataAccessObject/signin.js');
var Logo = require('../../public/model/DataAccessObject/Logo.js');
var cart = require('../../public/model/DataAccessObject/cart.js');
var product = require('../../public/model/DataAccessObject/product.js');
var s3_credential = require('../../public/model/util/aws.json');
var router = express.Router();
var multer = require('multer');
var multerS3 = require('multer-s3');
var AWS = require('aws-sdk');
var multiparty = require('multiparty');
var util = require('util');
//var s3 = require('../../public/model/util/s3uploader.js');

//s3 logo uploader
var host_logo_upload = multer({
  storage: multerS3({
    s3: new AWS.S3(s3_credential),
    bucket: 'hzctonyforlive/logo/host',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())// filename
    }
  })
})

var user_logo_upload = multer({
  storage: multerS3({
    s3: new AWS.S3(s3_credential),
    bucket: 'hzctonyforlive/logo/user',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())// filename
    }
  })
})


var product_upload = multer({
  storage: multerS3({
    s3: new AWS.S3(s3_credential),
    bucket: 'hzctonyforlive/product',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())// filename
    }
  })
})


const title = 'WatchBuy';


/* GET home page. */
router.get('/', function (req, res, next) {


  var role = req.cookies.role;
  var token = req.cookies.token;

  if (!role || !token) {
    res.redirect('/signin');
  } else {

    signin.personCookieCheck(role, token).then(loginStatus => {
      if (loginStatus.status == 'ok') {
        Logo.getLogoImgPath(loginStatus.role, loginStatus.email).then(logoPath => {
          loginStatus.logo = logoPath.logo;
          res.render('./profile/settings', { title: title, loginStatus: loginStatus });

        })

      } else {
        res.clearCookie('role');
        res.clearCookie('token');
        console.log('[profile.js]: loginStatus=', loginStatus);
        res.redirect('/signin');
      }
    }).catch((err) => {
      console.log(err);
    });
  };
});


router.get('/:list', function (req, res, next) {


  var role = req.cookies.role;
  var token = req.cookies.token;
  let profileList = req.params.list;

  if (!role || !token) {
    res.redirect('/signin');
  } else {

    signin.personCookieCheck(role, token).then(loginStatus => {
      if (loginStatus.status == 'ok') {
        Logo.getLogoImgPath(loginStatus.role, loginStatus.email).then(logoPath => {
          loginStatus.logo = logoPath.logo;


          if (loginStatus.role == 'host') {
            switch (profileList) {
              case '0':
                res.render('./profile/settings', { title: title, loginStatus: loginStatus });
                break;
              case '1':
                res.render('./profile/product_upload', { title: title, loginStatus: loginStatus });
                break;
              case '2':
                res.render('./profile/host_products', { title: title, loginStatus: loginStatus });
                break;
              case '3':
                res.clearCookie('role');
                res.clearCookie('token');

                res.redirect('/signin');
                break;
              default:
                res.render('./profile/settings', { title: title, loginStatus: loginStatus });
            }
          } else if (loginStatus.role == 'user') {
            switch (profileList) {
              case '0':
                res.render('./profile/settings', { title: title, loginStatus: loginStatus });
                break;
              case '1':
                res.render('./profile/cartlist', { title: title, loginStatus: loginStatus });
                break;
              case '2':
                res.render('./profile/orderlist', { title: title, loginStatus: loginStatus });
                break;
              case '3':
                res.clearCookie('role');
                res.clearCookie('token');
                res.redirect('/signin');
                break;
              default:
                res.render('./profile/settings', { title: title, loginStatus: loginStatus });
            }
          }
        })
      } else {
        res.clearCookie('role');
        res.clearCookie('token');
        console.log('[profile.js]: loginStatus=', loginStatus);
        res.redirect('/signin');
      }
    }).catch((err) => {
      console.log(err);
    });
  };
});




router.post('/host_logo_upload', host_logo_upload.single('logo'), function (req, res) {
  const role = req.body.role;
  const filename = req.file.location;
  const current_host_email = req.body.email;
  Logo.UpdateLogoPath(filename, 'host', current_host_email).then(UpdatedResult => {
    res.redirect({ status: 'updated logo path to host database' });
  }).catch(err => {
    res.json({ status: err });
  })
})


router.post('/user_logo_upload', user_logo_upload.single('logo'), function (req, res) {
  const role = req.body.role;
  const filename = req.file.location;
  const current_user_email = req.body.email;
  Logo.UpdateLogoPath(filename, 'user', current_user_email).then(UpdatedResult => {
    res.json({ status: 'updated logo path to user database' });
  }).catch(err => {
    res.json({ status: err });
  })

})


router.post('/product_upload', product_upload.single('image'), function (req, res) {
  const productName = req.body.name;
  const color = req.body.color;
  const size = req.body.size;
  const price = req.body.price;
  const description = req.body.description;
  const stock = req.body.stock;
  const email = req.body.email;
  const filepath = req.file.location;

  product.InsertNewProduct(productName, color, size, price, description, stock, email, filepath, price)
    .then(UpdatedResult => {
      res.json({ status: 'Updated information of a single product to database' });
    }).catch(err => {
      res.json({ status: err });
    })

})


router.post('/getProductsinCart', function (req, res, next) {
  cart.getAllProductsInCart(req.body.email).then(allproducts => {
    res.send(allproducts);
  })

});

router.post('/deleteProductInCart', function (req, res, next) {
  var email = req.body.email;
  var productName = req.body.productName;
  cart.deleteProductInCart(email, productName).then(result => {
    res.send('delete a product in your cart');
  })
});

router.post('/getAllHostOwnedProduct', function (req, res, next) {
  if (req.body.role == 'host') {
    if (req.body.email) {
      product.getAllHostOwnedProducts(req.body.email).then(AllProducts => {
        res.send(AllProducts);
      })
    }
  }

});

router.post('/payment', function (req, res, next) {
  const stripe = require('stripe')('sk_test_JxwU8aWOHEeGy9lsAjIoQaAp004S8XdBcE');
  stripe.charges.create({
    amount: 9487,
    currency: "hkd",
    source: req.body.stripeToken, // obtained with Stripe.js
    description: "Test Tony Charge"
  }, function (err, charge) {
    if (err) {
      res.json({ 'Tony err:': err })
    }
    res.json(charge);
  });
})


module.exports = router;
