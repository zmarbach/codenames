import { CodenameCard } from './codename-card';

describe('CodenameCard', () => {
  it('should create an instance', () => {
    expect(new CodenameCard('', false, '', '')).toBeTruthy();
  });
});
