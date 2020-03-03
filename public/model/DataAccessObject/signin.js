const crypto = require('crypto');
const config = require('./config.json');
// MySQL Initialization
const database = require("../util/rds_mysql.js");
// Build DAO Object
module.exports = {
	userSignInCheck: function (username, password, email) {
		return new Promise(function (resolve, reject) {

			database.connection.query(`select * from userlist where name='${username}' AND password='${passwordEncryption(password)}' AND email='${email}';`, function (error, usercheck, fields) {
				if (error) {
					reject("[Database Error]" + error);
				} else {
					resolve(usercheck);
				}
			});
		});
	},

	hostSignInCheck: function (hostname, password, email) {
		return new Promise(function (resolve, reject) {
			database.connection.query(`select * from hostlist where name='${hostname}' AND password='${passwordEncryption(password)}' AND email='${email}';`, function (error, hostcheck, fields) {
				if (error) {
					reject("[Database Error] " + error);
				} else {
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
				database.connection.query(`select * from userlist where login_access_token='${token}';`, function (error, usercookiecheck, fields) {
					if (error) {
						reject("[Database Error] " + error);
					} else {
						if (usercookiecheck.length == 0) {
							loginStatus.role = 'user';
							loginStatus.status = 'none';
							resolve(loginStatus);
						} else {
							
									loginStatus.role = 'user';
									loginStatus.status = Expire_calculation(usercookiecheck[0].expire_time);
									loginStatus.name = usercookiecheck[0].name;
									loginStatus.email = usercookiecheck[0].email;
									resolve(loginStatus);
						}
					}
				});
			} else if (role == 'host') {
				database.connection.query(`select * from hostlist where login_access_token='${token}';`, function (error, hostcookiecheck, fields) {
					if (error) {
						reject("[Database Error] " + error);
					} else {
						if (hostcookiecheck.length == 0) {
							loginStatus.role = 'host';
							loginStatus.status = 'none';
							resolve(loginStatus);
						} else {
							loginStatus.role = 'host';
							loginStatus.status = Expire_calculation(hostcookiecheck[0].expire_time);
							loginStatus.name = hostcookiecheck[0].name;
							loginStatus.email = hostcookiecheck[0].email;
							loginStatus.stream_token = hostcookiecheck[0].stream_token;
							resolve(loginStatus);
						}
					}
				});
			}else{
				reject("No user or host.");
			}

		});
	},
	Update_login_access_token: function (role, email) {
		return new Promise(function (resolve, reject) {
			Updated = loginTokenGenerator(email);
			var UpdateloginInfoQuery = '';
			if (role == 'user') {
				UpdateloginInfoQuery = `Update userlist SET login_access_token='${Updated.login_access_token}', expire_time='${Updated.expire}' where email='${email}';`;
			} else if (role == 'host') {
				UpdateloginInfoQuery = `Update hostlist SET login_access_token='${Updated.login_access_token}', expire_time='${Updated.expire}' where email='${email}';`;
			}
			if (UpdateloginInfoQuery != '') {
				database.connection.query(UpdateloginInfoQuery, function (error, Update_Token_and_Expire_result, fields) {
					if (error) {
						reject("[Database Error] " + error);
					} else {
						resolve(Updated.login_access_token);
					}
				});
			} else {
				reject('UpdateloginInfoQuery is broken. Check Database to ensure updating login_access_token and expire time is correct');
			};
		})
	}

};

function passwordEncryption(password) {
	const new_password = crypto.createHash('sha256').update(password, 'utf8').digest();
	const new_password_token = new_password.toString('hex');
	return new_password_token;
}


// every host and user should have an access token
function loginTokenGenerator(email) {
	const date = new Date();
	const temp = date.setSeconds(date.getSeconds() + config.access_expired_sec);
	const expire_date = new Date(temp);
	const new_access = email + String(expire_date);

	// generate login access token
	const new_access_token = crypto.createHash('sha256').update(new_access, 'utf8').digest();
	const login_access_token = new_access_token.toString('hex');

	var res_obj = {
		expire : expire_date.toString(),
		login_access_token: login_access_token
	}

	return res_obj;
}

// every host should have only one stream id
function StreamTokenGenerator(hostname) {
	const date = new Date();
	const new_access = hostname + String(date);

	// generate stream token
	const new_access_token = crypto.createHash('sha256').update(new_access, 'utf8').digest();
	const stream_token = new_access_token.toString('hex');
	return stream_token


}

function Expire_calculation(expire_time){

	  const current = new Date();
      const expire = new Date(expire_time);
      const difference = (expire - current) / 1000;
	  var expire_judgement = '';

	  if(difference > 0){
		expire_judgement = 'ok';
	  }else{
		expire_judgement = 'not ok';
	  }
	  return expire_judgement;

}