module.exports = function(RED) 
{
    //variables placed here are shared by all nodes

    //NodeRED node constructor
    function AthomHomeyNode(config) 
    {
        RED.nodes.createNode(this, config);
        var thisNode = this;

        const PORT = 65439;

        var express = require('express');
        var app = express();
        var config = { 
                        api_url           : "https://api.athom.com",
                        token_path        : "/oauth2/token",
                        authorise_path    : "/oauth2/authorise"
                     };

        var AthomCloudAPI = require('athom-api');
        var athomApi = new AthomCloudAPI({
                            client_id       : config.client_id,
                            client_secret   : config.client_secret,
                            callback_url    : "http://localhost:" + PORT + "/callback",
                            debug           : true
                        });

        //Express app
        app.get('/', function(req, res){
                var auth_url = athomApi.getAuthorizationUrl();
                console.log('got auth url:', auth_url);
                
                res.redirect(auth_url);
            });
        app.get('/callback', function( req, res ){
                console.log('got code:', req.query.code);
                
                var token = athomApi.getAuthorizationToken(req.query.code, function( err, result){
                    
                    console.log('got token:', result);
                    req.session.user = result;
                    
                    res.redirect('/user/me');
                });
            });
        app.get('/user/me', function( req, res ){                      
                athomApi.get('/user/me', function(err, result){
                    if( err ) return res.send(err.message || err.toString());
                    res.json(result);
                })      
            });

        app.listen(PORT, function (){
              var host = app.address().address;
              var actualPort = app.address().port;
              console.log('express app listening at http://%s:%s', host, actualPort);
              thisNode.status({fill:"green", shape:"dot", text:"online (p:" + actualPort + ")"});
            })
            .on('error', function(error) { 
                if (error) {
                    thisNode.status({fill:"red", shape:"ring", text:"unable to start (p:" + PORT + ")"});
                    console.error(error);
                    return;
                }
            });

        //Get Athom client token
        athomApi.getClientToken(function(err, token){
            console.log('getClientToken', token);
            setInterval(function() {
                athomApi.get('/user/me/', function(err, result, statusCode){
                    console.log('GET', '/user/me/', statusCode)
                    if (statusCode != 200) 
                        console.log(err, result);
                })  
            }, 1000);
        });
    }

    //NodeRED registration
    RED.nodes.registerType("athom-homey-ball", AthomHomeyNode, {
      
    });
}
