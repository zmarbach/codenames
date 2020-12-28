export class Card {
  word: String = '';
  imgPath: String = '';
  color: String = '';
  selected: Boolean = false;

  constructor(word: String, imgPath: String, color: String, selected: Boolean){
    this.word = word;
    this.imgPath = imgPath;
    this.color = color;
    this.selected = selected;
  }
}
