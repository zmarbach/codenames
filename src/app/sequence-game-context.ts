import { Card } from "./card";
import { Face } from "./face";
import { GameContext } from "./game-context";
import { GameMode } from "./game-mode.enum";
import { Player } from "./player";
import { SequenceCard } from "./sequence-card";
import { Suit } from "./suit.enum";

export class SequenceGameContext extends GameContext{
  players: Array<Player> = [];
  deck: Array<SequenceCard> = [];
  topCardOnDiscardPile: SequenceCard;

  constructor(players: Array<Player>, mode: GameMode, cards: Array<Card>, redScore: number, blueScore: number, isRedTurn: Boolean, isBlueTurn: Boolean){
    super(mode, cards, redScore, blueScore, isRedTurn, isBlueTurn);
    //build deck twice because need 2 full decks for sequence
    this.buildDeck();
    this.buildDeck();
    this.setPlayerHands(players);
    this.players = players;
  }

  buildDeck(){
    let emptyString = '';
    let isSelected = false;

    for(const face of Object.values(Face)){
      for(const suit of Object.values(Suit)){
        if (face !== Face.FREE){
          if (face === Face.TWO_EYED_JACK){
            if (suit === Suit.DIAMOND || suit === Suit.CLUB){
              this.deck.push(new SequenceCard(emptyString, isSelected, face, suit));
            }
          } else if (face === Face.ONE_EYED_JACK) {
            if (suit === Suit.HEART || suit === Suit.SPADE){
              this.deck.push(new SequenceCard(emptyString, isSelected, face, suit));
            }
          } else { 
            this.deck.push(new SequenceCard(emptyString, isSelected, face, suit));
          }
        }
      }
    }

    this.shuffle(this.deck);
  }

  setPlayerHands(players: Array<Player>) {
    for (let player of players){
      for (let i=0; i < 4; i++){
        console.log("card added to " + player.name + "'s hand ---> " + JSON.stringify(this.deck[i].displayValue))
        player.cardsInHand.push(this.deck[i])
        this.removeCard(this.deck[i], this.deck);
      }
      player.cardsInHand.push(new SequenceCard('', false, Face.TWO_EYED_JACK, Suit.CLUB));
    }
  }

  removeCard(cardToBeRemoved: Card, listToRemoveFrom: Array<Card>) {
    let indexOfCardToRemove = listToRemoveFrom.indexOf(cardToBeRemoved as SequenceCard);
    if (indexOfCardToRemove !== -1){
      var cardRemoved = this.deck.splice(indexOfCardToRemove, 1);
      console.log("card removed from deck ---> " + JSON.stringify(cardRemoved[0].displayValue))
    }
  }

  drawTopCardFromDeck(): Card {
    return this.deck.pop();
  }

  getAllPlayerNames() : Array<String>{
    let names = [];
    for (let player of this.players){
      names.push(player.name);
    }
    return names;
  }

  private shuffle(list: Array<Object>){
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = list[i];
      list[i] = list[j];
      list[j] = temp;
    }
  }

}


