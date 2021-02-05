import { Card } from "./card";
import { Face } from "./face.enum";
import { Suit } from "./suit.enum";

export class SequenceCard extends Card{
  face: Face;
  suit: Suit;

  constructor(color: String, selected: Boolean, face: Face, suit: Suit){
    super(color, selected);
    this.face = face;
    this.suit = suit;
  }
}
