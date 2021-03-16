import { Card } from "./card";
import { Face } from "../face";
import { Suit } from "../suit.enum";

export class PlayingCard extends Card{
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
    if (this.face === Face.FREE){
      return this.face.displayName;
    } else {
      return this.face.displayName + " " + this.suit.toString();
    }
  }

  isFreeSpace(): Boolean{
   return this.face === Face.FREE;
  }

  isTwoEyedJack(): Boolean{
    return this.face === Face.TWO_EYED_JACK;
  }

  isOneEyedJack(): Boolean{
    return this.face === Face.ONE_EYED_JACK;
  }
}
