import { Card } from './card';
import { GameMode } from './game-mode.enum';

export abstract class GameContext {
  mode: GameMode;
  cards: Array<Card> = [];
  redScore = 0;
  blueScore = 0;
  isRedTurn: Boolean = false;
  isBlueTurn: Boolean = false;

  constructor(mode: GameMode, cards: Array<Card>, redScore: number, blueScore: number, isRedTurn: Boolean, isBlueTurn: Boolean){
    this.mode = mode;
    this.cards = cards;
    this.redScore = redScore;
    this.blueScore = blueScore;
    this.isRedTurn = isRedTurn;
    this.isBlueTurn = isBlueTurn;
  }
}
