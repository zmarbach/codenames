import { SequenceGameContext } from "./game-contexts/sequence-game-context";
import { GameIdPair } from "./game-id-pair";

export class SequenceGameIdPair extends GameIdPair{
  id: String;
  game: SequenceGameContext;

  constructor(id: String, game: SequenceGameContext){
    super(id, game);
  }
}