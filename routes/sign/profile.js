let express = require('express');
let signin = require('../../public/model/DataAccessObject/signin.js');
let logo = require('../../public/model/DataAccessObject/logo.js');
let cart = require('../../public/model/DataAccessObject/cart.js');
let product = require('../../public/model/DataAccessObject/product.js');
let credential = require('../../public/model/util/aws.json');
let router = express.Router();
let multer = require('multer');
let multerS3 = require('multer-s3');
let AWS = require('aws-sdk');
let requestPromise = require('request-promise');

//s3 logo uploader
let hostLogoUpload = multer({
  storage: multerS3({
    s3: new AWS.S3(credential),
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

let userLogoUpload = multer({
  storage: multerS3({
    s3: new AWS.S3(credential),
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


let productUpload = multer({
  storage: multerS3({
    s3: new AWS.S3(credential),
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

  if (!role || !token) {
    res.redirect('/signin');
  } else {

    signin.personCookieCheck(role, token).then(loginStatus => {
      if (loginStatus.status == 'ok') {
        logo.getLogoImgPath(loginStatus.role, loginStatus.email).then(logoPath => {
          loginStatus.logo = logoPath.logo;
          
          console.log('loginStatus == ',loginStatus);

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
        res.redirect('/signin');
      }
    }).catch((err) => {
      console.log(err);
    });
  };
});




router.post('/host_logo_upload', hostLogoUpload.single('logo'), function (req, res) {
  const role = req.body.role;
  const filename = req.file.location;
  const currentHostEmail = req.body.email;
  logo.updateLogoPath(filename, 'host', currentHostEmail).then(UpdatedResult => {
    res.redirect({ status: 'updated logo path to host database' });
  }).catch(err => {
    res.json({ status: err });
  })
})


router.post('/user_logo_upload', userLogoUpload.single('logo'), function (req, res) {
  const role = req.body.role;
  const filename = req.file.location;
  const currentUserEmail = req.body.email;
  logo.updateLogoPath(filename, 'user', currentUserEmail).then(UpdatedResult => {
    res.json({ status: 'updated logo path to user database' });
  }).catch(err => {
    res.json({ status: err });
  })

})


router.post('/product_upload', productUpload.single('image'), function (req, res) {
  const productName = req.body.name;
  const color = req.body.color;
  const size = req.body.size;
  const price = req.body.price;
  const description = req.body.description;
  const stock = req.body.stock;
  const email = req.body.email;
  const filepath = req.file.location;

  product.insertNewProduct(productName, color, size, price, description, stock, email, filepath, price)
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


router.post('/hostipaddress', function (req, res) {

  let ec2 = new AWS.EC2(credential);

  let params = {
    Filters: [
      {
        Name: "instance-type",
        Values: [
          "t2.micro"
        ]
      }
    ]
  };
  let allEC2InstaceDNS = [];
  let allEC2InstaceIp = [];
  ec2.describeInstances(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      for (let i = 0; i < data.Reservations.length; i++) {
        console.log(data.Reservations[i].Instances[0].PublicDnsName);
        if (data.Reservations[i].Instances[0].State.Code == 16) {
          allEC2InstaceDNS.push('http://' + data.Reservations[i].Instances[0].PublicDnsName + ':3000');
          allEC2InstaceIp.push('rtmp://' + data.Reservations[i].Instances[0].PublicIpAddress + '/live')
        }
      }

      Promise.all(generateMultipleServerRequest(allEC2InstaceDNS))
        .then(function (parsedBody) {
          // POST succeeded...
          console.log(parsedBody);
          let sort = findLowestInputNetworkOfServer(parsedBody);
          console.log('sort == ', sort);
          console.log('allEC2InstaceIp == ', allEC2InstaceIp);
          res.json({
            ip: allEC2InstaceIp[sort.lowestIndex]
          });
        })
        .catch(function (err) {
          // POST failed...
          res.json({ err: err })
        });
    }          // successful response
  });

})








function generateMultipleServerRequest(allEC2InstaceDNS) {

  //dead data
  let url = [
    'http://ec2-18-140-200-159.ap-southeast-1.compute.amazonaws.com:3000',
    'http://ec2-13-229-219-202.ap-southeast-1.compute.amazonaws.com:3000'
  ];

  console.log('allEC2InstaceIP == ', allEC2InstaceDNS);

  let requests = [];
  for (let u = 0; u < allEC2InstaceDNS.length; u++) {
    let opt = {
      method: 'POST',
      uri: allEC2InstaceDNS[u],
      body: {
        data: 1
      },
      json: true // Automatically stringifies the body to JSON
    };

    requests.push(requestPromise(opt));

  }

  return requests;

}




function findLowestInputNetworkOfServer(networkInputResults) {
  let lowest = 0;
  let highest = 0;
  let tmp;
  for (let i = networkInputResults.length - 1; i >= 0; i--) {
    tmp = networkInputResults[i].input;
    // find out the ip index of array with max and min d
    if (tmp <= lowest) lowest = i;
    if (tmp >= highest) highest = i;
  }
  let result = {
    highestIndex: highest,
    lowestIndex: lowest
  }
  return result;
}





module.exports = router;
