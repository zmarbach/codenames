import { Card } from './card';

export class GameContext {
  id: number;
  cards: Array<Card> = [];
  redScore: number = 0;
  blueScore: number = 0;
  isRedTurn: Boolean = false;
  isBlueTurn: Boolean = false;

  constructor(id: number, cards: Array<Card>, redScore: number, blueScore: number, isRedTurn: Boolean, isBlueTurn: Boolean){
    this.id = id;
    this.cards = cards;
    this.redScore = redScore;
    this.blueScore = blueScore;
    this.isRedTurn = isRedTurn;
    this.isBlueTurn = isBlueTurn;
  }
}
