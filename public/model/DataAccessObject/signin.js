const crypto = require('crypto');
// MySQL Initialization
const database = require("../util/rds_mysql.js");
// Build DAO Object
module.exports={
	userSignInCheck: function(username, password){
		return new Promise(function(resolve, reject){

			database.connection.query(`select * from userlist where name='${username}' AND password='${passwordEncryption(password)}';`, function(error, usercheck, fields){
				if(error){
					reject("[Database Error]"  + error);
				}else{
					resolve(usercheck);
				}
			});
		});
	},

	hostSignInCheck: function(hostname, password){
		return new Promise(function(resolve, reject){
			database.connection.query(`select * from hostlist where name='${hostname}' AND password='${passwordEncryption(password)}';`, function(error, hostcheck, fields){
				if(error){
					reject("[Database Error] " + error);
				}else{
					console.log('host: ',hostcheck);
					resolve(hostcheck);
				}
			});
		});
	}

};

function passwordEncryption(password) {
	const new_password = crypto.createHash('sha256').update(password, 'utf8').digest();
	const new_password_token = new_password.toString('hex');
	return new_password_token;
}