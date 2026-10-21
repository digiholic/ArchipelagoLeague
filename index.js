import { Client, defaultConnectionOptions } from "./js/archipelago.js";
import { ProgressBar } from "./js/progressBar.js"

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const connect = function(client, address, slot, password, side) {
    if (address == null || address == "") return;
    if (slot == null || slot == "") return;

    var connectionOptions = defaultConnectionOptions;
    if (password != null && password != "")
        connectionOptions.password = password;

    console.log("Connecting to [" + address + "] as [" + slot + "]");
    client.login(address, slot, undefined, connectionOptions)
        .then(() => {
            console.log("Connected to the Archipelago server!");
            populatePlayers(client, side);
        })
        .catch(console.error);
}

const progressBars = {};

const populatePlayers = function(client, side) {
    if (progressBars[side] == null) progressBars[side] = {};

    for (var n in client.players.slots) {
        var slot = client.players.slots[n];
        var slotElement = $("<div>", {
            class: "slot-info"
        });
        $("<p>").addClass("slot-name").append(slot.name).appendTo(slotElement);
        $("<p>").addClass("slot-game").append(slot.game).appendTo(slotElement);

        var progressBar = new ProgressBar(n, slot.name);
        slotElement.append(progressBar.buildDOMElement());
        progressBars[side][n] = progressBar;
        syncProgression(side, n);

        $("#" + side + "-slots").append(slotElement);
    }
    console.log(progressBars);
}

const syncProgression = function(side, player_id) {
    if (checkCounts[side] != null && checkCounts[side][player_id] != null) {
        var items_collected = checkCounts[side][player_id]["done"];
        var items_total = checkCounts[side][player_id]["total"];
        var progressBar = progressBars[side][player_id];
        progressBar.updateValue(items_collected, items_total);
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
                    checkCounts[teamClass][node.part.player]["done"] = checkCounts[teamClass][node.part.player]["done"] + 1;
                    syncProgression(teamClass, node.part.player);
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
        enqueueFunction(() => {
            $("#text-client").append(messageWrapper);
        });
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
    $("left-slots").empty();
});

right_client.socket.on("disconnected", function() {
    $("#right-connections").show();
    $("#right-slots").hide();
    $("#right-slots").empty();
});

$("#left-connect-button").on("click", function() {
    var path = $("#left-server-address").val();
    var slot = $("#left-server-slot").val();
    var passwd = $("#left-server-passwd").val();

    connect(left_client, path, slot, passwd, "left");
    trackerApi($("#left-tracker-url").val(), "left");
});

$("#right-connect-button").on("click", function() {
    var path = $("#right-server-address").val();
    var slot = $("#right-server-slot").val();
    var passwd = $("#right-server-passwd").val();

    connect(right_client, path, slot, passwd, "right");
    trackerApi($("#right-tracker-url").val(), "right");
});

$("#copy-url").on("click", function() {
    var data = {
        autoconnect: "false",

        nameA: $("#left-team-name").val(),
        serverA: $("#left-server-address").val(),
        slotA: $("#left-server-slot").val(),
        passwdA: $("#left-server-passwd").val(),
        trackerA: $("#left-tracker-url").val(),

        player1A: $("#left-player-1-name").val(),
        player2A: $("#left-player-2-name").val(),
        player3A: $("#left-player-3-name").val(),

        stream1A: $("#left-player-1-stream").val(),
        stream2A: $("#left-player-2-stream").val(),
        stream3A: $("#left-player-3-stream").val(),

        nameB: $("#right-team-name").val(),
        serverB: $("#right-server-address").val(),
        slotB: $("#right-server-slot").val(),
        passwdB: $("#right-server-passwd").val(),
        trackerB: $("#right-tracker-url").val(),

        player1B: $("#right-player-1-name").val(),
        player2B: $("#right-player-2-name").val(),
        player3B: $("#right-player-3-name").val(),

        stream1B: $("#right-player-1-stream").val(),
        stream2B: $("#right-player-2-stream").val(),
        stream3B: $("#right-player-3-stream").val(),
    };

    var queryStr = new URLSearchParams(data).toString();
    var querylessUrl = location.protocol + "//" + location.host + location.pathname;
    //console.log(querylessUrl.toString() + "?" + queryStr);
    navigator.clipboard.writeText(querylessUrl + "?" + queryStr);
});

const checkCounts = {}

