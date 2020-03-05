var express = require('express');
var router = express.Router();
const stripe = require('stripe')('sk_test_JxwU8aWOHEeGy9lsAjIoQaAp004S8XdBcE');
var order = require('../public/model/DataAccessObject/order.js');
var cart = require('../public/model/DataAccessObject/cart.js');

router.get('/', function (req, res, next) {
  res.render('checkout', { secret: secret });
});

router.post('/', function (req, res, next) {
  const productsObjectOfOneOrder = req.body.AllProductIDinCart;
  const email = req.body.email;
  const amount = req.body.amount;
  (async () => {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: 'twd',
      payment_method_types: ['card'],
    });
    let insertOrderResult = await order.insertSingleOrder(email, productsObjectOfOneOrder, amount);
    await cart.deleteAllProductInCart(email);
    res.render('checkout', { secret: paymentIntent.client_secret, orderid: insertOrderResult.insertId });
  })();
});


router.post('/cancelOrder', function (req, res, next) {
  order.deleteSingleOrder(req.body.order).then(deletedOrderResult => {
    res.send(deletedOrderResult);
  })
});


router.post('/UpdateOrderStatus', function (req, res, next) {
  order.updateOrderStatus(req.body.order).then(deletedOrderResult => {
    res.send(deletedOrderResult);
  })
});


router.post('/GetAllOrders', async function (req, res, next) {

  // First, get all orders of a user
  let allOrdersOfOneUser = await order.getAllOrders(req.body.email);

  // Second, every order may have multiple images, so now parse every single order 
  for (let i = 0; i < allOrdersOfOneUser.length; i++) {
    let onlyOrderIdArray = [];
    let productsArray = JSON.parse(allOrdersOfOneUser[i].products);
    console.log(productsArray);

    // construct an array with all the product ids in current order
    for (let o = 0; o < productsArray[0].length; o++) {
      onlyOrderIdArray.push(productsArray[0][o].id);
    }
    // use all product ids of an order to get the corresponding images from products table
    let allImagesOfOneOrder = await order.getOrderImages(onlyOrderIdArray);
    console.log(allImagesOfOneOrder);
    for (let img = 0; img < allImagesOfOneOrder.length; img++) {
      for (c = 0; c < allImagesOfOneOrder.length; c++) {
        if (productsArray[0][img].id == String(allImagesOfOneOrder[c].id)) {
          productsArray[0][img].image = allImagesOfOneOrder[c].image;
        }
      };
    }
    allOrdersOfOneUser[i].products = productsArray[0];
  }
  res.send(allOrdersOfOneUser);
});
module.exports = router;
