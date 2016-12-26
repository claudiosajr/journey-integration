define([
    'js/postmonger'
], function(
    Postmonger
) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var schemaPayload = [];
    var lastStepEnabled = false;
    var steps = [ // initialize to the same value as what's set in _config.json for consistency
        { 'label': 'Message', 'key': 'step1' },
        { 'label': 'Preview', 'key': 'step2' },
        { 'label': 'Step 3', 'key': 'step3' },
        { 'label': 'Step 4', 'key': 'step4', 'active': false }
    ];
    var currentStep = null;
    var initialized = false;

    $(window).ready(onRender);

    connection.on('ready', onReady);
    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);
    connection.on('requestedSchema', onGetSchema);
    connection.on('requestedCulture', onGetCulture);
    connection.on('requestedInteractionDefaults', onGetInteractionDefaults);
    connection.on('updateActivity', onUpdateActivity)

    connection.on('clickedNext', onClickedNext);
    connection.on('clickedBack', onClickedBack);
    connection.on('gotoStep', onGotoStep);

    /**
     * This function is called on the $(window).ready event. It triggers some postmonger events
     * to gather contextual information of the custom activity journey
     */
    function onRender() {
        // We must call this event to tell JB the index is rendered. JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger('ready');

        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
        connection.trigger('requestSchema');
        connection.trigger('requestCulture');
        connection.trigger('requestInteractionDefaults');

        // Disable the next button if a value isn't selected
        $('#select1').change(function() {
            var message = getMessage();
            connection.trigger('updateButton', { button: 'next', enabled: Boolean(message) });

            $('#message').html(message);
        });

        // Toggle step 4 active/inactive (if inactive, wizard hides it and skips over it during navigation
        $('#toggleLastStep').click(function() {
            lastStepEnabled = !lastStepEnabled; // toggle status
            steps[3].active = !steps[3].active; // toggle active

            connection.trigger('updateSteps', steps);
        });

        $('#payload').on('change',onPayloadChanged);
        $('#payload').on('keyup',onPayloadChanged);
    }

    /**
     * The function is triggered by the 'ready' postmonger event, triggered on window.ready and on each step change.
     * It will evaluate the arguments in the payload in order to set the corresponding values in the UI.
     * @param data
     */
    function initialize (data) {
        console.log('Postmonger - initActivity', data);
        initialized = true;

        if (data) {
            payload = data;

            $( '#initialPayload' ).text( JSON.stringify( data , null , 4 ) );
        } else {
            $( '#initialPayload' ).text( 'initActivity contained no data' );
        }

        var message;
        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        $.each(inArguments, function(index, inArgument) {
            $.each(inArgument, function(key, val) {
                if (key === 'message') {
                    message = val;
                }
            });
        });

        if (message) {
            // If there is a message, fill things in, and if no default was specified, jump to last step
            $('#select1').find('option[value='+ message +']').attr('selected', 'selected');
            $('#message').html(message);
            showStep(null, 3);
        } else {
            showStep(null, 1);
        }

    }

    function onGetInteractionDefaults (interactionDefaults) {
        console.log('Postmonger - requestedInteractionDefaults', interactionDefaults);
        if(interactionDefaults){
            $( '#interactionDefaults').text( JSON.stringify( interactionDefaults, null, 4) );
        } else {
            $( '#interactionDefaults').text( 'There are currently no event defaults.');
        }
    }

    function onGetTokens (tokens) {
        console.log('Postmonger - requestedTokens', tokens);
        // Response: tokens = { token: <legacy token>, fuel2token: <fuel api token> }
    }

    function onGetEndpoints (endpoints) {
        console.log('Postmonger - requestedEndpoints', endpoints);
        // Response: endpoints = { restHost: <url> } i.e. rest.s1.qa1.exacttarget.com
        $( '#endpoints' ).text( JSON.stringify( endpoints , null , 4 ) );
    }

    function onGetSchema (getSchemaPayload) {
        console.log('Postmonger - requestedSchema', getSchemaPayload);
        schemaPayload = getSchemaPayload;
        // Response: getSchemaPayload == { schema: [ ... ] };
        $( '#schema' ).text( JSON.stringify( getSchemaPayload , null , 4 ) );
    }

    function onGetCulture (culture) {
        console.log('Postmonger - requestedCulture', culture);
        // Response: culture == 'en-US'; culture == 'de-DE'; culture == 'fr'; etc.
        $( '#culture' ).text( JSON.stringify( culture , null , 4 ) );
    }

    function onReady (data) {
        console.log('Postmonger - ready', data);
    }

    function onUpdateActivity (data) {
        console.log('Postmonger - updateActivity', data);
    }

    function onClickedNext () {
        console.log('Postmonger - clickedNext', currentStep.key);
        if ((currentStep.key === 'step3' && steps[3].active === false) || currentStep.key === 'step4') {
            save();
        } else {
            connection.trigger('nextStep');
        }
    }

    function onClickedBack () {
        console.log('Postmonger - clickedBack');
        connection.trigger('prevStep');
    }

    function onGotoStep (step) {
        //console.log('Postmonger - gotoStep', step);
        showStep(step);
        connection.trigger('ready');
    }

    function onPayloadChanged() {
        console.log('Payload div - onPayloadChanged');
        if(currentStep && currentStep.key === 'step3') {
            try {
                payload = JSON.parse($('#payload').val());
                updateStep3NextButton(true);
            } catch( e ) {
                updateStep3NextButton(false);
            }
        }
    }

    function updateStep3NextButton(isValid) {
        //console.log('updateStep3NextButton');
        if (lastStepEnabled) {
            connection.trigger('updateButton', { button: 'next', text: 'next', visible: true, enabled: isValid });
        } else {
            connection.trigger('updateButton', { button: 'next', text: 'done', visible: true, enabled: isValid });
        }
    }

    function showStep(step, stepIndex) {
        console.log('showStep', step, stepIndex);
        if (stepIndex && !step) {
            step = steps[stepIndex-1];
        }

        if( initialized ) {
            if( !currentStep || currentStep.key !== step.key ) {
                connection.trigger('gotoStep', step);
            }

            currentStep = step;
        }

        $('.step').hide();

        switch(step.key) {
            case 'step1':
                $('#step1').show();
                connection.trigger('updateButton', { button: 'next', enabled: Boolean(getMessage()) });
                connection.trigger('updateButton', { button: 'back', visible: false });
                break;
            case 'step2':
                $('#step2').show();
                connection.trigger('updateButton', { button: 'back', visible: true });
                connection.trigger('updateButton', { button: 'next', text: 'next', visible: true });
                break;
            case 'step3':
                $('#step3').show();

                preparePayload();
                $('#payload').val(JSON.stringify(payload, null, 4));

                connection.trigger('updateButton', { button: 'back', visible: true });
                updateStep3NextButton(true);
                break;
            case 'step4':
                $('#step4').show();
                break;
        }
    }

    function preparePayload() {
        //When loading the
        if (!schemaPayload.schema){
            connection.trigger('requestSchema');
        }

        // Payload is initialized on populateFields above.  Journey Builder sends an initial payload with defaults
        // set by this activity's config.json file.  Any property may be overridden as desired.

        //1.a) Configure inArguments from the interaction event
        var inArgumentsArray = [];
        var schemaInArgumentsArray = [];
        for (var i = 0; i < schemaPayload.schema.length; i++){
            var name = schemaPayload.schema[i].key.substr(schemaPayload.schema[i].key.lastIndexOf('.') + 1);
            var inArgument = {};
            inArgument[name] = '{{' + schemaPayload.schema[i].key + '}}'
            inArgumentsArray.push(inArgument);

            var schemaInArgument = {};
            schemaInArgument[name] = {};
            schemaInArgument[name].dataType = schemaPayload.schema[i].type;
            schemaInArgument[name].isNullable = schemaPayload.schema[i].isPrimaryKey ? false : (schemaPayload.schema[i].isNullable ? true : false);
            schemaInArgument[name].direction = 'in';
            schemaInArgumentsArray.push(schemaInArgument);
        }

        //1.b) Configure inArguments from the UI (end user manual config)
        var value = getMessage();
        inArgumentsArray.push({ 'message': value });
        schemaInArgumentsArray.push({ 'message': {'dataType': 'Text', 'isNullable':false, 'direction':'in'}});

        //1.c) Set all inArguments in the payload
        payload['arguments'].execute.inArguments = inArgumentsArray;
        payload['schema'].arguments.execute.inArguments = schemaInArgumentsArray;

        //2.a) Configure outArguments
        var outArgumentsArray = [];
        var schemaOutArgumentsArray = [];
        outArgumentsArray.push({ 'result': '' });
        schemaOutArgumentsArray.push({ 'result': {'dataType': 'Text', 'access':'visible', 'direction':'out'}});

        //2.b) Set all outArguments in the payload
        payload['arguments'].execute.outArguments = outArgumentsArray;
        payload['schema'].arguments.execute.outArguments = schemaOutArgumentsArray;

        //3) Set other payload values
        var name = $('#select1').find('option:selected').html();
        payload.name = 'Push ' + name;
        payload['metaData'].isConfigured = true;

        console.log('preparePayload', payload);
    }

    function save() {
        console.log('save', payload);
        connection.trigger('updateActivity', payload);
    }

    function getMessage() {
        //console.log('getMessage');
        return $('#select1').find('option:selected').attr('value').trim() + "1";
    }
});
