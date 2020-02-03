const crypto = require('crypto');
// MySQL Initialization
const database = require("../util/rds_mysql.js");
// Build DAO Object
module.exports = {
	userSignInCheck: function (username, password) {
		return new Promise(function (resolve, reject) {

			database.connection.query(`select * from userlist where name='${username}' AND password='${passwordEncryption(password)}';`, function (error, usercheck, fields) {
				if (error) {
					reject("[Database Error]" + error);
				} else {
					resolve(usercheck);
				}
			});
		});
	},

	hostSignInCheck: function (hostname, password) {
		return new Promise(function (resolve, reject) {
			database.connection.query(`select * from hostlist where name='${hostname}' AND password='${passwordEncryption(password)}';`, function (error, hostcheck, fields) {
				if (error) {
					reject("[Database Error] " + error);
				} else {
					console.log('host: ', hostcheck);
					resolve(hostcheck);
				}
			});
		});
	},
	personCookieCheck: function (role, token) {
		return new Promise(function (resolve, reject) {
			var loginStatus = {
				role: '',
				status: '',
				name: '',
				email: '',
				stream_token: ''
			};
			if (role == 'user') {
				database.connection.query(`select * from userlist where login_access_token='${token}';`, function (error, hostcookiecheck, fields) {
					if (error) {
						reject("[Database Error] " + error);
					} else {
						if(hostcookiecheck.length == 0){
							loginStatus.role = 'user';
							loginStatus.status = 'none';
							resolve(loginStatus);
						}else{
							loginStatus.role = 'user';
							loginStatus.status = 'ok';
							loginStatus.name = hostcookiecheck[0].name;
							loginStatus.email = hostcookiecheck[0].email;
							resolve(loginStatus);
						}
					}
				});
			} else if (role == 'host') {
				database.connection.query(`select * from hostlist where login_access_token='${token}';`, function (error, hostcookiecheck, fields) {
					if (error) {
						reject("[Database Error] " + error);
					} else {
						if(hostcookiecheck.length == 0){
							loginStatus.role = 'host';
							loginStatus.status = 'none';
							resolve(loginStatus);
						}else{
							console.log(hostcookiecheck[0]);
							loginStatus.role = 'host';
							loginStatus.status = 'ok';
							loginStatus.name = hostcookiecheck[0].name;
							loginStatus.email = hostcookiecheck[0].email;
							loginStatus.stream_token = hostcookiecheck[0].stream_token;
							resolve(loginStatus);
						}
					}
				});
			}

		});
	}

};

function passwordEncryption(password) {
	const new_password = crypto.createHash('sha256').update(password, 'utf8').digest();
	const new_password_token = new_password.toString('hex');
	return new_password_token;
}