import { Card } from "./card";

export class Player {
  id: number;
  name: String;
  cardsInHand: Array<Card>;

  constructor(id: number, name: String, cardsInHand: Array<Card>){
    this.id = id;
    this.name = name;
    this.cardsInHand = cardsInHand;
  }
}
