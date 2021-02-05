import { Card } from "./card";
import { GameContext } from "./game-context";
import { GameMode } from "./game-mode.enum";
import { Player } from "./player";

export class SequenceGameContext extends GameContext{
  players: Array<Player> = [];

  constructor(players: Array<Player>, mode: GameMode, cards: Array<Card>, redScore: number, blueScore: number, isRedTurn: Boolean, isBlueTurn: Boolean){
    super(mode, cards, redScore, blueScore, isRedTurn, isBlueTurn);
    this.players = players;
  }
}


