import { Client } from "./js/archipelago.min.js";

const getClassificationString = function(flags) {
    var classification = "filler";
    if (flags & 1) classification = "progression";
    if (flags & 2) classification = "useful";
    if (flags & 4) classification = "trap";

    return classification;
}

const teamClientMessage = function(teamClass) {
    return function(content, item, nodes) {
        var messageElement = $('<div>', {
            id: "message",
            class: "apclient-message"
        });
        $(messageElement).addClass(teamClass);
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

        $("#text-client").append(messageElement);
    }
};
const left_client = new Client();
const right_client = new Client();

left_client.messages.on("itemSent", teamClientMessage("left"));
right_client.messages.on("itemSent", teamClientMessage("right"));

$("#left-connect-button").on("click", function() {
    var path = $("#left-server-address").val();
    var slot = $("#left-server-slot").val();

    console.log("Connecting to " + path + " as " + slot);
    left_client.login(path, slot)
        .then(() => console.log("Connected to the Archipelago server!"))
        .catch(console.error);
});

$("#right-connect-button").on("click", function() {
    var path = $("#right-server-address").val();
    var slot = $("#right-server-slot").val();

    console.log("Connecting to " + path + " as " + slot);
    right_client.login(path, slot)
        .then(() => console.log("Connected to the Archipelago server!"))
        .catch(console.error);
});