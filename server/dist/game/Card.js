"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCard = createCard;
exports.isWild = isWild;
exports.isNumberCard = isNumberCard;
exports.canPlay = canPlay;
const nanoid_1 = require("nanoid");
function createCard(color, value) {
    return { id: (0, nanoid_1.nanoid)(8), color, value };
}
function isWild(card) {
    return card.value === 'wild' || card.value === 'wild4';
}
function isNumberCard(card) {
    return !isNaN(Number(card.value));
}
// ¿Se puede jugar `card` sobre `topCard`, dado el color activo?
function canPlay(card, topCard, activeColor) {
    if (isWild(card))
        return true;
    if (card.color === activeColor)
        return true;
    if (card.value === topCard.value)
        return true;
    return false;
}
