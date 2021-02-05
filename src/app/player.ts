import { SequenceCard } from "./sequence-card";

export class Player {
  id: number;
  name: String;
  cardsInHand: Array<SequenceCard>;

  constructor(id: number, name: String, cardsInHand: Array<SequenceCard>){
    this.id = id;
    this.name = name;
    this.cardsInHand = cardsInHand;
  }
}
