// MySQL Initialization
const database = require("../util/rds_mysql.js");
// Build DAO Object
module.exports = {
	getAllRooms: function () {
		return new Promise(function (resolve, reject) {
			const getAllRoomsQuery = `select id, name, stream_token, room_name, active, logo from hostlist;`;
			database.connection.query(getAllRoomsQuery, function (error, rooms, fields) {
				if (error) {
					reject("[Database Error]" + error);
				} else {
					resolve(rooms);
				}
			});
		})
	}

};

