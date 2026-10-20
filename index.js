import { Client, defaultConnectionOptions } from "./js/archipelago.js";
import { ProgressBar } from "./js/progressBar.js"

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);


const connect = function(client, address, slot, password) {
    if (address == null || address == "") return;
    if (slot == null || slot == "") return;

    var connectionOptions = defaultConnectionOptions;
    if (password != null && password != "")
        connectionOptions.password = password;

    client.login(address, slot, undefined, connectionOptions)
        .then(() => populatePlayers(client))
        .catch(console.error);
}

const populatePlayers = function(client) {
    console.log(client.players.slots);
    for (var n in client.players.slots) {
        var slot = client.players.slots[n];
        var slotElement = $("<div>", {
            class: "slot-info"
        });
        var nameElement = $("<p>");
        nameElement.append(slot.name);
        slotElement.append(nameElement);
        /*
        var progressBar = new ProgressBar(1, "Player1", 100, "green");
        console.log(progressBar);
        slotElement.append(progressBar.buildDOMElement());
        progressBar.updateValue(50, false);
        */

        $("#left-slots").append(slotElement);
    }
}

const getClassificationString = function(flags) {
    var classification = "filler";
    if (flags & 4) classification = "trap";
    if (flags & 2) classification = "useful";
    if (flags & 1) classification = "progression";

    return classification;
}

const teamClientMessage = function(teamClass) {
    return function(content, item, nodes) {
        var messageWrapper = $("<div>", {
            id: "message-wrapper",
            class: "apclient-message-wrapper"
        });
        messageWrapper.addClass(teamClass);
        var messageElement = $('<div>', {
            id: "message",
            class: "apclient-message"
        });
        $(messageElement).addClass(teamClass);
        messageWrapper.append(messageElement);

        nodes.forEach(node => {
            switch (node.type) {
                case "player":
                    var playerNode = $('<span>', {
                        id: "player-" + node.part.player_id,
                        class: "player-" + node.part.player_name
                    }).appendTo(messageElement);
                    playerNode.append(node.player.alias);
                    break;
                case "item":
                    var classification = getClassificationString(node.part.flags);
                    messageWrapper.addClass("item-" + classification);
                    var itemNode = $('<span>', {
                        id: "item",
                        class: "item-" + classification
                    }).appendTo(messageElement);
                    itemNode.append(node.toString());
                    break;
                case "location":
                    var locationNode = $('<span>', {
                        id: "location",
                        class: "location"
                    }).appendTo(messageElement);
                    locationNode.append(node.toString());
                    break;
                case "color":
                    var colorNode = $('<span>', {
                        id: "color",
                        class: "color"
                    }).appendTo(messageElement);
                    colorNode.append(node.part.text);
                    break;
                case "text":
                    var textNode = $('<span>', {
                        id: "text",
                        class: "text"
                    }).appendTo(messageElement);
                    textNode.append(node.part.text);
                    break;
                case "entrance":
                    var entranceNode = $('<span>', {
                        id: "entrance",
                        class: "entrance"
                    }).appendTo(messageElement);
                    entranceNode.append(node.part.text);
                    break;
            }
        });
        enqueueFunction(() => $("#text-client").append(messageWrapper));
    }
};

const functionQueue = [];
var pendingFunction = false;
const functionDelay = 500;
const enqueueFunction = function(fn) {
    functionQueue.push(fn);
    executeNextFunction();
}

const executeNextFunction = function() {
    if (pendingFunction) {
        setTimeout(executeNextFunction, functionDelay)
    } else {
        if (functionQueue.length == 0) return;

        var fn = functionQueue[0];
        functionQueue.splice(0, 1);

        fn();
        pendingFunction = true;
        setTimeout(() => pendingFunction = false, functionDelay);
        setTimeout(executeNextFunction, functionDelay)
    }
}

const left_client = new Client();
window.left_client = left_client;
const right_client = new Client();

left_client.messages.on("itemSent", teamClientMessage("left"));
right_client.messages.on("itemSent", teamClientMessage("right"));

left_client.socket.on("connected", function() {
    $("#left-connections").hide();
    $("#left-slots").show();
});

right_client.socket.on("connected", function() {
    $("#right-connections").hide();
    $("#right-slots").show();
});

left_client.socket.on("disconnected", function() {
    $("#left-connections").show();
    $("#left-slots").hide();
    $("left-slots").replaceChildren();
});

right_client.socket.on("disconnected", function() {
    $("#right-connections").show();
    $("#right-slots").hide();
    $("#right-slots").replaceChildren();
});

$("#left-connect-button").on("click", function() {
    var path = $("#left-server-address").val();
    var slot = $("#left-server-slot").val();

    connect(left_client, path, slot, null);
});

$("#right-connect-button").on("click", function() {
    var path = $("#right-server-address").val();
    var slot = $("#right-server-slot").val();
    connect(right_client, path, slot, null);
});

const init = function() {
    var serverA = urlParams.get("serverA");
    var slotA = urlParams.get("slotA");
    var passwdA = urlParams.get("passwdA");

    var serverB = urlParams.get("serverB");
    var slotB = urlParams.get("slotB");
    var passwdB = urlParams.get("passwdB");

    connect(left_client, serverA, slotA, passwdA);
    connect(right_client, serverB, slotB, passwdB);
}

init();