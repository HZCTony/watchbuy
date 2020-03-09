// MySQL Initialization
const database = require("../util/rds_mysql.js");
let requestPromise = require('request-promise');
// Build DAO Object
module.exports = {

    generateMultipleServerRequests: function (allEC2InstaceDNS) {
        let requests = [];
        for (let u = 0; u < allEC2InstaceDNS.length; u++) {
            let opt = {
                method: 'POST',
                uri: allEC2InstaceDNS[u],
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
        let lowest = 0;
        let highest = 0;
        let tmp;
        for (let i = networkInputResults.length - 1; i >= 0; i--) {
            tmp = networkInputResults[i].input;
            // find out the ip index of array with max and min d
            if (tmp <= lowest) lowest = i;
            if (tmp >= highest) highest = i;
        }
        let result = {
            highestIndex: highest,
            lowestIndex: lowest
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

