import { Card } from "./card";
import { GameContext } from "./game-context";
import { GameMode } from "./game-mode.enum";
import { Utils } from "./utils";

export class CodenamesGameContext extends GameContext{

  constructor(mode: GameMode, cardsForBoard: Array<Card>, redScore: number, blueScore: number, isRedTurn: Boolean, isBlueTurn: Boolean){
    super(mode, cardsForBoard, redScore, blueScore, isRedTurn, isBlueTurn);
    Utils.shuffle(cardsForBoard);
  }

}
