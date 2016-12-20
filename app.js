'use strict';
// Module Dependencies
// -------------------
var express         = require('express');
var logger          = require('morgan');
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var favicon         = require('serve-favicon');
var errorhandler    = require('errorhandler');
var http            = require('http');
var session         = require('express-session')
var JWT             = require('./lib/jwtDecoder.js');
var path            = require('path');
var request         = require('request');
var routes          = require('./routes');
var restActivity    = require('./routes/restActivity.js');
var activityUtils   = require('./routes/activityUtils.js');
var pkgjson         = require( './package.json' );

var app = express();

var APIKeys = {
    appId           : "b8ac2fe7-8be4-4e58-8948-48abfd6dbdaf",
    clientId        : "fh7ft4bn8a2lv9p9l4k9mjak",
    clientSecret    : "smB4XxWyjYWMDK7j8CzSC6kd",
    appSignature    : "wp3vnep3wq4dhps2jjl1bwmi5unwprp1os1sq1wg1pbmop3p0ok3nfo2asrijjdqpkjgzbbgj4actb0g5e4nhoe4nqkrozfveb30h2yjtkkbnlxecgsezvg03cyc0u0bjvhjttupuecvm4dwssca4pilaund420ppfqt1o0hjbsurdhz1dptb2wrzpmlhih2ehrt1lg1uzwjimqnmxcae4cgrqjo2jq5pzms1dofj0di022zj2v2muuqhe1ebig",
    authUrl         : "https://auth.exacttargetapis.com/v1/requestToken?legacy=1"
};

/**
 * Express midlleware to encode requests using JWT.
 * @param req
 * @param res
 * @param next
 */
function tokenFromJWT( req, res, next ) {
    // Setup the signature for decoding the JWT
    var jwt = new JWT({appSignature: APIKeys.appSignature});

    // Object representing the data in the JWT
    var jwtData = jwt.decode( req );
    req.session.token = jwtData;
    next(); 
}


// Configure Express
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('default', logger);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(methodOverride('X-HTTP-Method-Override'));
app.use(favicon(__dirname + '/public/rest-activity/images/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: APIKeys.appSignature,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

// Express in Development Mode
if ('development' == app.get('env')) {
    app.use(errorhandler());
}

/**
 * GET /
 * HubExchange route. Main page of the Marketing Cloud application
 */
app.get('/', routes.index );

/**
 * POST /login
 * HubExchange route. Logs in to Marketing Cloud, using JWT for encryption
 */
app.post('/login', tokenFromJWT, routes.login );

/**
 * POST /logut
 * HubExchange rout. Logs out from Marketing Cloud.
 */
app.post('/logout', routes.logout );

/**
 * GET /api-keys
 * Returns the content of the api-keys of the running application
 */
app.get('/api-keys', function( req, res ) {
    // The client makes this request to get the data    
    console.log(APIKeys.appSignature);
    res.status( 200 ).send( { 
        appSignature: APIKeys.appSignature, 
        appId: APIKeys.appId,  
        clientId: APIKeys.clientId,  
        clientSecret: APIKeys.clientSecret,  
        authUrl: APIKeys.authUrl
    } );    
});

/**
 *  DELETE /activity-data
 *  Clears the array 'logExecuteData', which holds the latest execution details of the activity
 */
app.delete('/activity-data', function( req, res ) {
    // The client makes this request to get the data
    activityUtils.logExecuteData = [];    
    res.status( 200 ).send("");
});

/**
 * GET /activity-data
 * Returns the content of the array 'logExecuteData', which holds the latest execution details of the activity
 */
app.get('/activity-data', function( req, res ) {
    // The client makes this request to get the data
    if( !activityUtils.logExecuteData.length ) {
        res.status(200).send( {data: null} );
    } else {
        res.status( 200 ).send( {data: activityUtils.logExecuteData} );
    }
});

/**
 * GET /version
 * Returns the version of the app, set in the package.json file
 */
app.get( '/version', function( req, res ) {
    res.setHeader( 'content-type', 'application/json' );
    res.status( 200 ).send( JSON.stringify( {
        version: pkgjson.version
    } ) );
} );

/**
 * POST /rest-activity/save
 * Custom Activity SAVE
 */
app.post('/rest-activity/save', restActivity.save );

/**
 * POST /rest-activity/validate
 * Custom Activity VALIDATE
 */
app.post('/rest-activity/validate', restActivity.validate );

/**
 * POST /rest-activity/publish
 * Custom Activity PUBLISH
 */
app.post('/rest-activity/publish', restActivity.publish );

/**
 * POST /rest-activity/execute
 * Custom Activity EXECUTE
 */
app.post('/rest-activity/execute', restActivity.execute );

/**
 * GET /rest-activity/config.json
 * Custom Activity config.json file generation. It takes values from the node env variables (Heroku vars) to dynamically
 * generate the correspondent config file.
 */
app.get('/config.json', restActivity.configJSON );




http.createServer(app).listen(process.env.PORT || 3000, function(){
    console.log('Express server listening on port ' + app.get('port'));
});