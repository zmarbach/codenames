import { Face } from './face.enum';
import { SequenceCard } from './sequence-card';
import { Suit } from './suit.enum';

describe('SequenceCard', () => {
  it('should create an instance', () => {
    expect(new SequenceCard('red', false, Face.ACE, Suit.CLUB)).toBeTruthy();
  });
});
