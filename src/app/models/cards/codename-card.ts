import { Card } from "./card";

export class CodenameCard extends Card {
  word: String = '';
  imgPath: String = '';

  constructor(color: String, selected: Boolean, word: String, imgPath: String){
    super(color, selected);
    this.word = word;
    this.imgPath = imgPath;
  }
}