const trackerApi = async function(trackerUrl, side) {
    if (checkCounts[side] == null) checkCounts[side] = {};

    var trackerApiUrl = trackerUrl.replace("/tracker", "/api/tracker");
    const trackerResponse = await fetch(trackerApiUrl);
    const trackerResultJson = await trackerResponse.json();

    var staticTrackerApiUrl = trackerApiUrl.replace("/tracker", "/static_tracker");
    const staticTrackerResponse = await fetch(staticTrackerApiUrl);
    const staticTrackerResultJson = await staticTrackerResponse.json();

    for (var key in trackerResultJson.player_checks_done) {
        var player_id = trackerResultJson.player_checks_done[key].player;
        var checks_done = trackerResultJson.player_checks_done[key].locations.length;
        var checks_total = staticTrackerResultJson.player_locations_total[key].total_locations;
        checkCounts[side][player_id] = {
            done: checks_done,
            total: checks_total
        };

        if (progressBars[side] != null && progressBars[side][player_id] != null) {
            console.log(progressBars[side][player_id]);
            progressBars[side][player_id].updateValue(checks_done, checks_total);
        }
    }
}

const getStreamEmbedDOMelement = function(channel) {
    var frame = $("<iframe>", {
        src: "https://player.twitch.tv/?autoplay=true&muted=true&channel=" + channel + "&parent=digiholic.github.io",
        height: 265,
        width: 470
    });
    console.log(frame);
    return frame;
}

const init = function() {
    var nameA = urlParams.get("nameA");
    var serverA = urlParams.get("serverA");
    var slotA = urlParams.get("slotA");

    $("#left-server-address").val(serverA);
    $("#left-server-slot").val(slotA);
    $("#left-server-passwd").val(passwdA);

    var passwdA = urlParams.get("passwdA");
    var trackerA = urlParams.get("trackerA")

    $("#left-team-name").val(nameA);
    $("#team-header-left").text(nameA);
    $("#left-tracker-url").val(trackerA);

    var player1A = urlParams.get("player1A");
    var player2A = urlParams.get("player2A");
    var player3A = urlParams.get("player3A");

    $("#left-player-1-name").val(player1A);
    $("#left-player-2-name").val(player2A);
    $("#left-player-3-name").val(player3A);

    var stream1A = urlParams.get("stream1A");
    var stream2A = urlParams.get("stream2A");
    var stream3A = urlParams.get("stream3A");

    $("#left-player-1-stream").val(stream1A);
    $("#left-player-2-stream").val(stream2A);
    $("#left-player-3-stream").val(stream3A);

    var nameB = urlParams.get("nameB");
    var serverB = urlParams.get("serverB");
    var slotB = urlParams.get("slotB");

    $("#right-server-address").val(serverB);
    $("#right-server-slot").val(slotB);
    $("#right-server-passwd").val(passwdB);

    var passwdB = urlParams.get("passwdB");
    var trackerB = urlParams.get("trackerB");

    $("#right-team-name").val(nameB);
    $("#team-header-right").text(nameB);
    $("#right-tracker-url").val(trackerB);

    var player1B = urlParams.get("player1B");
    var player2B = urlParams.get("player2B");
    var player3B = urlParams.get("player3B");

    $("#right-player-1-name").val(player1B);
    $("#right-player-2-name").val(player2B);
    $("#right-player-3-name").val(player3B);

    var stream1B = urlParams.get("stream1B");
    var stream2B = urlParams.get("stream2B");
    var stream3B = urlParams.get("stream3B");

    $("#right-player-1-stream").val(stream1B);
    $("#right-player-2-stream").val(stream2B);
    $("#right-player-3-stream").val(stream3B);

    if (urlParams.get("autoconnect") == "true") {
        connect(left_client, serverA, slotA, passwdA, "left");
        setTimeout(() => connect(right_client, serverB, slotB, passwdB, "right"), 100);

        trackerApi($("#left-tracker-url").val(), "left");
        trackerApi($("#right-tracker-url").val(), "right");

        $("footer").hide();
    }

    enqueueFunction(() => $("#left-stream-1").append(getStreamEmbedDOMelement(stream1A)));
    enqueueFunction(() => $("#left-stream-2").append(getStreamEmbedDOMelement(stream2A)));
    enqueueFunction(() => $("#left-stream-3").append(getStreamEmbedDOMelement(stream3A)));

    enqueueFunction(() => $("#right-stream-1").append(getStreamEmbedDOMelement(stream1B)));
    enqueueFunction(() => $("#right-stream-2").append(getStreamEmbedDOMelement(stream2B)));
    enqueueFunction(() => $("#right-stream-3").append(getStreamEmbedDOMelement(stream3B)));
}

init();