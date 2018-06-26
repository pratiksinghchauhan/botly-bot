

module.exports =  function(app){
    app.post("/addGetStartedButton",function(req,res){
        console.log("inside post ");
        console.log(req.body);
        var pageAccessToken =  req.body.PAGE_ACCESS_TOKEN;
        function setupGetStartedButton(res){
            var messageData = {
                    "get_started":[
                        {
                            "payload":"hi"
                        }
                    ]
            };

            // Start the request
            request({
                url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token='+ pageAccessToken,
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                form: messageData
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    // Print out the response body
                    res.send(body);

                } else { 
                    // TODO: Handle errors
                    res.send(body);
                }
            });
        }        
    });
}