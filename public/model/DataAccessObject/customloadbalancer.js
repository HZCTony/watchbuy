// MySQL Initialization
const database = require("../util/rds_mysql.js");
let requestPromise = require('request-promise');
// Build DAO Object
module.exports = {
    generateMultipleServerRequests: function (allEC2InstaceDNS) {
        let requests = new Array();
        for (let unit = 0; unit < allEC2InstaceDNS.length; unit++) {
            let opt = {
                method: 'POST',
                uri: allEC2InstaceDNS[unit],
                body: {
                    data: 1
                },
                json: true // Automatically stringifies the body to JSON
            };
            requests.push(requestPromise(opt));
        }
        return requests;
    },
    findLowestInputNetworkOfServer: function (networkInputResults) {
        let lowest = {index:null, value: Number.POSITIVE_INFINITY};
        let highest = {index:null, value: Number.NEGATIVE_INFINITY};
        for (let i = networkInputResults.length - 1; i >= 0; i--) {
            let tmp = networkInputResults[i].input;
            if (tmp <= lowest.value) lowest = {index:i, value:tmp};
            if (tmp >= highest.value) highest = {index:i, value:tmp};
        }
        let result = {
            highestIndex: highest.index,
            lowestIndex: lowest.index
        }

        return result;
    },
    writeCurrentEC2instanceIdtoHost: function (email, ec2Id) {
        return new Promise(function (resolve, reject) {
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
                    let insertEC2IdQuery = `UPDATE hostlist SET ec2id=? where email=? `;
                    let insertEC2IdParams = [ec2Id, email];
                    connection.query(insertEC2IdQuery, insertEC2IdParams, function (error, insertedResult, fields) {
                        if (error) {
                            reject("[Database Error]" + error);
                        } else {
                            connection.commit(function (commitErr) {
                                if (commitErr) {
                                    connection.rollback(function () {
                                        connection.release();
                                        reject(commitErr);
                                    });
                                }
                                resolve(insertedResult);
                                connection.release();
                            });
                        }
                    });
                })
            })
        })
    }
}

