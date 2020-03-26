// MySQL Initialization
const database = require("../util/rds_mysql.js");
// Build DAO Object
module.exports = {
	insertSingleOrder: function (email, productsInOneOrder, amount) {
		return new Promise(function (resolve, reject) {
			const InsertSingleOrderQuery = `INSERT INTO orderlist (email, products, amount, payment) VALUES( ?, ?, ?,'unpaid');`;
			const InsertSingleOrderParams = [email, productsInOneOrder, amount];

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
					connection.query(InsertSingleOrderQuery, InsertSingleOrderParams, function (error, insertOrderResult, fields) {
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
								resolve(insertOrderResult);
								connection.release();
							});
						}
					});
				});
			});
		})
	},
	deleteSingleOrder: function (orderID) {
		return new Promise(function (resolve, reject) {
			//const DeleteSingleOrderQuery = `delete from orderlist where id='${orderID}';`;
			const DeleteSingleOrderQuery = `delete from orderlist where id=? ;`;
			const DeleteSingleOrderParam = [orderID];
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
					connection.query(DeleteSingleOrderQuery, DeleteSingleOrderParam, function (error, deletedOrderResult, fields) {
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
								resolve(deletedOrderResult);
								connection.release();
							});
						}
					});
				});
			});
		})
	},
	updateOrderStatus: function (orderID) {
		return new Promise(function (resolve, reject) {
			//let UpdateOrderStatusQuery = `Update orderlist set payment='paid' where id='${orderID}';`;
			const UpdateOrderStatusQuery = `Update orderlist set payment='paid' where id=? ;`;
			const UpdateOrderStatusParam = [orderID];
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
					connection.query(UpdateOrderStatusQuery, UpdateOrderStatusParam, function (error, updatedOrderResult, fields) {
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
								resolve(updatedOrderResult);
								connection.release();
							});
						}
					});
				});
			});
		})
	},
	getAllOrders: function (email) {
		return new Promise(function (resolve, reject) {

			const GetAllOrdersQuery = `select * from orderlist where email=? ;`;
			const GetAllOrdersParam = [email];
			database.connection.query(GetAllOrdersQuery, GetAllOrdersParam, function (error, getBackOrderResult, fields) {
				if (error) {
					reject("[Database Error]" + error);
				} else {
					resolve(getBackOrderResult);
				}
			});
		})
	},
	getOrderImages: function (idArray) {
		return new Promise(function (resolve, reject) {
			let idsString = '';
			for (let id = 0; id < idArray.length; id++) {
				if (id == 0) {
					idsString += String(idArray[id]);
				} else {
					idsString += ',' + String(idArray[id]);
				}
			}
			const GetAllOrdersImageQuery = `select * from products where id IN (${idsString});`;
			database.connection.query(GetAllOrdersImageQuery, function (error, GotImages, fields) {
				if (error) {
					reject("[Database Error]" + error);
				} else {
					resolve(GotImages);
				}
			});
		})
	}
};

