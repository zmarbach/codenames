import { Card } from "./card";
import { GameContext } from "./game-context";
import { GameMode } from "./game-mode.enum";

export class CodenamesGameContext extends GameContext{

  constructor(mode: GameMode, cards: Array<Card>, redScore: number, blueScore: number, isRedTurn: Boolean, isBlueTurn: Boolean){
    super(mode, cards, redScore, blueScore, isRedTurn, isBlueTurn);
  }

}
