import { Card } from "./card";
import { Face } from "./face";
import { GameContext } from "./game-context";
import { GameMode } from "./game-mode.enum";
import { Player } from "./player";
import { PlayingCard } from "./playing-card";
import { Suit } from "./suit.enum";
import { Utils } from "./utils";

export class SequenceGameContext extends GameContext{
  players: Array<Player> = [];
  deck: Array<PlayingCard> = [];
  discardPile: Array<PlayingCard>;
  topCardOnDiscardPile: PlayingCard;

  constructor(players: Array<Player>, mode: GameMode, cardsForBoard: Array<Card>, redScore: number, blueScore: number, isRedTurn: Boolean, isBlueTurn: Boolean){
    super(mode, cardsForBoard, redScore, blueScore, isRedTurn, isBlueTurn);

    //build deck twice because need 2 full decks for sequence
    this.buildDeck();
    this.buildDeck();
    Utils.shuffle(this.deck);

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
              this.deck.push(new PlayingCard(emptyString, isSelected, face, suit));
            }
          } else if (face === Face.ONE_EYED_JACK) {
            if (suit === Suit.HEART || suit === Suit.SPADE){
              this.deck.push(new PlayingCard(emptyString, isSelected, face, suit));
            }
          } else { 
            this.deck.push(new PlayingCard(emptyString, isSelected, face, suit));
          }
        }
      }
    }
  }

  private setPlayerHands(players: Array<Player>) {
    let numOfCardsInHand = 0;

    switch (players.length){
      case 2:
        numOfCardsInHand = 7;
        break;
      case 4: 
        numOfCardsInHand = 6;
        break;
      case 6:
        numOfCardsInHand = 5;
        break;
      case 8:
        numOfCardsInHand = 4;
        break;
      case 10:
      case 12:
        numOfCardsInHand = 3;
        break;
      default:
        numOfCardsInHand = 4;
        break;
    }
    for (let player of players){
      for (let i=0; i < numOfCardsInHand; i++){
        player.cardsInHand.push(this.deck[i])
        this.removeCardFromDeck(this.deck[i], this.deck);
      }
    }
  }

  private removeCardFromDeck(cardToBeRemoved: Card, listToRemoveFrom: Array<Card>) {
    let indexOfCardToRemove = listToRemoveFrom.indexOf(cardToBeRemoved as PlayingCard);
    if (indexOfCardToRemove !== -1){
      var cardRemoved = this.deck.splice(indexOfCardToRemove, 1);
      console.log("card removed from deck ---> " + JSON.stringify(cardRemoved[0].displayValue))
    }
  }

  getAllPlayerNames() : Array<String>{
    let names = [];
    for (let player of this.players){
      names.push(player.name);
    }
    return names;
  }

}


