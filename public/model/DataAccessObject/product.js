// MySQL Initialization
const database = require("../util/rds_mysql.js");
// Build DAO Object
module.exports = {
	getAllProducts: function (streamToken) {
		return new Promise(function (resolve, reject) {
			const getHostIdQuery = `select id from hostlist where stream_token=? ;`;
			const getHostIdParam = [streamToken];
			database.connection.query(getHostIdQuery, getHostIdParam, function (error, hostid, fields) {
				if (error) {
					reject("[Database Error]" + error);
				} else {
					const getAllProductsQuery = `select name, size, color, image, stock, description, price from products where hostid=? ;`;
					const getAllProductsParam = [hostid[0].id];

					database.connection.query(getAllProductsQuery, getAllProductsParam, function (error, gotAllProducts, fields) {
						if (error) {
							reject("[Database Error]" + error);
						} else {
							resolve(gotAllProducts);
						}
					});
				}
			});
		})
	},
	getSingleProduct: function (image) {
		return new Promise(function (resolve, reject) {
			const getaSingleProductQuery = `select name, size, color, image, stock, description, price from products where image=? ;`;
			const getaSingleProductParam = [image];
				database.connection.query(getaSingleProductQuery, getaSingleProductParam, function (error, singleProduct, fields) {
					if (error) {
						reject("[Database Error]" + error);
					} else {
						resolve(singleProduct[0]);
					}
				});
		})
	},
	insertNewProduct: function (productName, color, size, price, description, stock, email, filepath, price) {
		return new Promise(function (resolve, reject) {
			//find hostid
			const FindHostIdQuery = `select id from hostlist where email=?;`;
			const FindHostIdParam = [email];
			database.connection.getConnection(function (err, connection) {
				if (err) {
					reject(err);
				}
				connection.query(FindHostIdQuery, FindHostIdParam, function (FindIderror, HostID, fields) {
					if (FindIderror) {
						reject("[Database Error]" + FindIderror);
					} else {
						let updateQuery = `Insert into products(hostid, host_email, name, size, color, image, stock, description, price)
							VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);`;
						const updateParams = [HostID[0].id, email, productName, size, color, filepath, stock, description, price];
						connection.query(updateQuery, updateParams, function (error, UpdatedResult, fields) {
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
									resolve(UpdatedResult);
									connection.release();
								});
							}
						});
					}
				});
			});
		})
	},
	getAllHostOwnedProducts: function (email) {
		return new Promise(function (resolve, reject) {
			// `select id, email from hostlist where email='${email}';`;
			const checkhostQuery = `select id, email from hostlist where email=? ;`;
			const checkhostParam = [email];
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
					connection.query(checkhostQuery, checkhostParam, function (error, hostid, fields) {
						if (error) {
							reject("[Database Error]" + error);
							connection.release();
						} else {
							//`select id,name,size,color,image,stock,description,price from products where host_email='${hostid[0].email}';`;
							const getAllHostOwnedProductsQuery = `select id, name, size, color, image, stock, description, price from products where host_email=? ;`;
							const getAllHostOwnedProductsParam = [hostid[0].email];
							connection.query(getAllHostOwnedProductsQuery, getAllHostOwnedProductsParam, function (error, gotProducts, fields) {
								if (error) {
									reject("[Database Error]" + error);
								} else {
									resolve(gotProducts);
									connection.release();
								}
							});
						}
					});
				});
			});
		})
	}
};

