import { Card } from "./card";
import { Face } from "./face";
import { Suit } from "./suit.enum";

export class SequenceCard extends Card{
  face: Face;
  suit: Suit;
  displayValue: String;

  constructor(color: String, selected: Boolean, face: Face, suit: Suit){
    super(color, selected);
    this.face = face;
    this.suit = suit;
    this.displayValue = this.getDisplayValue();
  }

  public getDisplayValue(){
    return this.face.displayName + " " + this.suit.toString();
  }
}
