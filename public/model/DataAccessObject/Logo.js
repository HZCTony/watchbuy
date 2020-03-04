// MySQL Initialization
const database = require("../util/rds_mysql.js");
// Build DAO Object
module.exports = {
	getLogoImgPath: function (role, email) {
		return new Promise(function (resolve, reject) {
			let getLogoQuery = '';
			if (role == 'user') {
				getLogoQuery = `select logo from userlist where email=? ;`
			} else if (role == 'host') {
				getLogoQuery = `select logo from hostlist where email=? ;`
			}
			const getLogoParams = [email];
				database.connection.query(getLogoQuery, getLogoParams, function (error, getLogoResult, fields) {
					if (error) {
						reject("[Database Error]" + error);
					} else {
						resolve(getLogoResult[0]);
					}
				});
		})
	},
	UpdateLogoPath: function (logoPath, role, email) {
		return new Promise(function (resolve, reject) {
			let updateQuery = '';
			if (role == 'user') {
				updateQuery = `UPDATE userlist SET logo=? where email=? ;`
			} else if (role == 'host') {
				updateQuery = `UPDATE hostlist SET logo=? where email=? ;`
			}
			const updateParams = [logoPath, email];

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
					});
				});
		})


	}

};

