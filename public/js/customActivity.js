'use strict';

define(function (require) {
    var Postmonger = require('postmonger');
    var connection = new Postmonger.Session();

    var payload = {};
    var authTokens = {};

    var eventDefinitionKey = '';
    var templateName = '';

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);
    connection.on('requestedInteraction', requestedInteractionHandler);
    connection.on('clickedNext', save);

    function onRender() {
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
        connection.trigger('requestInteraction');

        $('#toggleActive').click(function () {
            document.getElementById('templateCode').disabled = true;
            templateName = $('#templateCode').val();
            document.getElementById('toggleActive').disabled = true;
            document.getElementById('toggleActive').innerHTML = "Ativado";
        });
    }

    function initialize(data) {
        if (data) {
            payload = data;
        }

        templateName = payload['arguments'].templateName;

        if (templateName) {
            document.getElementById('templateCode').disabled = true;
            document.getElementById('templateCode').value = templateName;
            document.getElementById('toggleActive').disabled = true;
            document.getElementById('toggleActive').innerHTML = "Ativado";
        }
    }

    function onGetTokens(tokens) {
        console.log(tokens);
        authTokens = tokens;
    }

    function onGetEndpoints(endpoints) {
        console.log(endpoints);
    }

    function requestedInteractionHandler(settings) {
        try {
            eventDefinitionKey = settings.triggers[0].metaData.eventDefinitionKey;
            document.getElementById('select-entryevent-defkey').value = eventDefinitionKey;
        } catch (err) {
            console.error(err);
        }
    }

    function save() {
        payload['arguments'].templateName = templateName;
        payload['arguments'].account = whatsappAccount;

        payload['arguments'].execute.inArguments = [{
            "tokens": authTokens,
            "contactIdentifier": "{{Contact.Key}}",
            "contactNameEvent": `{{Event.${eventDefinitionKey}.\"Primeiro_nome_de_cliente__c\"}}`,
            "contactNameEventCase": `{{Event.${eventDefinitionKey}.\"Case:Conta_XP__r:Primeiro_nome_de_cliente__c\"}}`,
            "phoneNumberEvent": `{{Event.${eventDefinitionKey}.\"Celular_Mkt_Cloud__c\"}}`,
            "phoneNumberEventCase": `{{Event.${eventDefinitionKey}.\"Case:Conta_XP__r:Celular_Mkt_Cloud__c\"}}`,
            "templateName": templateName,
            "account": whatsappAccount
        }];

        payload['metaData'].isConfigured = true;

        console.log('payload', JSON.stringify(payload));

        connection.trigger('updateActivity', payload);
    }
});