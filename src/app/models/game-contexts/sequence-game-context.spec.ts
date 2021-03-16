import { Card } from '../cards/card';
import { GameMode } from '../game-mode.enum';
import { Player } from '../player';
import { SequenceGameContext } from './sequence-game-context';

describe('SequenceGameContext', () => {
  it('should create an instance', () => {
    let dummyPlayerList = new Array<Player>(new Player(1234, 'bob', [], 'red'), new Player(5678, 'joe', [], 'blue'));
    expect(new SequenceGameContext(dummyPlayerList, GameMode.SEQUENCE, new Array<Card>(),0, 0, true, false)).toBeTruthy();
  });
});
