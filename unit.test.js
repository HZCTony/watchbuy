let customlb = require('./public/model/DataAccessObject/customloadbalancer.js');

test('customMultipleRequestsToCheckServerLoading', function () {
    let urls = ['https://1.com', 'https://2.com'];
    expect(typeof customlb.generateMultipleServerRequests(urls)).toBe('object');
})

test('networksInputTest', function () {
    let obj = [
        { input: 999 },
        { input: 0},
        { input: 444},
        { input: 221},
        { input: 12312}
    ];
    expect(typeof customlb.findLowestInputNetworkOfServer(obj)).toBe('object');
})
