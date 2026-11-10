var TOPICS = [
    "Measurements",
    "Atomic Structure",
    "Periodic Table",
    "Chemical Bonding",
    "IMF",
    "States of Matter",
    "Chemical Equations",
    "Chemical Reactions",
    "Gas Laws",
    "Solutions",
    "Acids and Bases",
    "Thermochemistry",
    "General Chemistry"
];

var wordBank = [];
for(var i = 0; i < TOPICS.length; i++){
    var topic = TOPICS[i];
    var entries = window.CHEMISTRY_WORD_BANK && window.CHEMISTRY_WORD_BANK[topic];
    if(!Array.isArray(entries)){
        throw new Error("Missing word-bank script for topic: " + topic);
    }
    wordBank = wordBank.concat(entries);
}
