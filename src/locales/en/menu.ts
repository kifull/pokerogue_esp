/**
 * The menu namespace holds most miscellaneous text that isn't directly part of the game's
 * contents or directly related to Pokemon data. This includes menu navigation, settings,
 * account interactions, descriptive text, etc.
 */
export const menu = {
    "cancel": "Cancel",
    "continue": "Continue",
    "dailyRun": "Daily Run (Beta)",
    "loadGame": "Load Game",
    "newGame": "New Game",
    "selectGameMode": "Select a game mode.",
    "logInOrCreateAccount": "Log in or create an account to start. No email required!",
    "failedToLoadSaveData": "Failed to load save data. Please reload the page.\nIf this continues, please contact the administrator.",
    "sessionSuccess": "Session loaded successfully.",
    "failedToLoadSession": "Your session data could not be loaded.\nIt may be corrupted.",
    "boyOrGirl": "Are you a boy or a girl?",
    "boy": "Boy",
    "girl": "Girl",
    "bossAppeared": "{{bossName}} appeared.",
    "trainerAppeared": "{{trainerName}}\nwould like to battle!",
    "singleWildAppeared": "A wild {{pokemonName}} appeared!",
    "multiWildAppeared": "A wild {{pokemonName1}}\nand {{pokemonName2}} appeared!",
    "playerComeBack": "Come back, {{pokemonName}}!",
    "trainerComeBack": "{{trainerName}} withdrew {{pokemonName}}!",
    "playerGo": "Go! {{pokemonName}}!",
    "trainerGo": "{{trainerName}} sent out {{pokemonName}}!",
    "switchQuestion": "Will you switch\n{{pokemonName}}?",
    "pokemon": "Pokémon",
    "sendOutPokemon": "Go! {{pokemonName}}!",
    "levelCapUp": "The level cap\nhas increased to {{levelCap}}!",
    "moveNotImplemented": "{{moveName}} is not yet implemented and cannot be selected.",
    "moveDisabled": "{{moveName}} is disabled!",
    "noPokeballForce": "An unseen force\nprevents using Poké Balls.",
    "noPokeballTrainer": "You can't catch\nanother trainer's Pokémon!",
    "noPokeballMulti": "You can only throw a Poké Ball\nwhen there is one Pokémon remaining!",
    "noPokeballStrong": "The target Pokémon is too strong to be caught!\nYou need to weaken it first!",
    "noEscapeForce": "An unseen force\nprevents escape.",
    "noEscapeTrainer": "You can't run\nfrom a trainer battle!",
    "noEscapePokemon": "{{pokemonName}}'s {{moveName}}\nprevents {{escapeVerb}}!",
    "escapeVerbSwitch": "switching",
    "escapeVerbFlee": "fleeing",
    "notDisabled": "{{moveName}} is disabled\nno more!",
} as const;