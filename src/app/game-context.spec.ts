import { Card } from './card';
import { GameContext } from './game-context';

describe('GameContext', () => {
  it('should create an instance', () => {
    expect(new GameContext(new Array<Card>(), 0, 0, false, false)).toBeTruthy();
  });
});
