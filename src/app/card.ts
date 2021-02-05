export abstract class Card {
  color: String = '';
  selected: Boolean = false;

  constructor(color: String, selected: Boolean){
    this.color = color;
    this.selected = selected;
  }
}
