const games_list = [
    "Celeste (Open world)",
    "Minecraft (Fabric)",
    "Factorio",
    "Paper Mario 64",
    "Hades",
    "Donkey Kong 64",
    "Hollow Knight",
    "Pokemon Emerald",
    "Ship of Harkinian",
    "Super Mario 64"
];

const tags_list = {
    "Celeste (Open world)": [],
    "Minecraft (Fabric)": [],
    "Factorio": [],
    "Paper Mario 64": [],
    "Hades": [],
    "Donkey Kong 64": [],
    "Hollow Knight": [],
    "Pokemon Emerald": [],
    "Ship of Harkinian": [],
    "Super Mario 64": [],
};

const updated_weights = function(current_chosen) {
    var weights = [];
    games_list.forEach(game => {
        if (current_chosen.includes(game))
            weights.push(0);
        else
            weights.push(0.75 ** chosen_contains_tags(game, current_chosen));
    });
    return weights
}


const chosen_contains_tags = function(candidate, current_chosen) {
    var val = 0;
    tags_list[candidate].forEach(tag => {
        current_chosen.forEach(chosen => {
            if (tags_list[chosen].includes(tag))
                val += 1;
        });
    });

    return val
}


const roll_three_games = function() {
    var random_game = games_list[Math.floor(Math.random() * games_list.length)];
    //overall_chosen[random_game] += 1
    var games_chosen = [random_game];

    var weights = updated_weights(games_chosen);
    random_game = weighted_random(games_list, weights);
    //overall_chosen[random_game] += 1
    games_chosen.push(random_game);

    weights = updated_weights(games_chosen);
    random_game = weighted_random(games_list, weights);
    //overall_chosen[random_game] += 1
    games_chosen.push(random_game);

    return games_chosen;
}

function weighted_random(items, weights) {
    var i;

    for (i = 1; i < weights.length; i++)
        weights[i] += weights[i - 1];

    var random = Math.random() * weights[weights.length - 1];

    for (i = 0; i < weights.length; i++)
        if (weights[i] > random)
            break;

    return items[i];
}

$("#roll").on("click", function() {
    var rolled = roll_three_games();
    $("#game-1").text(rolled[0]);
    $("#game-2").text(rolled[1]);
    $("#game-3").text(rolled[2]);
});