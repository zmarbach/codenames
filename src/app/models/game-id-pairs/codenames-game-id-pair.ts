import { CodenamesGameContext } from "../game-contexts/codenames-game-context";
import { GameIdPair } from "./game-id-pair";

export class CodenamesGameIdPair extends GameIdPair{
  id: String;
  game: CodenamesGameContext;

  constructor(id: String, game: CodenamesGameContext){
    super(id, game);
  }
}