let express = require('express');
let signin = require('../../public/model/DataAccessObject/signin.js');
let logo = require('../../public/model/DataAccessObject/logo.js');
let cart = require('../../public/model/DataAccessObject/cart.js');
let product = require('../../public/model/DataAccessObject/product.js');
let s3_credential = require('../../public/model/util/aws.json');
let router = express.Router();
let multer = require('multer');
let multerS3 = require('multer-s3');
let AWS = require('aws-sdk');

//s3 logo uploader
let host_logo_upload = multer({
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

let user_logo_upload = multer({
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


let product_upload = multer({
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

  let role = req.cookies.role;
  let token = req.cookies.token;

  if (!role || !token) {
    res.redirect('/signin');
  } else {
    signin.personCookieCheck(role, token).then(loginStatus => {
      if (loginStatus.status == 'ok') {
        logo.getLogoImgPath(loginStatus.role, loginStatus.email).then(logoPath => {
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


  let role = req.cookies.role;
  let token = req.cookies.token;
  let profileList = req.params.list;
  console.log('profileList == ',profileList);
  if (!role || !token) {
    res.redirect('/signin');
  } else {

    signin.personCookieCheck(role, token).then(loginStatus => {
      if (loginStatus.status == 'ok') {
        logo.getLogoImgPath(loginStatus.role, loginStatus.email).then(logoPath => {
          loginStatus.logo = logoPath.logo;


          if (loginStatus.role == 'host') {
            switch (profileList) {
              case 'settings':
                res.render('./profile/settings', { title: title, loginStatus: loginStatus });
                break;
              case 'product_upload':
                res.render('./profile/product_upload', { title: title, loginStatus: loginStatus });
                break;
              case 'host_products':
                res.render('./profile/host_products', { title: title, loginStatus: loginStatus });
                break;
              case 'logout':
                res.clearCookie('role');
                res.clearCookie('token');

                res.redirect('/signin');
                break;
              default:
                res.render('./profile/settings', { title: title, loginStatus: loginStatus });
            }
          } else if (loginStatus.role == 'user') {
            switch (profileList) {
              case 'settings':
                res.render('./profile/settings', { title: title, loginStatus: loginStatus });
                break;
              case 'cartlist':
                res.render('./profile/cartlist', { title: title, loginStatus: loginStatus });
                break;
              case 'orderlist':
                res.render('./profile/orderlist', { title: title, loginStatus: loginStatus });
                break;
              case 'logout':
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
  logo.UpdateLogoPath(filename, 'host', current_host_email).then(UpdatedResult => {
    res.redirect({ status: 'updated logo path to host database' });
  }).catch(err => {
    res.json({ status: err });
  })
})


router.post('/user_logo_upload', user_logo_upload.single('logo'), function (req, res) {
  const role = req.body.role;
  const filename = req.file.location;
  const current_user_email = req.body.email;
  logo.UpdateLogoPath(filename, 'user', current_user_email).then(UpdatedResult => {
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



module.exports = router;
