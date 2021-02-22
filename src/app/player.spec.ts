import { Player } from './player';
import { PlayingCard } from './playing-card';

describe('Player', () => {
  it('should create an instance', () => {
    expect(new Player(0, 'John', new Array<PlayingCard>(), "red")).toBeTruthy();
  });
});
