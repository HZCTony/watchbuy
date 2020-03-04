// MySQL Initialization
const database = require("../util/rds_mysql.js");
// Build DAO Object
module.exports = {
	InsertSingleOrder: function (email, products_in_an_order, amount) {
		return new Promise(function (resolve, reject) {
			const InsertSingleOrderQuery = `INSERT INTO orderlist (email, products, amount, payment) VALUES( ?, ?, ?,'unpaid');`;
			const InsertSingleOrderParams = [email, products_in_an_order, amount];

			database.connection.getConnection(function (err, connection) {
				if (err) {
					reject(err);
				}
				connection.beginTransaction(function (Transaction_err) {
					if (Transaction_err) {
						connection.rollback(function () {
							reject(Transaction_err);
						});
					}
					connection.query(InsertSingleOrderQuery, InsertSingleOrderParams, function (error, insert_order_result, fields) {
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
								resolve(insert_order_result);
								connection.release();
							});
						}
					});
				});
			});
		})
	},
	DeleteSingleOrder: function (orderID) {
		return new Promise(function (resolve, reject) {
			//const DeleteSingleOrderQuery = `delete from orderlist where id='${orderID}';`;
			const DeleteSingleOrderQuery = `delete from orderlist where id=? ;`;
			const DeleteSingleOrderParam = [orderID];
			database.connection.getConnection(function (err, connection) {
				if (err) {
					reject(err);
				}
				connection.beginTransaction(function (Transaction_err) {
					if (Transaction_err) {
						connection.rollback(function () {
							reject(Transaction_err);
						});
					}
					connection.query(DeleteSingleOrderQuery, DeleteSingleOrderParam, function (error, Deleted_order_result, fields) {
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
								resolve(Deleted_order_result);
								connection.release();
							});
						}
					});
				});
			});
		})
	},
	UpdateOrderStatus: function (orderID) {
		return new Promise(function (resolve, reject) {
			//var UpdateOrderStatusQuery = `Update orderlist set payment='paid' where id='${orderID}';`;
			const UpdateOrderStatusQuery = `Update orderlist set payment='paid' where id=? ;`;
			const UpdateOrderStatusParam = [orderID];
			database.connection.getConnection(function (err, connection) {
				if (err) {
					reject(err);
				}
				connection.beginTransaction(function (Transaction_err) {
					if (Transaction_err) {
						connection.rollback(function () {
							reject(Transaction_err);
						});
					}
					connection.query(UpdateOrderStatusQuery, UpdateOrderStatusParam, function (error, Updated_order_result, fields) {
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
								resolve(Updated_order_result);
								connection.release();
							});
						}
					});
				});
			});
		})
	},
	GetAllOrders: function (email) {
		return new Promise(function (resolve, reject) {

			const GetAllOrdersQuery = `select * from orderlist where email=? ;`;
			const GetAllOrdersParam = [email];
			database.connection.query(GetAllOrdersQuery, GetAllOrdersParam, function (error, getBack_order_result, fields) {
				if (error) {
					reject("[Database Error]" + error);
				} else {
					resolve(getBack_order_result);
				}
			});
		})
	},
	GetOrderImages: function (id_array) {
		return new Promise(function (resolve, reject) {
			let ids_str = '';
			for (let id = 0; id < id_array.length; id++) {
				if (id == 0) {
					ids_str += String(id_array[id]);
				} else {
					ids_str += ',' + String(id_array[id]);
				}
			}
			const GetAllOrdersImageQuery = `select * from products where id IN (${ids_str});`;
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

