import { Card } from './card';
import { GameContext } from './game-context';
import { GameIdPair } from './game-id-pair';

describe('GameIdPair', () => {
  it('should create an instance', () => {
    expect(new GameIdPair('abcd1234', new GameContext(new Array<Card>(), 0, 0, false, false))).toBeTruthy();
  });
});
