import { Card } from './card';
import { GameMode } from './game-mode.enum';

export abstract class GameContext {
  mode: GameMode;
  cardsForBoard: Array<Card> = [];
  redScore = 0;
  blueScore = 0;
  isRedTurn: Boolean = false;
  isBlueTurn: Boolean = false;

  constructor(mode: GameMode, cardsForBoard: Array<Card>, redScore: number, blueScore: number, isRedTurn: Boolean, isBlueTurn: Boolean){
    this.mode = mode;
    this.cardsForBoard = cardsForBoard;
    this.redScore = redScore;
    this.blueScore = blueScore;
    this.isRedTurn = isRedTurn;
    this.isBlueTurn = isBlueTurn;
  }
}
