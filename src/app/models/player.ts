import { Card } from "../models/cards/card";

export class Player {
  id: number;
  name: String;
  cardsInHand: Array<Card>;
  teamColor: String;

  constructor(id: number, name: String, cardsInHand: Array<Card>, teamColor: String){
    this.id = id;
    this.name = name;
    this.cardsInHand = cardsInHand;
    this.teamColor = teamColor
  }

  public equals(otherPlayer: Player): Boolean{
    return (this.name === otherPlayer.name) && (this.id === otherPlayer.id)
  }
}
