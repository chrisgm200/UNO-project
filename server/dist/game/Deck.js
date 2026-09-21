"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFullDeck = buildFullDeck;
exports.shuffle = shuffle;
exports.drawCards = drawCards;
const Card_1 = require("./Card");
const COLORS = ['red', 'yellow', 'green', 'blue'];
function buildFullDeck() {
    const deck = [];
    for (const color of COLORS) {
        deck.push((0, Card_1.createCard)(color, '0')); // un solo 0 por color
        for (let n = 1; n <= 9; n++) {
            deck.push((0, Card_1.createCard)(color, String(n)));
            deck.push((0, Card_1.createCard)(color, String(n)));
        }
        ['skip', 'reverse', 'draw2'].forEach((v) => {
            deck.push((0, Card_1.createCard)(color, v));
            deck.push((0, Card_1.createCard)(color, v));
        });
    }
    for (let i = 0; i < 4; i++) {
        deck.push((0, Card_1.createCard)('wild', 'wild'));
        deck.push((0, Card_1.createCard)('wild', 'wild4'));
    }
    return shuffle(deck);
}
function shuffle(cards) {
    const arr = [...cards];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
// Saca `count` cartas del mazo; si se acaba, reciclamos el descarte (menos la última carta)
function drawCards(deck, discardPile, count) {
    let workingDeck = [...deck];
    let workingDiscard = [...discardPile];
    const drawn = [];
    for (let i = 0; i < count; i++) {
        if (workingDeck.length === 0) {
            const top = workingDiscard.pop();
            workingDeck = shuffle(workingDiscard);
            workingDiscard = [top];
        }
        const card = workingDeck.pop();
        if (card)
            drawn.push(card);
    }
    return { drawn, deck: workingDeck, discardPile: workingDiscard };
}
