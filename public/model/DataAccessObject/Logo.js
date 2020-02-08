// MySQL Initialization
const database = require("../util/rds_mysql.js");
// Build DAO Object
module.exports = {
	getLogoImgPath: function (role, email) {
		return new Promise(function (resolve, reject) {
			var update_query = '';
			if (role == 'user') {
				get_logo_query = `select logo from userlist where email='${email}';`
			} else if (role == 'host') {
				get_logo_query = `select logo from hostlist where email='${email}';`
			}
			if (get_logo_query != '') {
				database.connection.query(get_logo_query, function (error, getLogoResult, fields) {
					if (error) {
						reject("[Database Error]" + error);
					} else {
						resolve(getLogoResult[0]);
					}
				});
			} else {
				reject("[Database Query Error]: query of Update Logo Path is not available");
			}
		})
	},
	UpdateLogoPath: function (logoPath, role, email) {
		return new Promise(function (resolve, reject) {
			var update_query = '';
			if (role == 'user') {
				update_query = `UPDATE userlist SET logo='${logoPath}' where email='${email}';`
			} else if (role == 'host') {
				update_query = `UPDATE hostlist SET logo='${logoPath}' where email='${email}';`
			}
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
		})
	}

};

