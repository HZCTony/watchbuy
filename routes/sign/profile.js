var express = require('express');
var signin = require('../../public/model/DataAccessObject/signin.js');
var Logo = require('../../public/model/DataAccessObject/Logo.js');
var s3_credential = require('../../public/model/util/aws.json');
var router = express.Router();
var multer = require('multer');
var multerS3 = require('multer-s3');
var AWS = require('aws-sdk');
//var s3 = require('../../public/model/util/s3uploader.js');

//s3 logo uploader
var upload = multer({
  storage: multerS3({
    s3: new AWS.S3(s3_credential),
    bucket: 'hzctonyforlive/logo',
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
        Logo.getLogoImgPath(loginStatus.role, loginStatus.email).then(logoPath=>{
          loginStatus.logo = logoPath.logo;
          console.log('loginStatus.logo == ',loginStatus.logo);
          res.render('profile', { title: title, loginStatus: loginStatus });
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


router.post('/logo_upload', upload.single('logo'), function (req, res) {
  const current_name = req.body.username;
  const role = req.body.role;
  const filename = req.file.key;
  const current_user_or_host_email = req.body.email;

  //big head or logo upload
  // var upload = multer({
  //   storage: multerS3({
  //     s3: new AWS.S3(s3_credential),
  //     bucket: 'hzctonyforlive/logo',
  //     acl: 'public-read',
  //     contentType: multerS3.AUTO_CONTENT_TYPE,
  //     metadata: function (req, file, cb) {
  //       cb(null, {fieldName: file.fieldname});
  //     },
  //     key: function (req, file, cb) {
  //       cb(null, Date.now().toString())// filename
  //     }
  //   })
  // }).fields([
  // 	{name:"logo", maxCount:1}
  // ]);	

  // upload(req, res, function(error){
  // 	if(error){
  // 		res.send({error:"Upload Images Error"});
  // 	}else{

  // 	}
  // });

  // rename S3 logo file name as a username
  var NEW_COPIED_KEY = '';
  if (role == 'host') {
    NEW_COPIED_KEY = 'host/' + current_name;
  } else if (BUCKET_NAME == 'user') {
    NEW_COPIED_KEY = 'user/' + current_name;
  }


  var renameS3Obj = new AWS.S3(s3_credential);
  var BUCKET_NAME = 'hzctonyforlive/logo'
  var OLD_KEY = "/" + filename;
  var NEW_KEY = NEW_COPIED_KEY;

  // Copy the object to a new location
  renameS3Obj.copyObject({
    Bucket: BUCKET_NAME,
    CopySource: `${BUCKET_NAME}${OLD_KEY}`,
    Key: NEW_KEY,
    ACL: 'public-read'
  }).promise().then(() =>
    // Delete the old object
    renameS3Obj.deleteObject({
      Bucket: BUCKET_NAME,
      Key: filename
    }).promise().then(function () {

      // save the logo path to AWS RDS 
      const new_s3_logo_path = 'https://hzctonyforlive.s3-ap-southeast-1.amazonaws.com/logo/' + NEW_COPIED_KEY;
      console.log(new_s3_logo_path);
      Logo.UpdateLogoPath(new_s3_logo_path, role, current_user_or_host_email).then(UpdatedResult =>{
        console.log(UpdatedResult);
        res.json({ url: 'renamed and update to database' });
      }).catch(err=>{
        res.json({ status : err });
      })

    })

  )
    // Error handling is left up to reader
    .catch((e) => console.error(e));


})



module.exports = router;
