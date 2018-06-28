const request = require('request')

module.exports =  function(app){
    app.post("/addGetStartedButton",function(req,res){
        
        console.log(req.body);
        var pageAccessToken =  req.body.PAGE_ACCESS_TOKEN;
       
        console.log("inside post ");
        var messageData = {
                "get_started":
                    {
                            "payload":"GET_STARTED_CLICKED"
                    }
                
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
    });

    app.post("/removeGetStartedButton",function(req,res){
        var pageAccessToken =  req.body.PAGE_ACCESS_TOKEN;
        var messageData = {
            "fields":["get_started"]
            
        };
        request({
            url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token='+ pageAccessToken,
            method: 'DELETE',
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
    })
}
