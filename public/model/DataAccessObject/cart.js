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
	InsertSingleProducttoCart: function (role,  email, productName, color, size, price, description, stock, filepath) {
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
						var insertToCart_query = `Insert into cartlist(role, email, name, size, color, image, stock, price, description)
											VALUES('${role}','${email}','${productName}','${size}','${color}','${filepath}','${stock}', '${price}', '${description}');`;
						console.log(insertToCart_query);
						if (insertToCart_query != '') {
							database.connection.query(insertToCart_query, function (error, UpdatedResult, fields) {
								if (error) {
									reject("[Database Error]" + error);
								} else {
									resolve(UpdatedResult);
								}
							});
						} else {
							reject("[Database Query Error]: query of inserting data into cartlist is not available");
						}
					}else{
						reject("[Database Query Error]: no user existed");
					}
				}
			});


		})
	},
	deleteProductInCart: function(email, productName){
		return new Promise(function (resolve, reject) {
			var getallproductsInCart_query = `delete from cartlist where email='${email}' AND name='${productName}';`;
			if (getallproductsInCart_query != '') {
				database.connection.query(getallproductsInCart_query, function (error, gotAllProductsInCart, fields) {
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

