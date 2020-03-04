const crypto = require('crypto');
const config = require('./config.json');
// MySQL Initialization
const database = require("../util/rds_mysql.js");
// Build DAO Object
module.exports = {
	userSignUp: function (name, password, email, login_access_token, expire_time) {
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

			function insertUserSignUpInfo(name, password, email, login_access_token, expire_time) {
				return new Promise(function (resolve, reject) {
					const insert = `Insert into userlist(name ,password, email, login_access_token, expire_time) 
									values(?, ?, ?, ?, ?);`;
					const insertparams = [name, password, email, login_access_token, expire_time];
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

			async function UserSignUpProcess() {
				let duplicatedUserNameorNot = await checkDuplicatedName(email);
				const passwordEcripted = passwordEncryption(password);
				if (duplicatedUserNameorNot.length == 0) {

					let insertUserDataResult = await insertUserSignUpInfo(
						name,
						passwordEcripted,
						email,
						login_access_token,
						expire_time
					);
					return '[User sign up result]:' + insertUserDataResult;
				} else {
					return '[User sign up result]: This email "' + email + '" is already existed';
				}

			}
			UserSignUpProcess().then(value => {
				resolve(value);
			}).catch(err => {
				reject(err);
			})
		})

	},

	hostSignUp: function (name, password, email, login_access_token, stream_token, room_name, expire_time) {
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



			function insertHostSignUpInfo(name, password, email, login_access_token, stream_token, room_name, expire_time) {
				return new Promise(function (resolve, reject) {
					const insert = `Insert into hostlist(name , password, email, login_access_token, stream_token, room_name, expire_time) 
									values(?, ?, ?, ?, ?, ?, ?);`;
					const insertparams = [name, password, email, login_access_token, stream_token, room_name, expire_time];
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

			async function HostSignUpProcess() {
				var duplicatedHostNameorNot = await checkDuplicatedName(email);
				const passwordEcripted = passwordEncryption(password);
				if (duplicatedHostNameorNot.length == 0) {
					var insertHostDataResult = await insertHostSignUpInfo(
						name,
						passwordEcripted,
						email,
						login_access_token,
						stream_token,
						room_name,
						expire_time
					);
					return '[host sign up result]:' + insertHostDataResult;
				} else {
					return '[host sign up result]: This email "' + email + '" is already existed';
				}

			}
			HostSignUpProcess().then(value => {
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
		const expire_date = new Date(temp);
		const new_access = email + String(expire_date);

		// generate login access token
		const new_access_token = crypto.createHash('sha256').update(new_access, 'utf8').digest();
		const login_access_token = new_access_token.toString('hex');

		var res_obj = {
			expire: expire_date.toString(),
			login_access_token: login_access_token
		}

		return res_obj
	},
	// every host should have only one stream id
	StreamTokenGenerator: function (hostname) {
		const date = new Date();
		const new_access = hostname + String(date);

		// generate stream token
		const new_access_token = crypto.createHash('sha256').update(new_access, 'utf8').digest();
		const stream_token = new_access_token.toString('hex');
		return stream_token
	}

};

function passwordEncryption(password) {
	const new_password = crypto.createHash('sha256').update(password, 'utf8').digest();
	const new_password_token = new_password.toString('hex');
	return new_password_token;
}

