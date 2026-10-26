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

const games_list_extended = [
    "Celeste (Open world)",
    "Minecraft (Fabric)",
    "Factorio",
    "Paper Mario 64",
    "Hades",
    "Donkey Kong 64",
    "Hollow Knight",
    "Pokemon Emerald",
    "Ship of Harkinian",
    "Super Mario 64",
    "Link to the Past",
    "Wind Waker",
    "Twilight Princess",
    "LADX",
    "Super Mario Sunshine",
    "Pokemon Red/Blue",
    "Pokemon FRLG",
    "Pokemon Crystal",
    "TUNIC",
    "Crypt of the Necrodancer",
    "Resident Evil 2",
    "DOOM",
    "DOOM II",
    "Banjo-Tooie",
    "Roller Coaster Tycoon 2",
    "Mario Kart 64",
    "Paper Mario TTYD",
    "Super Metroid",
    "Metroid Prime",
    "SMZ3",
    "Castlevania COTM",
    "Castlevania SOTN",
    "Super Mario RPG",
    "Mega Man 2",
    "Mega Man 3",
    "Mega Man X",
    "Mega Man X2",
    "Mega Man X3"
];

const tags_list_extended = {
    "Celeste (Open world)": ["PC", "Platformer"],
    "Minecraft (Fabric)": ["PC", "Survival", "FirstPerson"],
    "Factorio": ["PC", "Survival", "Simulation"],
    "Paper Mario 64": ["N64", "RPG", "Mario"],
    "Hades": ["PC", "Roguelike"],
    "Donkey Kong 64": ["N64", "Collectathon"],
    "Hollow Knight": ["PC", "Metroidvania"],
    "Pokemon Emerald": ["GBA", "RPG", "Pokemon"],
    "Ship of Harkinian": ["N64", "Metroidvania", "Zelda"],
    "Super Mario 64": ["N64", "Platformer", "Collectathon", "Mario"],

    "Link to the Past": ["SNES", "Metroidvania", "Zelda"],
    "Wind Waker": ["GC", "Metroidvania", "Zelda"],
    "Twilight Princess": ["GC", "Metroidvania", "Zelda"],
    "LADX": ["GB", "Metroidvania", "Zelda"],

    "Super Mario Sunshine": ["GC", "Platformer", "Collectathon", "Mario"],

    "Pokemon Red/Blue": ["GB", "RPG", "Pokemon"],
    "Pokemon FRLG": ["GBA", "RPG", "Pokemon"],
    "Pokemon Crystal": ["GB", "RPG", "Pokemon"],

    "TUNIC": ["PC", "Metroidvania"],
    "Crypt of the Necrodancer": ["PC", "Rhythm"],
    "Resident Evil 2": ["PC", "Horror", "Shooter"],

    "DOOM": ["PC", "Shooter", "DOOM"],
    "DOOM II": ["PC", "Shooter", "DOOM"],

    "Banjo-Tooie": ["N64", "Collectathon"],
    "Roller Coaster Tycoon 2": ["PC", "Simulation"],
    "Mario Kart 64": ["N64", "Racing", "Mario"],
    "Paper Mario TTYD": ["GC", "RPG", "Mario"],

    "Super Metroid": ["SNES", "Metroidvania", "Metroid"],
    "Metroid Prime": ["GC", "Metroidvania", "FirstPerson"],
    "SMZ3": ["SNES", "Metroidvania", "Zelda", "Metroid"],

    "Castlevania COTM": ["GBA", "Metroidvania", "Castlevania"],
    "Castlevania SOTN": ["PSX", "Metroidvania", "Castlevania"],

    "Super Mario RPG": ["SNES", "RPG", "Mario"],

    "Mega Man 2": ["NES", "Platformer", "MegaMan"],
    "Mega Man 3": ["NES", "Platformer", "MegaMan"],
    "Mega Man X": ["SNES", "Platformer", "MegaMan"],
    "Mega Man X2": ["SNES", "Platformer", "MegaMan"],
    "Mega Man X3": ["SNES", "Platformer", "MegaMan"],
}

const updated_weights = function(games, tags, current_chosen) {
    var weights = [];
    games.forEach(game => {
        if (current_chosen.includes(game))
            weights.push(0);
        else
            weights.push(0.75 ** chosen_contains_tags(tags, game, current_chosen));
    });
    return weights
}


const chosen_contains_tags = function(tags, candidate, current_chosen) {
    var val = 0;
    tags[candidate].forEach(tag => {
        current_chosen.forEach(chosen => {
            if (tags[chosen].includes(tag))
                val += 1;
        });
    });

    return val
}


const roll_three_games = function(games, tags) {
    var random_game = games[Math.floor(Math.random() * games.length)];
    //overall_chosen[random_game] += 1
    var games_chosen = [random_game];

    var weights = updated_weights(games, tags, games_chosen);
    random_game = weighted_random(games, weights);
    //overall_chosen[random_game] += 1
    games_chosen.push(random_game);

    weights = updated_weights(games, tags, games_chosen);
    random_game = weighted_random(games, weights);
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

var goods = 0;
var totals = 0;

$("#roll").on("click", function() {
    var list_type = $('input[name="list-type"]:checked').val();
    var rolled = [];
    if (list_type == "short") {
        rolled = roll_three_games(games_list, tags_list);
    } else {
        rolled = roll_three_games(games_list_extended, tags_list_extended);
    }
    $("#game-1").text(rolled[0]);
    $("#game-2").text(rolled[1]);
    $("#game-3").text(rolled[2]);
    totals += 1;

    $("#good-count").text("You've hit " + goods + " 'Goods' out of " + totals);
    $("#good-button").show();

    $("#roll").text("Again!");
});

$("#good-button").on("click", function() {
    goods += 1;
    $("#good-count").text("You've hit " + goods + " 'Goods' out of " + totals);
    $("#good-button").hide();
});