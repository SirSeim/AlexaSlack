// This code sample shows how to call and receive external rest service data, within your skill Lambda code.

// var AWS = require('aws-sdk');

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
                path: '/api/channels.list', 
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