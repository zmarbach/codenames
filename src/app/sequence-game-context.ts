import { ThrowStmt } from '@angular/compiler';
import { Card } from './card';
import { Face } from './face';
import { GameContext } from './game-context';
import { GameMode } from './game-mode.enum';
import { Player } from './player';
import { PlayingCard } from './playing-card';
import { Suit } from './suit.enum';
import { Utils } from './utils';

export class SequenceGameContext extends GameContext {
  players: Array<Player> = [];
  redTeam: Array<Player> = [];
  blueTeam: Array<Player> = [];
  currentPlayer: Player
  deck: Array<PlayingCard> = [];
  discardPile: Array<PlayingCard>;
  topCardOnDiscardPile: PlayingCard;
  prevRedPlayerIndex: number;
  prevBluePlayerIndex: number;

  constructor(
    players: Array<Player>,
    mode: GameMode,
    cardsForBoard: Array<Card>,
    redScore: number,
    blueScore: number,
    isRedTurn: Boolean,
    isBlueTurn: Boolean
  ) {
    super(mode, cardsForBoard, redScore, blueScore, isRedTurn, isBlueTurn);

    //build deck twice because need 2 full decks for sequence
    this.buildDeck();
    this.buildDeck();
    Utils.shuffle(this.deck);

    this.setPlayerHands(players);
    this.players = players;

    this.createTeams();

    // set current Player to first player of a random team
    this.currentPlayer = this.getRandomTeam()[0]    

    
    this.setPrevPlayerIndicies();
    
  }

  // Team that starts gets prevPlayer index of 1
  // Other team gets prevPlayer insdex of last element, so the first player to go will actually be the first player on that team
  private setPrevPlayerIndicies() {
    if (this.currentPlayer.teamColor === 'red') {
      this.prevRedPlayerIndex = 0;
      this.prevBluePlayerIndex = this.blueTeam.length - 1;
    } else {
      this.prevBluePlayerIndex = 0;
      this.prevRedPlayerIndex = this.redTeam.length - 1;
    }
  }

  private getRandomTeam() {
    if (Math.round(Math.random()) === 1){
      return this.redTeam
    } else {
      return this.blueTeam
    }
  }


  private createTeams() { 
    for (let player of this.players){
      if (player.teamColor === 'red'){
        this.redTeam.push(player)
      } else {
        this.blueTeam.push(player)
      }
    }
  }

  private buildDeck() {
    let emptyString = '';
    let isSelected = false;

    for (const face of Object.values(Face)) {
      for (const suit of Object.values(Suit)) {
        if (face !== Face.FREE) {
          if (face === Face.TWO_EYED_JACK) {
            if (suit === Suit.DIAMOND || suit === Suit.CLUB) {
              this.deck.push(
                new PlayingCard(emptyString, isSelected, face, suit)
              );
            }
          } else if (face === Face.ONE_EYED_JACK) {
            if (suit === Suit.HEART || suit === Suit.SPADE) {
              this.deck.push(
                new PlayingCard(emptyString, isSelected, face, suit)
              );
            }
          } else {
            this.deck.push(
              new PlayingCard(emptyString, isSelected, face, suit)
            );
          }
        }
      }
    }
  }

  private setPlayerHands(players: Array<Player>) {
    let numOfCardsInHand = 0;

    switch (players.length) {
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
    for (let player of players) {
      for (let i = 0; i < numOfCardsInHand; i++) {
        player.cardsInHand.push(this.deck[i]);
        this.removeCardFromDeck(this.deck[i], this.deck);
      }
    }
  }

  private removeCardFromDeck(
    cardToBeRemoved: Card,
    listToRemoveFrom: Array<Card>
  ) {
    let indexOfCardToRemove = listToRemoveFrom.indexOf(
      cardToBeRemoved as PlayingCard
    );
    if (indexOfCardToRemove !== -1) {
      var cardRemoved = this.deck.splice(indexOfCardToRemove, 1);
      console.log(
        'card removed from deck ---> ' +
          JSON.stringify(cardRemoved[0].displayValue)
      );
    }
  }
}
