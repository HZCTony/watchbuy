// MySQL Initialization
const database = require("../util/rds_mysql.js");
// Build DAO Object
module.exports = {
	updateLiveActivation: function (updateStatus) {
		return new Promise(function (resolve, reject) {
			const update_query = `UPDATE hostlist SET active='${updateStatus.status}' where stream_token='${updateStatus.stream_token}';`
			database.connection.query(update_query, function (error, UpdatedResult, fields) {
				if (error) {
					reject("[Database Error]" + error);
				} else {
					resolve(UpdatedResult);
				}
			});
		})
	},
	getOnlyOneRoom: function (stream_token) {
		return new Promise(function (resolve, reject) {

			database.connection.query(`select id,name,stream_token,room_name,active from hostlist where stream_token='${stream_token}';`, function (error, room, fields) {
				if (error) {
					reject("[Database Error]" + error);
				} else {
					resolve(room);
				}
			});
		})
	}

};

