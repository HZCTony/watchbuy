// MySQL Initialization
const database = require("../util/rds_mysql.js");
// Build DAO Object
module.exports = {
	getAllProducts: function (stream_token) {
		return new Promise(function (resolve, reject) {

			var gethostid_query = `select id from hostlist where stream_token='${stream_token}';`;
			database.connection.query(gethostid_query, function (error, hostid, fields) {
				if (error) {
					reject("[Database Error]" + error);
				} else {
					var getAllProducts_query = `select image from products where hostid='${hostid[0].id}';`;
					if (getAllProducts_query != '') {
						database.connection.query(getAllProducts_query, function (error, gotAllProducts, fields) {
							if (error) {
								reject("[Database Error]" + error);
							} else {
								resolve(gotAllProducts);
							}
						});
					} else {
						reject("[Database Query Error]: query of Update Logo Path is not available");
					}
				}
			});



		})
	},
	getaSingleProduct: function (image) {
		return new Promise(function (resolve, reject) {
			var getaSingleProduct_query = `select name,size,color,image,stock,description,price from products where image='${image}'`;
			if (getaSingleProduct_query != '') {
				database.connection.query(getaSingleProduct_query, function (error, singleProduct, fields) {
					if (error) {
						reject("[Database Error]" + error);
					} else {
						resolve(singleProduct[0]);
					}
				});
			} else {
				reject("[Database Query Error]: query of Update Logo Path is not available");
			}
		})
	},
	InsertNewProduct: function (productName, color, size, price, description, stock, email, filepath, price) {
		return new Promise(function (resolve, reject) {

			//find hostid
			const FindHostId_query = `select id from hostlist where email='${email}';`;
			database.connection.query(FindHostId_query, function (error, HostID, fields) {
				if (error) {
					reject("[Database Error]" + error);
				} else {
					console.log('HostID[0].id == ', HostID[0].id);
					var update_query = `Insert into products(hostid, host_email, name, size, color, image, stock, description, price)
										VALUES('${HostID[0].id}', '${email}','${productName}','${size}','${color}','${filepath}','${stock}','${description}', '${price}');`;
					console.log(update_query);
					if (update_query != '') {
						database.connection.query(update_query, function (error, UpdatedResult, fields) {
							if (error) {
								reject("[Database Error]" + error);
							} else {
								resolve(UpdatedResult);
							}
						});
					} else {
						reject("[Database Query Error]: query of Update Logo Path is not available");
					}


				}
			});


		})
	}

};

