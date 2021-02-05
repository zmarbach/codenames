import { Card } from './card';
import { CodenamesGameContext } from './codenames-game-context';
import { GameIdPair } from './game-id-pair';
import { GameMode } from './game-mode.enum';

describe('GameIdPair', () => {
  it('should create an instance', () => {
    expect(new GameIdPair('abcd1234', new CodenamesGameContext(GameMode.CODENAMES_WORDS, new Array<Card>(), 0, 0, false, false))).toBeTruthy();
  });
});
