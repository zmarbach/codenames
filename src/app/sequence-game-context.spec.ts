import { Card } from './card';
import { GameMode } from './game-mode.enum';
import { Player } from './player';
import { SequenceGameContext } from './sequence-game-context';

describe('SequenceGameContext', () => {
  it('should create an instance', () => {
    expect(new SequenceGameContext(new Array<Player>(), GameMode.SEQUENCE, new Array<Card>(),0, 0, true, false)).toBeTruthy();
  });
});
