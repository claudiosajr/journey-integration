'use strict';
var https = require( 'https' );
var activityUtils = require('./activityUtils.js');
var httpExecute = process.env.REST_EXECUTE && process.env.REST_EXECUTE.length > 0? process.env.REST_EXECUTE : "https://" + "infinite-anchorage-10878" + ".herokuapp.com/rest-activity/execute";
var httpSave = process.env.REST_SAVE && process.env.REST_SAVE.length > 0? process.env.REST_SAVE : "https://" + "infinite-anchorage-10878" + ".herokuapp.com/rest-activity/save";
var httpPublish = process.env.REST_PUBLISH && process.env.REST_PUBLISH.length > 0? process.env.REST_PUBLISH : "https://" + "infinite-anchorage-10878" + ".herokuapp.com/rest-activity/publish";
var httpValidate = process.env.REST_VALIDATE && process.env.REST_VALIDATE.length > 0? process.env.REST_VALIDATE : "https://" + "infinite-anchorage-10878" + ".herokuapp.com/rest-activity/validate";
var configJSON = {
    "workflowApiVersion": "1.1",
		"metaData": {
			"icon": "images/sms.png",
			"iconSmall": "images/smsSmall.png",
			"category": "message"
		},
		"type": "REST",
		"lang": {
			"en-US": {
				"name": "infinite-anchorage-10878",
				"description": ""
			}
		},
		"arguments": {
			"execute": {
				"inArguments": [
					{
                    	"emailAddress": "{{InteractionDefaults.Email}}"
                	},
                	{
	                    "phoneNumber": "{{Contact.Default.PhoneNumber}}"
	                },
                	{
	                    "devideId": "{{Contact.Default.DevideId}}"
	                }
				],
        "outArguments": [
        	{
        		"result":""
        	}
        ],
				"url": httpExecute,
				"useJWT": true
			}
		},
		"configurationArguments": {
			"applicationExtensionKey": "infinite-anchorage-10878",
			"save": {
				"url": httpSave
			},
			"publish": {
				"url": httpPublish
			},
			"validate": {
				"url": httpValidate
			}
		},
		"wizardSteps": [
			{ "label": "Step 1", "key": "step1" },
			{ "label": "Step 2", "key": "step2" },
			{ "label": "Step 3", "key": "step3" },
			{ "label": "Step 4", "key": "step4", "active": false }
		],
		"userInterfaces": {
			"configModal": {
				"height": 200,
				"width": 300,
				"fullscreen": true
			},
			"runningModal": {
				"url": "runningModal.html"
			},
			"runningHover": {
				"url": "runningHover.html"
			}
		},
		"schema": {
			"arguments": {
				"execute": {
					"inArguments": [],
					"outArguments": []
				}
			}
		},
		"sslNotRequired": true
	};

/**
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function( req, res ) {
	console.log('>>> EDIT <<<');
	console.log(req.body);
	// Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    activityUtils.logData( req );
    res.status(200).send('Edit');
};

/**
 * POST Handler for /save/ route of Activity.
 */
exports.save = function( req, res ) {
	console.log('>>> SAVE <<<');
	console.log(req.body);
	// Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    activityUtils.logData( req );
    res.status(200).send('Save');
};

/**
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function( req, res ) {
	console.log('>>> PUBLISH <<<');
	console.log(req.body);
	// Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    activityUtils.logData( req );
    res.status(200).send('Publish');
};

/**
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function( req, res ) {
	console.log('>>> VALIDATE <<<');
	console.log(req.body);
	// Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    activityUtils.logData( req );
    res.status(200).send('Validate');
};

/**
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function( req, res ) {
	console.log('>>> EXECUTE <<<');
	console.log(req.body);
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    activityUtils.logData( req );
	res.status(200).send({"result":"0"});
};

/**
 *  GET config.json. Instead of using a static field, we build the initial config.json file using the variables from Heroku.
 */
exports.configJSON = function( req, res ) {
	console.log('>>> get _config.json <<<');
	res.status(200).send(configJSON);
};




