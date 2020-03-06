const crypto = require('crypto');
const config = require('./config.json');
// MySQL Initialization
const database = require("../util/rds_mysql.js");
// Build DAO Object
module.exports = {
	userSignInCheck: function (username, password, email) {
		return new Promise(function (resolve, reject) {
			const userSignInCheckQuery = `select * from userlist where name=? AND password=? AND email=? ;`;
			const userSignInCheckParams = [username, passwordEncryption(password), email];
			database.connection.query(userSignInCheckQuery, userSignInCheckParams, function (error, userCheck, fields) {
				if (error) {
					reject("[Database Error]" + error);
				} else {
					resolve(userCheck);
				}
			});
		});
	},
	hostSignInCheck: function (hostname, password, email) {
		return new Promise(function (resolve, reject) {
			const hostSignInCheckQuery = `select * from hostlist where name=? AND password=? AND email=? ;`;
			const hostSignInCheckParams = [hostname, passwordEncryption(password), email];
			database.connection.query(hostSignInCheckQuery, hostSignInCheckParams, function (error, hostCheck, fields) {
				if (error) {
					reject("[Database Error] " + error);
				} else {
					resolve(hostCheck);
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
				streamToken: ''
			};
			if (role == 'user') {
				cookieCheckQuery = `select * from userlist where login_access_token=? ;`;
				cookieCheckParam = [token];
				database.connection.query(cookieCheckQuery, cookieCheckParam, function (error, userCookieCheck, fields) {
					if (error) {
						reject("[Database Error] " + error);
					} else {
						if (userCookieCheck.length == 0) {
							loginStatus.role = 'user';
							loginStatus.status = 'none';
							resolve(loginStatus);
						} else {

							loginStatus.role = 'user';
							loginStatus.status = expireCalculation(userCookieCheck[0].expire_time);
							loginStatus.name = userCookieCheck[0].name;
							loginStatus.email = userCookieCheck[0].email;
							resolve(loginStatus);
						}
					}
				});
			} else if (role == 'host') {
				hostCookieQuery = `select * from hostlist where login_access_token=? ;`;
				hostCookieParam = [token];
				database.connection.query(hostCookieQuery, hostCookieParam, function (error, hostCookieCheck, fields) {
					if (error) {
						reject("[Database Error] " + error);
					} else {
						if (hostCookieCheck.length == 0) {
							loginStatus.role = 'host';
							loginStatus.status = 'none';
							resolve(loginStatus);
						} else {
							loginStatus.role = 'host';
							loginStatus.status = expireCalculation(hostCookieCheck[0].expire_time);
							loginStatus.name = hostCookieCheck[0].name;
							loginStatus.email = hostCookieCheck[0].email;
							loginStatus.streamToken = hostCookieCheck[0].stream_token;
							resolve(loginStatus);
						}
					}
				});
			} else {
				reject("No user or host.");
			}
		});
	},

	updateLoginAccessToken: function (role, email) {
		return new Promise(function (resolve, reject) {
			Updated = loginTokenGenerator(email);
			let UpdateloginInfoQuery = '';
			if (role == 'user') {
				UpdateloginInfoQuery = `Update userlist SET login_access_token=?, expire_time=? where email=? ;`;
			} else if (role == 'host') {
				UpdateloginInfoQuery = `Update hostlist SET login_access_token=?, expire_time=? where email=? ;`;
			}
			const UpdateloginInfoParams = [Updated.loginAccessToken, Updated.expire, email];

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
					connection.query(UpdateloginInfoQuery, UpdateloginInfoParams, function (error, updateTokenAndExpireResult, fields) {
						if (error) {
							reject("[Database Error] " + error);
						} else {
							connection.commit(function (commitErr) {
								if (commitErr) {
									connection.rollback(function () {
										connection.release();
										reject(commitErr);
									});
								}
								console.log('Updated.login_access_token == ',Updated.loginAccessToken);
								resolve(Updated.loginAccessToken);
								connection.release();
							});
						}
					});
				});
			});
		})
	}

};

function passwordEncryption(password) {
	const newPassword = crypto.createHash('sha256').update(password, 'utf8').digest();
	const newPasswordToken = newPassword.toString('hex');
	return newPasswordToken;
}


// every host and user should have an access token
function loginTokenGenerator(email) {
	const date = new Date();
	const temp = date.setSeconds(date.getSeconds() + config.access_expired_sec);
	const expireDate = new Date(temp);
	const newAccess = email + String(expireDate);

	// generate login access token
	const newAccessToken = crypto.createHash('sha256').update(newAccess, 'utf8').digest();
	const loginAccessToken = newAccessToken.toString('hex');

	var res_obj = {
		expire: expireDate.toString(),
		loginAccessToken: loginAccessToken
	}

	return res_obj;
}


function expireCalculation(expireTime) {

	const current = new Date();
	const expire = new Date(expireTime);
	const difference = (expire - current) / 1000;
	var expireJudgement = '';

	if (difference > 0) {
		expireJudgement = 'ok';
	} else {
		expireJudgement = 'not ok';
	}
	return expireJudgement;

}