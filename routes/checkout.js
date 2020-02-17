var express = require('express');
var router = express.Router();
const stripe = require('stripe')('sk_test_JxwU8aWOHEeGy9lsAjIoQaAp004S8XdBcE');
var order = require('../public/model/DataAccessObject/order.js');


/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('checkout', { secret: secret });
});

router.post('/', function (req, res, next) {
  const Products_object_of_an_order = req.body.AllProductIDinCart;
  const email = req.body.email;
  const amount = req.body.amount;
  (async () => {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: 'usd',
      payment_method_types: ['card'],
    });
    console.log('paymentIntent == ', paymentIntent.client_secret);

    //get all product IDs in products first



    //insert data to orderlist table after getting the client_secret code 
    order.InsertSingleOrder(email, Products_object_of_an_order, amount).then(insert_order_result => {
      console.log('insert_order_result ==\n', insert_order_result.insertId);
      res.render('checkout', { secret: paymentIntent.client_secret, orderid: insert_order_result.insertId });
    })

  })();


});

router.post('/cancelOrder', function (req, res, next) {
  console.log('In cancelOrder: ', req.body);
  order.DeleteSingleOrder(req.body.order).then(Deleted_order_result => {
    res.send(Deleted_order_result);
  })
});


router.post('/UpdateOrderStatus', function (req, res, next) {
  console.log('In UpdateOrderStatus: ', req.body);
  order.UpdateOrderStatus(req.body.order).then(Deleted_order_result => {
    res.send(Deleted_order_result);
  })
});


router.post('/GetAllOrders', async function (req, res, next) {

  // First, get all orders of a user
  let All_Orders_of_A_User = await order.GetAllOrders(req.body.email);

  // Second, every order may have multiple images, so now parse every single order 
  for (let i = 0; i < All_Orders_of_A_User.length; i++) {
    let only_orderID_array = [];
    products_array = JSON.parse(All_Orders_of_A_User[i].products);

    // construct an array with all the product ids in current order
    for (let o = 0; o < products_array[0].length; o++) {
      only_orderID_array.push(products_array[0][o].id);
    }
    // use all product ids of an order to get the corresponding images from products table
    let All_images_of_an_Order = await order.GetOrderImages(only_orderID_array);
    for (let img = 0; img < All_images_of_an_Order.length; img++) {
      
      console.log('All_images_of_an_Order == ',All_images_of_an_Order);

      for( c=0; c<All_images_of_an_Order.length; c++ ){
        if(products_array[0][img].id == All_images_of_an_Order[c].id){
          products_array[0][img].image = All_images_of_an_Order[c].image;
        }
      };

      //products_array[0][img].image = All_images_of_an_Order[img].image;   
    }

    All_Orders_of_A_User[i].products = products_array[0];
  }

  res.send(All_Orders_of_A_User);

});
module.exports = router;