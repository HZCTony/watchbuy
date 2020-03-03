// MySQL Initialization
const database = require("../util/rds_mysql.js");
// Build DAO Object
module.exports = {
	InsertSingleOrder: function (email, products_in_an_order, amount) {
		return new Promise(function (resolve, reject) {
			var InsertSingleOrder_query = `INSERT INTO orderlist (email,products,amount,payment) VALUES('${email}','${products_in_an_order}','${amount}','unpaid');`;

			if (InsertSingleOrder_query != '') {
				database.connection.query(InsertSingleOrder_query, function (error, insert_order_result, fields) {
					if (error) {
						reject("[Database Error]" + error);
					} else {
						resolve(insert_order_result);
					}
				});
			} else {
				reject("[Database Query Error]: query of insert_order_result is not available");
			}
		})
	},
	DeleteSingleOrder: function (orderID) {
		return new Promise(function (resolve, reject) {

			var DeleteSingleOrder_query = `delete from orderlist where id='${orderID}'`;

			if (DeleteSingleOrder_query != '') {
				database.connection.query(DeleteSingleOrder_query, function (error, Deleted_order_result, fields) {
					if (error) {
						reject("[Database Error]" + error);
					} else {
						resolve(Deleted_order_result);
					}
				});
			} else {
				reject("[Database Query Error]: query of Deleted_order_result is not available");
			}
		})
	},
	UpdateOrderStatus: function (orderID) {
		return new Promise(function (resolve, reject) {

			var UpdateOrderStatus_query = `Update orderlist set payment='paid' where id='${orderID}'`;

			if (UpdateOrderStatus_query != '') {
				database.connection.query(UpdateOrderStatus_query, function (error, Updated_order_result, fields) {
					if (error) {
						reject("[Database Error]" + error);
					} else {
						resolve(Updated_order_result);
					}
				});
			} else {
				reject("[Database Query Error]: query of Updated_order_result is not available");
			}
		})
	},
	GetAllOrders: function (email) {
		return new Promise(function (resolve, reject) {

			var GetAllOrders_query = `select * from orderlist where email='${email}'`;

			if (GetAllOrders_query != '') {
				database.connection.query(GetAllOrders_query, function (error, getBack_order_result, fields) {
					if (error) {
						reject("[Database Error]" + error);
					} else {
						resolve(getBack_order_result);
					}
				});
			} else {
				reject("[Database Query Error]: query of Updated_order_result is not available");
			}
		})
	},
	GetOrderImages: function (id_array) {
		return new Promise(function (resolve, reject) {
			console.log('id_array ==',id_array);
			let ids_str = '';

			for(let id=0; id<id_array.length; id++){
					//console.log('ids[id] ==',String(ids[id]));
					if(id == 0){
						ids_str += String(id_array[id]);
					}else{
						ids_str += ','+ String(id_array[id]);
					}
			}
			var GetAllOrdersImage_query = `select * from products where id IN (${ids_str});`;
			if (GetAllOrdersImage_query != '') {
				database.connection.query(GetAllOrdersImage_query, function (error, GotImages, fields) {
					if (error) {
						reject("[Database Error]" + error);
					} else {
						resolve(GotImages);
					}
				});
			} else {
				reject("[Database Query Error]: query of Updated_order_result is not available");
			}
		})
	}




};

