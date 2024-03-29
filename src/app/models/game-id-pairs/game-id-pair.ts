import { GameContext } from '../game-contexts/game-context';

export abstract class GameIdPair {
  id: String;
  game: GameContext;

  constructor(id: String, game: GameContext){
    this.id = id;
    this.game = game;
  }
}
