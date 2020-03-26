const crypto = require('crypto');
const config = require('./config.json');
// MySQL Initialization
const database = require("../util/rds_mysql.js");
// Build DAO Object
module.exports = {
	userSignUp: function (name, password, email, loginAccessToken, expireTime) {
		return new Promise(function (resolve, reject) {
			function checkDuplicatedName(useremail) {
				return new Promise(function (resolve, reject) {
					const checkUserSignUpQuery = `select * from userlist where email=? ;`
					const checkUserSignUpParam = [useremail];
					database.connection.query(checkUserSignUpQuery, checkUserSignUpParam, function (error, usernamecheck, fields) {
						if (error) {
							reject("[Database Error] " + error);
						} else {
							resolve(usernamecheck);
						}
					});
				});
			}

			function insertUserSignUpInfo(name, password, email, loginAccessToken, expireTime) {
				return new Promise(function (resolve, reject) {
					const insert = `Insert into userlist(name ,password, email, login_access_token, expire_time) 
									values(?, ?, ?, ?, ?);`;
					const insertparams = [name, password, email, loginAccessToken, expireTime];
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
							connection.query(insert, insertparams, function (error, insertedHostCheck, fields) {
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
										resolve(insertedHostCheck);
										connection.release();
									});
								}
							});
						});
					})
				});
			}

			async function userSignUpProcess() {
				let duplicatedUserNameorNot = await checkDuplicatedName(email);
				const passwordEcripted = passwordEncryption(password);
				if (duplicatedUserNameorNot.length == 0) {

					let insertUserDataResult = await insertUserSignUpInfo(
						name,
						passwordEcripted,
						email,
						loginAccessToken,
						expireTime
					);
					return '[User sign up result]:' + insertUserDataResult;
				} else {
					return '[User sign up result]: This email "' + email + '" is already existed';
				}

			}
			userSignUpProcess().then(value => {
				resolve(value);
			}).catch(err => {
				reject(err);
			})
		})

	},

	hostSignUp: function (name, password, email, loginAccessToken, streamToken, roomName, expireTime) {
		return new Promise(function (resolve, reject) {
			function checkDuplicatedName(hostemail) {
				return new Promise(function (resolve, reject) {
					const checkHostSignUpQuery = `select * from hostlist where email=? ;`;
					const checkHostSignUpParam = [hostemail];
					database.connection.query(checkHostSignUpQuery, checkHostSignUpParam, function (error, hostcheck, fields) {
						if (error) {
							reject("[Database Error] " + error);
						} else {
							resolve(hostcheck);
						}
					});
				});
			}



			function insertHostSignUpInfo(name, password, email, loginAccessToken, streamToken, roomName, expireTime) {
				return new Promise(function (resolve, reject) {
					const insert = `Insert into hostlist(name , password, email, login_access_token, stream_token, room_name, expire_time) 
									values(?, ?, ?, ?, ?, ?, ?);`;
					const insertparams = [name, password, email, loginAccessToken, streamToken, roomName, expireTime];
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
							connection.query(insert, insertparams, function (error, insertedHostCheck, fields) {
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
										resolve(insertedHostCheck);
										connection.release();
									});
								}
							});
						});
					})
				});
			}

			async function hostSignUpProcess() {
				let duplicatedHostNameorNot = await checkDuplicatedName(email);
				const passwordEcripted = passwordEncryption(password);
				if (duplicatedHostNameorNot.length == 0) {
					let insertHostDataResult = await insertHostSignUpInfo(
						name,
						passwordEcripted,
						email,
						loginAccessToken,
						streamToken,
						roomName,
						expireTime
					);
					return '[host sign up result]:' + insertHostDataResult;
				} else {
					return '[host sign up result]: This email "' + email + '" is already existed';
				}

			}
			hostSignUpProcess().then(value => {
				resolve(value);
			}).catch(err => {
				reject(err);
			})
		})

	},
	// every host and user should have an access token
	loginTokenGenerator: function (email) {
		const date = new Date();
		const temp = date.setSeconds(date.getSeconds() + config.access_expired_sec);
		const expireDate = new Date(temp);
		const newAccess = email + String(expireDate);

		// generate login access token
		const newAccessToken = crypto.createHash('sha256').update(newAccess, 'utf8').digest();
		const loginAccessToken = newAccessToken.toString('hex');

		let resObject = {
			expire: expireDate.toString(),
			loginAccessToken: loginAccessToken
		}

		return resObject;
	},
	// every host should have only one stream id
	streamTokenGenerator: function (hostname) {
		const date = new Date();
		const newAccess = hostname + String(date);

		// generate stream token
		const newAccessToken = crypto.createHash('sha256').update(newAccess, 'utf8').digest();
		const streamToken = newAccessToken.toString('hex');
		return streamToken;
	}

};

function passwordEncryption(password) {
	const newPassword = crypto.createHash('sha256').update(password, 'utf8').digest();
	const newPasswordToken = newPassword.toString('hex');
	return newPasswordToken;
}

