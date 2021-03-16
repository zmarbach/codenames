import { Card } from '../cards/card';
import { CodenamesGameContext } from './codenames-game-context';
import { GameMode } from '../game-mode.enum';

describe('CodenamesGameContext', () => {
  it('should create an instance', () => {
    expect(new CodenamesGameContext(GameMode.CODENAMES_WORDS, new Array<Card>(), 0, 0, true, false)).toBeTruthy();
  });
});
