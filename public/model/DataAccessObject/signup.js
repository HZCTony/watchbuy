const crypto = require('crypto');
const access_expired_sec = 3600;
// MySQL Initialization
const database = require("../util/rds_mysql.js");
// Build DAO Object
module.exports = {
	userSignUp: function (name, password, email, login_access_token) {
		return new Promise(function (resolve, reject) {
			
			//checkDuplicatedName先判斷有沒有重複name
			//if 沒有重複name 才插入 insertUserSignUpInfo
			//else 重複了 就回覆已重複的username

			function checkDuplicatedName(useremail) {
				return new Promise(function (resolve, reject) {
					database.connection.query(`select * from userlist where email='${useremail}';`, function (error, usernamecheck, fields) {
						if (error) {
							reject("[Database Error] " + error);
						} else {
							resolve(usernamecheck);
						}
					});
				});
			}

			function insertUserSignUpInfo(name, password, email, login_access_token) {
				return new Promise(function (resolve, reject) {
					const insert = `Insert into userlist(name ,password, email,login_access_token) 
				                              values('${name}', '${password}',  '${email}', '${login_access_token}');`
					database.connection.query(insert, function (error, insertedHostCheck, fields) {
						if (error) {
							reject("[Database Error] " + error);
						} else {
							resolve(insertedHostCheck);
						}
					});
				});
			}

			async function UserSignUpProcess() {
				var duplicatedUserNameorNot = await checkDuplicatedName(email);
				const passwordEcripted = passwordEncryption(password);
				if (duplicatedUserNameorNot.length == 0) {

					var insertUserDataResult = await insertUserSignUpInfo(
						name,
						passwordEcripted,
						email,
						login_access_token
					);
					return '[User sign up result]:' + insertUserDataResult;
				} else {
					return '[User sign up result]: This email "' + email + '" is already existed';
				}

			}
			UserSignUpProcess().then(value => {
				console.log(value);
				resolve(value);
			}).catch(err => {
				reject(err);
			})
		})

	},

	hostSignUp: function (name, password, email, login_access_token, stream_token, room_name) {
		return new Promise(function (resolve, reject) {
			//checkDuplicatedName先判斷有沒有重複name
			//if 沒有重複name 才插入insertHostSignUpInfo
			//else 重複了 就回覆已重複的username

			function checkDuplicatedName(hostemail) {
				return new Promise(function (resolve, reject) {
					database.connection.query(`select * from hostlist where email='${hostemail}';`, function (error, hostcheck, fields) {
						if (error) {
							reject("[Database Error] " + error);
						} else {
							resolve(hostcheck);
						}
					});
				});
			}

			function insertHostSignUpInfo(name, password, email, login_access_token, stream_token, room_name) {
				return new Promise(function (resolve, reject) {
					const insert = `Insert into hostlist(name ,password, email,login_access_token, stream_token, room_name) 
				                              values('${name}', '${password}',  '${email}', '${login_access_token}', '${stream_token}', '${room_name}');`
					database.connection.query(insert, function (error, insertedHostCheck, fields) {
						if (error) {
							reject("[Database Error] " + error);
						} else {
							resolve(insertedHostCheck);
						}
					});
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
						room_name
					);
					return '[host sign up result]:' + insertHostDataResult;
				} else {
					return '[host sign up result]: This email "' + email + '" is already existed';
				}

			}
			HostSignUpProcess().then(value => {
				console.log(value);
				resolve(value);
			}).catch(err => {
				reject(err);
			})
		})

	},
	// every host and user should have an access token
	loginTokenGenerator: function (email) {
		const date = new Date();
		const temp = date.setSeconds(date.getSeconds() + access_expired_sec);
		const expire_date = new Date(temp);
		console.log('expire_date ==', expire_date, typeof (expire_date.toString()));
		const new_access = email + String(expire_date);

		// generate login access token
		const new_access_token = crypto.createHash('sha256').update(new_access, 'utf8').digest();
		const login_access_token = new_access_token.toString('hex');
		return login_access_token
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