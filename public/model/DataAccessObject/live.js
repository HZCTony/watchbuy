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
				connection.beginTransaction(function (Transaction_err) {
					if (Transaction_err) {
						connection.rollback(function () {
							reject(Transaction_err);
						});
					}
					//const update_query = `UPDATE hostlist SET active='${updateStatus.status}' where stream_token='${updateStatus.stream_token}';`;
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
	getOnlyOneRoom: function (stream_token) {
		return new Promise(function (resolve, reject) {
			let getOnlyOneRoomQuery = `select id, name, stream_token, room_name, active from hostlist where stream_token=? ;`;
			let getOnlyOneRoomParam = [stream_token];
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

