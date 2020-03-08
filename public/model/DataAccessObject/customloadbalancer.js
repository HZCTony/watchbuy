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

    writeCurrentEC2instanceIdtoHost: function(email, ec2Id){

    }


};

