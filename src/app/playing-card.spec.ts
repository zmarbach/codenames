import { Face } from './face';
import { PlayingCard } from './playing-card';
import { Suit } from './suit.enum';

describe('PlayingCard', () => {
  it('should create an instance', () => {
    expect(new PlayingCard('red', false, Face.ACE, Suit.CLUB)).toBeTruthy();
  });
});
