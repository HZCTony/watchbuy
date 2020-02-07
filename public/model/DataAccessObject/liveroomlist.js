// MySQL Initialization
const database = require("../util/rds_mysql.js");
// Build DAO Object
module.exports = {
	getAllRooms: function () {
		return new Promise(function (resolve, reject) {

			database.connection.query(`select id,name,stream_token,room_name,active from hostlist;`, function (error, rooms, fields) {
				if (error) {
					reject("[Database Error]" + error);
				} else {
					resolve(rooms);
				}
			});
		})
	}

};

