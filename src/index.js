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

    var token = 'xoxp-75550810404-75820623957-100368457809-0d1a72240ace70811cc2689def642c0b';

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
                path: '/api/channels.list?token=' + token, 
                method: 'GET', 
                headers: { 
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

            myChannel = event.request.intent.slots.channel.value;
            myMessage = event.request.intent.slots.message.value;
            myEmoji = event.request.intent.slots.emoji.value;

            var channel = "G2Z2R2B1B";
            var emoji = ;

            // if (myChannel === "general") {
            //     channel = "C27EV0GTD";
            // } else if (myChannel === "random") {
            //     channel = "C27GKA70X";
            // }

            var messageEmoji = [
                {
                    message: "I'm going to be late",
                    emoji: "\u{1f62d}"
                },
                {
                    message: "I hate you",
                    emoji: "\u{1f624}"
                }
            ];

            var emojiList = [
                {
                    name: "triumph",
                    emoji: "\u{1f624}"
                }
            ];

            var message = "";
            if (myEmoji) {
                for (var i = 0; i < emojiList.length; i++) {
                    if (myEmoji === emojiList[i].name) {
                        message = myMessage + ' ' + emojiList[i].emoji;
                    }
                    // if (myMessage === messageEmoji[i]){
                    //     var pathValue = '/api/chat.postMessage?token=xoxp-75550810404-75820623957-100359189585-ef895940a0f87b74aa880b872390bbec&channel=' +
                    //                 channel + '&text=' + myMessage + emoji;
                    // } else {
                    //     var pathValue = '/api/chat.postMessage?token=xoxp-75550810404-75820623957-100359189585-ef895940a0f87b74aa880b872390bbec&channel=' +
                    //                 channel + '&text=' + myMessage;
                    // }
                }
            } else {
                for (var i = 0; i < messageEmoji.length; i++) {
                    if (myMessage === messageEmoji[i].message) {
                        message = myMessage + ' ' + messageEmoji[i].emoji;
                    }
                    // if (myMessage === messageEmoji[i]){
                    //     var pathValue = '/api/chat.postMessage?token=xoxp-75550810404-75820623957-100359189585-ef895940a0f87b74aa880b872390bbec&channel=' +
                    //                 channel + '&text=' + myMessage + emoji;
                    // } else {
                    //     var pathValue = '/api/chat.postMessage?token=xoxp-75550810404-75820623957-100359189585-ef895940a0f87b74aa880b872390bbec&channel=' +
                    //                 channel + '&text=' + myMessage;
                    // }
                }
                if (!message) {
                    message = myMessage;
                }
            }

            var pathValue = '/api/chat.postMessage?token=' + token + '&channel=' +
                                channel + '&text=' + encodeURIComponent(message);

            var post_options = { 
                host: 'slack.com', 
                port: '443', 
                path: pathValue, 
                method: 'POST', 
                headers: { 
                    'Content-Type': 'application/json'
                } };
            var post_req = https.request(post_options, function (res) { 
                res.setEncoding('utf8'); 
                var returnData = ""; 
                res.on('data', function (chunk) { 
                    returnData += chunk; 
                }); 
                res.on('end', function () {
                    // returnData: {"usstate":"Delaware","attributes":[{"population":900000},{"rank":45}]}

                    json = JSON.parse(returnData);

                    //Change
                    console.log(json);
                    say = "Sent " + json.ok;

                    // add the state to a session.attributes array
                    if (!sessionAttributes.requestList) {
                        sessionAttributes.requestList = [];
                    }
                    sessionAttributes.requestList.push(myState);

                    // This line concludes the lambda call.  Move this line to within any asynchronous callbacks that return and use data.
                    context.succeed({sessionAttributes: sessionAttributes, response: buildSpeechletResponse(say, shouldEndSession) });

                }); 
            });
            post_req.end();

        } else if (IntentName === "ReadMessageFromChannel") {

            myChannel = event.request.intent.slots.channel.value;

            var channel = "G2Z2R2B1B";

            // if (myChannel === "general") {
            //     channel = "C27EV0GTD";
            // } else if (myChannel === "random") {
            //     channel = "C27GKA70X";
            // }

            var pathValue = '/api/groups.history?token=' + token + '&channel=' +
                            channel + '&count=1&pretty=1';


            var post_options = { 
                host: 'slack.com', 
                port: '443', 
                path: pathValue, 
                method: 'GET', 
                headers: { 
                    'Content-Type': 'application/json'
                } 
            };
            var post_req = https.request(post_options, function (res) { 
                res.setEncoding('utf8'); 
                var returnData = ""; 
                res.on('data', function (chunk) { 
                    returnData += chunk; 
                }); 
                res.on('end', function () {
                    // returnData: {"usstate":"Delaware","attributes":[{"population":900000},{"rank":45}]}

                    json = JSON.parse(returnData);

                    if (json.ok) {
                        say = "The latest message was, " + json.messages[0].text;
                    } else {
                        say = "Error, " + json.error;
                    }
                    //Change
                    console.log(json);
                    console.log(say);

                    // add the state to a session.attributes array
                    if (!sessionAttributes.requestList) {
                        sessionAttributes.requestList = [];
                    }
                    sessionAttributes.requestList.push(myState);

                    // This line concludes the lambda call.  Move this line to within any asynchronous callbacks that return and use data.
                    context.succeed({sessionAttributes: sessionAttributes, response: buildSpeechletResponse(say, shouldEndSession) });

                }); 
            });
            post_req.end();


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
