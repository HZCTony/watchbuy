// MySQL Initialization
const database = require("../util/rds_mysql.js");
// Build DAO Object
module.exports = {
	getAllProductsInCart: function (email) {
		return new Promise(function (resolve, reject) {
			let getallproductsInCartQuery = `select * from cartlist where email=? ;`;
			const getAllProductsInCartParam = [email];
			database.connection.query(getallproductsInCartQuery, getAllProductsInCartParam, function (error, gotAllProductsInCart, fields) {
				if (error) {
					reject("[Database Error]" + error);
				} else {
					resolve(gotAllProductsInCart);
				}
			});
		})
	},
	insertSingleProducttoCart: function (role, email, productName, color, size, price, description, stock, filepath) {
		return new Promise(function (resolve, reject) {
			let findPersonIdQuery = '';
			if (role == 'user') {
				findPersonIdQuery = `select id from userlist where email=?;`;
			} else if (role == 'host') {
				findPersonIdQuery = `select id from hostlist where email=?;`;
			} else {
				reject('[cart.js]: No role existed');
			}
			const findpersonIdParam = [email];

			database.connection.getConnection(function (err, connection) {
				if (err) {
					reject(err);
				}
				connection.beginTransaction(function (transactionErr) {
					if (transactionErr) {
						connection.rollback(function () {
							reject(transactionErr);
						});
					}
					connection.query(findPersonIdQuery, findpersonIdParam, function (error, personID, fields) {
						if (error) {
							reject("[Database Error]" + error);
						} else {
							if (personID.length != 0) {
								// find real product_id
								const FindProductIdQuery = `select id from products where name=? AND image=? ;`;
								const FindProductIdParams = [productName, filepath];
								connection.query(FindProductIdQuery, FindProductIdParams, function (error, foundID, fields) {

									//check if there is a product in one's current cartlist
									const parseCurrentCartlistQuery = `select * from cartlist where email=? AND product_id=?;`;
									const parseCurrentCartlistParams = [email, foundID[0].id];
									connection.query(parseCurrentCartlistQuery, parseCurrentCartlistParams, function (error, ParsedCartlistResult, fields) {
										if (error) {
											reject("[Database Error]" + error);
										} else {

											// if there is no duplicate product, insert the new product into cartlist table, the count will be 1 at first;
											if (ParsedCartlistResult.length == 0) {
												const insertToCartQuery = `Insert into cartlist(role, email, name, size, color, image, stock, price, description, product_id, count)
																				VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?,'1');`;
												const insertToCartParams = [role, email, productName, size, color, filepath, stock, price, description, foundID[0].id];
												connection.query(insertToCartQuery, insertToCartParams, function (error, insertToCartResult, fields) {
													if (error) {
														reject("[Database Error] unable to insert a new data into cartlist" + error);
													} else {
														connection.commit(function (commitErr) {
															if (commitErr) {
																connection.rollback(function () {
																	connection.release();
																	reject(commitErr);
																});
															}
															resolve(insertToCartResult);
															connection.release();
														});
													}
												});
											}
											// Yes, there is an existed product in one's cartlist
											else {
												let currentCount = ParsedCartlistResult[0].count;
												let newCount = parseInt(currentCount) + 1;
												const updateCountQuery = `UPDATE cartlist SET count=? WHERE email=? AND product_id=?;`;
												const updateCountParams = [newCount, email, foundID[0].id];
												connection.query(updateCountQuery, updateCountParams, function (error, UpdatedCountResult, fields) {
													if (error) {
														reject("[Database Error]: unable to update count of an existed product in cartlist" + error);
													} else {
														connection.commit(function (commitErr) {
															if (commitErr) {
																connection.rollback(function () {
																	connection.release();
																	reject(commitErr);
																});
															}
															resolve(UpdatedCountResult);
															connection.release();
														});
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
				});
			});
		})
	},
	deleteProductInCart: function (email, productName) {
		return new Promise(function (resolve, reject) {
			let deleteProductInCartQuery = `delete from cartlist where email='${email}' AND name='${productName}';`;

			database.connection.getConnection(function (err, connection) {
				if (err) {
					reject(err);
				}

				connection.beginTransaction(function (transactionErr) {
					if (transactionErr) {
						connection.rollback(function () {
							reject(transactionErr);
						});
					}
					connection.query(deleteProductInCartQuery, function (error, gotAllProductsInCart, fields) {
						if (error) {
							reject("[Database Error]" + error);
						} else {
							connection.commit(function (commitErr) {
								if (commitErr) {
									connection.rollback(function () {
										connection.release();
										reject(commitErr);
									});
								}
								resolve(gotAllProductsInCart);
								connection.release();
							});
						}
					});
				});
			});
		})
	},
	deleteAllProductInCart: function (email) {
		return new Promise(function (resolve, reject) {
			const deleteAllProductInCartQuery = `delete from cartlist where email=? ;`;
			const deleteAllProductInCartParam = [email];

			database.connection.getConnection(function (err, connection) {
				if (err) {
					reject(err);
				}
				connection.beginTransaction(function (transactionErr) {
					if (transactionErr) {
						connection.rollback(function () {
							reject(transactionErr);
						});
					}
					connection.query(deleteAllProductInCartQuery, deleteAllProductInCartParam, function (error, gotAllProductsInCart, fields) {
						if (error) {
							reject("[Database Error]" + error);
						} else {
							connection.commit(function (commitErr) {
								if (commitErr) {
									connection.rollback(function () {
										connection.release();
										reject(commitErr);
									});
								}
								resolve(gotAllProductsInCart);
								connection.release();
							});
						}
					});
				});
			});
		})
	}

};

