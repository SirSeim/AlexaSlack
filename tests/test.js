var https = require('https');

// console.log("test begin");



var get_options = {
    host: 'slack.com', 
    port: '443', 
    path: '/api/channels.list?token=xoxp-75550810404-75820623957-101017059570-20767371fdf8f3facc2b231126fcc758', 
    method: 'GET', 
    headers: { 
        'token': 'xoxp-75550810404-75820623957-101685910678-b3af602059bda41fbe174d0e78886ed3',
        'Content-Type': 'application/json'
    } 
};

var get_req = https.request(get_options, function (res) {
    res.setEncoding('utf8'); 
    var returnData = ""; 
    res.on('data', function (chunk) { 
        returnData += chunk; 
    }); 
    res.on('end', function () {
        // returnData: {"usstate":"Delaware","attributes":[{"population":900000},{"rank":45}]}

        var json = JSON.parse(returnData);
        console.log(json);

        var channels = [];
        json.channels.forEach(function (obj) {
            channels.push(obj.name);
        });

        // Probably need to change to create a string from channels
        say = "Your channels are " + channels;

        // add the state to a session.attributes array
        if (!sessionAttributes.requestList) {
            sessionAttributes.requestList = [];
        }
        sessionAttributes.requestList.push(myState);

        // This line concludes the lambda call.  Move this line to within any asynchronous callbacks that return and use data.
        context.succeed({sessionAttributes: sessionAttributes, response: buildSpeechletResponse(say, shouldEndSession) });

    }); 
});
get_req.end();