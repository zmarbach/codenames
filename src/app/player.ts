import { Card } from "./card";

export class Player {
  id: number;
  name: String;
  cardsInHand: Array<Card>;
  teamColor: String;

  constructor(id: number, name: String, cardsInHand: Array<Card>, teamColor: String){
    this.id = id;
    this.name = name;
    this.cardsInHand = cardsInHand;
    this.teamColor = teamColor;
  }
}
