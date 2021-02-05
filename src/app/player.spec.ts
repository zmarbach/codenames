import { Player } from './player';
import { SequenceCard } from './sequence-card';

describe('Player', () => {
  it('should create an instance', () => {
    expect(new Player(0, 'John', new Array<SequenceCard>())).toBeTruthy();
  });
});
