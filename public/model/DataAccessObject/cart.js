// MySQL Initialization
const database = require("../util/rds_mysql.js");
// Build DAO Object
module.exports = {
	getAllProductsInCart: function (email) {
		return new Promise(function (resolve, reject) {
			var getallproductsInCart_query = `select * from cartlist where email='${email}';`;
			if (getallproductsInCart_query != '') {
				database.connection.query(getallproductsInCart_query, function (error, gotAllProductsInCart, fields) {
					if (error) {
						reject("[Database Error]" + error);
					} else {
						resolve(gotAllProductsInCart);
					}
				});
			} else {
				reject("[Database Query Error]: query of getting all product of a user's cart is not available");
			}
		})
	},
	InsertSingleProducttoCart: function (role, email, productName, color, size, price, description, stock, filepath) {
		return new Promise(function (resolve, reject) {
			let FindpersonId_query = '';
			if (role == 'user') {
				FindpersonId_query = `select id from userlist where email='${email}';`;
			} else if (role == 'host') {
				FindpersonId_query = `select id from hostlist where email='${email}';`;
			} else {
				reject('[cart.js]: No role existed');
			}
			database.connection.query(FindpersonId_query, function (error, personID, fields) {
				if (error) {
					reject("[Database Error]" + error);
				} else {
					if (personID.length != 0) {

						// find real product_id
						let FindProductId_query = `select id from products where name='${productName}' AND image='${filepath}';`;
						database.connection.query(FindProductId_query, function (error, foundID, fields) {

							//check if there is a product in one's current cartlist
							let parse_current_cartlist_query = `select * from cartlist where email='${email}' AND product_id='${foundID[0].id}';`;
							database.connection.query(parse_current_cartlist_query, function (error, ParsedCartlistResult, fields) {
								if (error) {
									reject("[Database Error]" + error);
								} else {

									// if there is no duplicate product, insert the new product into cartlist table, the count will be 1 at first;
									if (ParsedCartlistResult.length == 0) {
										let insertToCart_query = `Insert into cartlist(role, email, name, size, color, image, stock, price, description, product_id, count)
											VALUES('${role}','${email}','${productName}','${size}','${color}','${filepath}','${stock}', '${price}', '${description}', '${foundID[0].id}','1');`;
										console.log(insertToCart_query);
										if (insertToCart_query != '') {
											database.connection.query(insertToCart_query, function (error, insertToCartResult, fields) {
												if (error) {
													reject("[Database Error] unable to insert a new data into cartlist" + error);
												} else {
													resolve(insertToCartResult);
												}
											});
										} else {
											reject("[Database Query Error]: query of inserting data into cartlist is not available");
										}
									}
									// Yes, there is an existed product in one's cartlist
									else {
										let current_count = ParsedCartlistResult[0].count;
										let new_count =	parseInt(current_count) + 1;
										let Update_count_query = `UPDATE cartlist SET count='${new_count}' WHERE email='${email}' AND product_id='${foundID[0].id}';`;
										console.log('Update_count_query ==',Update_count_query);
										database.connection.query(Update_count_query, function (error, UpdatedCountResult, fields) {
											if (error) {
												reject("[Database Error]: unable to update count of an existed product in cartlist" + error);
											} else {
												resolve(UpdatedCountResult);
											}
										});
									}
								}
							});
						});

					} else {
						reject("[Database Query Error]: no user existed");
					}

				}
			});


		})
	},
	deleteProductInCart: function (email, productName) {
		return new Promise(function (resolve, reject) {
			var deleteProductInCart_query = `delete from cartlist where email='${email}' AND name='${productName}';`;
			if (deleteProductInCart_query != '') {
				database.connection.query(deleteProductInCart_query, function (error, gotAllProductsInCart, fields) {
					if (error) {
						reject("[Database Error]" + error);
					} else {
						resolve(gotAllProductsInCart);
					}
				});
			} else {
				reject("[Database Query Error]: query of deleting product in cart is not available");
			}
		})
	},
	deleteAllProductInCart: function (email) {
		return new Promise(function (resolve, reject) {
			var deleteAllProductInCart_query = `delete from cartlist where email='${email}';`;
			if (deleteAllProductInCart_query != '') {
				database.connection.query(deleteAllProductInCart_query, function (error, gotAllProductsInCart, fields) {
					if (error) {
						reject("[Database Error]" + error);
					} else {
						resolve(gotAllProductsInCart);
					}
				});
			} else {
				reject("[Database Query Error]: query of deleting product in cart is not available");
			}
		})
	}

};

