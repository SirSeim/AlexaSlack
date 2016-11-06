var https = require('https');

exports.handler = function (event, context) {
    var say = "";
    var shouldEndSession = false;
    var sessionAttributes = {};
    var myState = "";
    var pop = 0;
    var rank = 0;

    if (event.session.attributes) {
        sessionAttributes = event.session.attributes;
    }

    if (event.request.type === "LaunchRequest") {
        say = "Welcome to Slack!";
        context.succeed({sessionAttributes: sessionAttributes, response: buildSpeechletResponse(say, shouldEndSession) });

    } else {
        var IntentName = event.request.intent.name;

        if (IntentName === "GetChannelsIntent") {

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

        } else if (IntentName === "PostMessageToChannel") {

            if (event.request.intent.slots.message.value) {

                myMessage = event.request.intent.slots.message.value;


                // call external rest service over https post
                var post_data = {
                    token: "xoxp-75550810404-75820623957-101692038278-6b3c28b8147e56e4b82b0e26c07b27cb",
                    channel: "alexa_hackathon",
                    text: "saycommand",
                    link_names: 1
                };  
                var post_options = { 
                    host:  'rmwum5l4zc.execute-api.us-east-1.amazonaws.com', 
                    port: '443', 
                    path: '/prod/stateresource', 
                    method: 'POST', 
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Content-Length': Buffer.byteLength(JSON.stringify(post_data)) 
                    } };
                      var post_req = https.request(post_options, function(res) { 
                        res.setEncoding('utf8'); 
                        var returnData = ""; 
                        res.on('data', function (chunk) { 
                            returnData += chunk; 
                        }); 
                        res.on('end', function () {
                            // returnData: {"usstate":"Delaware","attributes":[{"population":900000},{"rank":45}]}

                            json = JSON.parse(returnData);

                            //Change
                            say = "Sent";

                            // add the state to a session.attributes array
                            if (!sessionAttributes.requestList) {
                                sessionAttributes.requestList = [];
                            }
                            sessionAttributes.requestList.push(myState);

                            // This line concludes the lambda call.  Move this line to within any asynchronous callbacks that return and use data.
                            context.succeed({sessionAttributes: sessionAttributes, response: buildSpeechletResponse(say, shouldEndSession) });

                        }); 
                    });
                  post_req.write(JSON.stringify(post_data));
                 post_req.end();

            }
        } else if (IntentName === "AMAZON.StopIntent" || IntentName === "AMAZON.CancelIntent") {
            say = "You asked for " + sessionAttributes.requestList.toString() + ". Thanks for playing!";
            shouldEndSession = true;
            context.succeed({sessionAttributes: sessionAttributes, response: buildSpeechletResponse(say, shouldEndSession) });

        } else if (IntentName === "AMAZON.HelpIntent" ) {
            say = "Just say the name of a U.S. State, such as Massachusetts or California."
            context.succeed({sessionAttributes: sessionAttributes, response: buildSpeechletResponse(say, shouldEndSession) });

        }
    }
};

function buildSpeechletResponse(say, shouldEndSession) {
    return {
        outputSpeech: {
            type: "SSML",
            ssml: "<speak>" + say + "</speak>"
        },
        reprompt: {
            outputSpeech: {
                type: "SSML",
                ssml: "<speak>Please try again. " + say + "</speak>"
            }
        },
        card: {
            type: "Simple",
            title: "My Card Title",
            content: "My Card Content, displayed on the Alexa App or alexa.amazon.com"
        },
        shouldEndSession: shouldEndSession
    };
}
