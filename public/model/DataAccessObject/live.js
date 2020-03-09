// MySQL Initialization
const database = require("../util/rds_mysql.js");
// Build DAO Object
module.exports = {
	updateLiveActivation: function (updateStatus) {
		return new Promise(function (resolve, reject) {
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
					const updateQuery = `UPDATE hostlist SET active=? where stream_token=? ;`;
					const updateParams = [updateStatus.status, updateStatus.stream_token];
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
				})
			})
		})
	},
	getOnlyOneRoom: function (streamToken) {
		return new Promise(function (resolve, reject) {
			let getOnlyOneRoomQuery = `select id, name, stream_token, room_name, active, ec2id from hostlist where stream_token=? ;`;
			let getOnlyOneRoomParam = [streamToken];
			database.connection.query(getOnlyOneRoomQuery, getOnlyOneRoomParam, function (error, room, fields) {
				if (error) {
					reject("[Database Error]" + error);
				} else {
					resolve(room);
				}
			});
		})
	}

};

