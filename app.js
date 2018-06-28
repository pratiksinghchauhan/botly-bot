#!/usr/bin/env node

'use strict';
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
var unirest = require('unirest');
require('dotenv').config();

const port = '6000';

const Botly = require("botly");
const botly = new Botly({
    verifyToken: 'thisisatestchatbot',
    accessToken: process.env.ACCESS_TOKEN
});

var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
require("./helpers/getstarted")(app);

var users = {};

botly.on('message', (sender, message, data) => {
    let text = `echo: ${data.text}`;

    if (users[sender]) {
        if(data && data.text){
            var original_question= data.text.replace("/","");
            console.log(data.text);
            unirest.get(process.env.FAQ_URL + "5adeeb4ec3d41e2598606ece" + "/" + original_question).headers({
                'Content-type': 'application/json'
            }).end(function (res) {
                if (res.error) {
                    console.log('GET error', res.error)
                    console.log('Go to begin Dialog Cont');
                    botly.sendText({id:sender,text:"faq Server issue"});
                    return 3;
                }
                else if(res.body.response_list && res.body.response_list.length > 0){
                    console.log("Got responses from faq bot");
                    var answer2 = {};
                    var answer3 = {};
                    var answer1 = res.body.response_list[0];
                  
                    if(res.body.response_list.length>1)answer2 = res.body.response_list[1];
                    if(res.body.response_list.length>2)answer3 = res.body.response_list[2];
                    console.log("confidenceeeeee-"+answer1.confidence);
                    if (answer1.confidence){//} > 0.5) {
                        var ans =  answer1.answer.replace(/\r?\n|\r/g, " ");
                        botly.send({id:sender, message: {text:ans}});
                        console.log(answer1);
                    }
                }
                else{
                    console.log(res);
                    botly.sendText("Something happened, we need to start over");
                }
            });
        }
    }
    else {
        botly.getUserProfile(sender, function (err, info) {
            users[sender] = info;

            botly.sendText({id: sender, text: `Hello ${users[sender].first_name}`}, function (err, data) {
                console.log('send text cb:', err, data);
            });
        });
    }
});

botly.on('postback', (sender, message, postback) => { 
    console.log('postback:', sender, message, postback);
    console.log("postback clicked");
    console.log(postback);
    console.log(sender);
    if(postback == "GET_STARTED_CLICKED"){
        botly.sendText({id : sender, text:"Hello Human!!"});
        console.log("Response of get user is sent");
    }
    // botly.sendText({id: sender, text: `Hello, ${users[sender].first_name} , I am a friendly bot, designed to help Humans`}, function (err, data) {
    //     console.log('send text cb:', err, data);
    // });
});

botly.on('delivery', (sender, message, mids) => {
    console.log('delivery:', sender, message, mids);
});

botly.on('optin', (sender, message, optin) => {
    console.log('optin:', sender, message, optin);
});

botly.on('error', (ex) => {
    console.log('error:', ex);
});

if (process.env.PAGE_ID) {
    // botly.setGetStarted({pageId: process.env.PAGE_ID, payload: 'GET_STARTED_CLICKED'}, function (err, body) {
    //     console.log('welcome cb:', err, body);
    // });
    botly.setPersistentMenu({pageId: process.env.PAGE_ID, menu: [
        {
            'locale':'default',
            'composer_input_disabled':false,
            'call_to_actions':[
                {
                    'title':'Languages',
                    'type':'nested',
                    'call_to_actions':[
                        {
                            'title':'Hindi',
                            'type':'postback',
                            'payload':'HINDI_PAYLOAD'
                        },
                        {
                            'title':'English',
                            'type':'postback',
                            'payload':'ENGLISH_PAYLOAD'
                        },
                        {
                            'title':'Arabic',
                            'type':'postback',
                            'payload':'ARABIC_PAYLOAD'
                        }
                    ]
                },
                {
                    'type':'web_url',
                    'title':'Abbout Ellie',
                    'url':'http://ellieva.com',
                    'webview_height_ratio':'full'
                }
            ]
        },
        {
            'locale':'zh_CN',
            'composer_input_disabled':false
        }
    ]}, (err, body) => {
        console.log('persistent menu cb:', err, body);
    });
    botly.setTargetAudience({
        pageId: process.env.PAGE_ID,
        audience: {
            'audience_type':'custom',
            'countries':{
                'whitelist':['US', 'CA']
            }
        }}, (err, body) => {
       console.log('set target audience', err, body);
    });
}

let verify = () => {};
if (process.env.APP_SECRET) {
    verify = botly.getVerifySignature(process.env.APP_SECRET);
}

app.use(bodyParser.json({
    verify
}));
app.use(bodyParser.urlencoded({extended: false}));
app.use('/fb', botly.router());
app.set('port', port);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: {}
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});

const server = http.createServer(app);

server.listen(process.env.PORT || port,function(){
    console.log("listening on 6000");
});

