import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Router } from '@angular/router';
import { Card } from '../models/cards/card';
import { PlayingCard } from '../models/cards/playing-card';
import { Face } from '../models/face';
import { SequenceGameContext } from '../models/game-contexts/sequence-game-context';
import { GameMode } from '../models/game-mode.enum';
import { Player } from '../models/player';
import { Suit } from '../models/suit.enum';
import { DataService } from './data.service';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class SequenceGameService extends GameService {

  constructor(dataService: DataService, firebaseDb: AngularFireDatabase, router: Router) { 
    super(dataService, firebaseDb, router);
    console.log('hello')

  }

  async createNewGame(gameMode: GameMode, redPlayerNames: Array<String>, bluePlayerNames: Array<String>): Promise<SequenceGameContext> {
    console.log('hello')
    const cardsForBoard = await this.createSequenceCardList();
    return new SequenceGameContext(this.createPlayers(redPlayerNames, bluePlayerNames), gameMode, cardsForBoard, 0, 0, true, false);
  }

  private async createSequenceCardList() {
    const cardsForBoard: Array<Card> = [];    
      await this.setInitialCardsForSequence(cardsForBoard);

    return cardsForBoard;
  }

  private createPlayers(redPlayerNames: Array<String>, bluePlayerNames: Array<String>): Array<Player> {
    let id = 0;
    let players = [];

    for (let i = 0; i < redPlayerNames.length; i++) {
      players.push(new Player(id, redPlayerNames[i], [], 'red'));
      id++;
    }

    for (let i = 0; i < bluePlayerNames.length; i++) {
      players.push(new Player(id, bluePlayerNames[i], [], 'blue'));
      id++;
    }

    return players;
  }

  removeCardFromHand(cardToBeRemoved: PlayingCard, cardsInHand: Array<PlayingCard>): PlayingCard {
    let indexToRemove: number;
    let removedCard: PlayingCard;

    for (let i = 0; i < cardsInHand.length; i++) {
      if (cardsInHand[i].displayValue === cardToBeRemoved.displayValue) {
        indexToRemove = i;
        break;
      }
    }
    if (indexToRemove !== undefined && !isNaN(indexToRemove) && indexToRemove >= 0) {
      removedCard = cardsInHand.splice(indexToRemove, 1)[0];
      return removedCard;
    } else if (this.getindexOfCard(cardsInHand, '👁👁 J') !== undefined) {
      const response = confirm("You don't have a " + cardToBeRemoved.displayValue + '. Do you want to play your Two-Eyed Jack?');
      if (response) {
        removedCard = cardsInHand.splice(this.getindexOfCard(cardsInHand, '👁👁 J'), 1)[0];
        return removedCard;
      }
    } else {
      alert("You can't play there because you don't have a " + cardToBeRemoved.displayValue);
      return undefined;
    }
  }

  getindexOfCard(targetHand: Array<PlayingCard>, targetCardDisplayName: String): number {
    for (let i = 0; i < targetHand.length; i++) {
      if (targetHand[i].face.displayName === targetCardDisplayName) {
        return i;
      }
    }
    return undefined;
  }

  drawTopCardFromDeck(sequenceGame: SequenceGameContext): Card {
    let card = sequenceGame.deck.pop();
    console.log(sequenceGame.deck.length);
    return card;
  }

  addToDiscardPile(card: PlayingCard, sequenceGame: SequenceGameContext) {
    if (sequenceGame.discardPile === undefined) {
      sequenceGame.discardPile = [];
    }
    sequenceGame.discardPile.push(card);
  }

  getNextPlayer(sequenceGame: SequenceGameContext) {
    let nextPlayer: Player;

    if (sequenceGame.currentPlayer.teamColor === 'blue'){
      if (sequenceGame.prevRedPlayerIndex < this.getRedPlayers(sequenceGame).length - 1){
        nextPlayer = this.getRedPlayers(sequenceGame)[sequenceGame.prevRedPlayerIndex + 1]
      } else {
        nextPlayer =  this.getRedPlayers(sequenceGame)[0]
      }
      sequenceGame.prevRedPlayerIndex = this.getRedPlayers(sequenceGame).indexOf(nextPlayer)
    } else {
      if (sequenceGame.prevBluePlayerIndex < this.getBluePlayers(sequenceGame).length - 1){
        nextPlayer = this.getBluePlayers(sequenceGame)[sequenceGame.prevBluePlayerIndex + 1]
      } else {
        nextPlayer = this.getBluePlayers(sequenceGame)[0]
      }
      sequenceGame.prevBluePlayerIndex = this.getBluePlayers(sequenceGame).indexOf(nextPlayer)
    }
    return nextPlayer
  }

  getRedPlayers(sequenceGame: SequenceGameContext): Array<Player> {
    let players = [];

    for (let player of sequenceGame.players) {
      if (player.teamColor === 'red') {
        players.push(player);
      }
    }

    return players;
  }

  getBluePlayers(sequenceGame: SequenceGameContext): Array<Player> {
    let players = [];

    for (let player of sequenceGame.players) {
      if (player.teamColor === 'blue') {
        players.push(player);
      }
    }

    return players;
  }

  getRedPlayerNames(sequenceGame: SequenceGameContext): Array<String> {
    let names = [];

    for (let player of sequenceGame.players) {
      if (player.teamColor === 'red') {
        names.push(player.name);
      }
    }

    return names;
  }

  getBluePlayerNames(sequenceGame: SequenceGameContext): Array<String> {
    let names = [];

    for (let player of sequenceGame.players) {
      if (player.teamColor === 'blue') {
        names.push(player.name);
      }
    }

    return names;
  }



  private async setInitialCardsForSequence(cards: Array<Card>) {
    let emptyString = '';
    let isSelected = false;
    cards.push(new PlayingCard(emptyString, isSelected, Face.FREE, Suit.SPADE)); // suit does not matter here because html will hide it if Face is FREE
    cards.push(new PlayingCard(emptyString, isSelected, Face.TWO, Suit.SPADE));
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.THREE, Suit.SPADE)
    );
    cards.push(new PlayingCard(emptyString, isSelected, Face.FOUR, Suit.SPADE));
    cards.push(new PlayingCard(emptyString, isSelected, Face.FIVE, Suit.SPADE));
    cards.push(new PlayingCard(emptyString, isSelected, Face.SIX, Suit.SPADE));
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.SEVEN, Suit.SPADE)
    );
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.EIGHT, Suit.SPADE)
    );
    cards.push(new PlayingCard(emptyString, isSelected, Face.NINE, Suit.SPADE));
    cards.push(new PlayingCard(emptyString, isSelected, Face.FREE, Suit.SPADE)); // suit does not matter here because html will hide it if Face is FREE
    cards.push(new PlayingCard(emptyString, isSelected, Face.SIX, Suit.CLUB));
    cards.push(new PlayingCard(emptyString, isSelected, Face.FIVE, Suit.CLUB));
    cards.push(new PlayingCard(emptyString, isSelected, Face.FOUR, Suit.CLUB));
    cards.push(new PlayingCard(emptyString, isSelected, Face.THREE, Suit.CLUB));
    cards.push(new PlayingCard(emptyString, isSelected, Face.TWO, Suit.CLUB));
    cards.push(new PlayingCard(emptyString, isSelected, Face.ACE, Suit.HEART));
    cards.push(new PlayingCard(emptyString, isSelected, Face.KING, Suit.HEART));
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.QUEEN, Suit.HEART)
    );
    cards.push(new PlayingCard(emptyString, isSelected, Face.TEN, Suit.HEART));
    cards.push(new PlayingCard(emptyString, isSelected, Face.TEN, Suit.SPADE));
    cards.push(new PlayingCard(emptyString, isSelected, Face.SEVEN, Suit.CLUB));
    cards.push(new PlayingCard(emptyString, isSelected, Face.ACE, Suit.SPADE));
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.TWO, Suit.DIAMOND)
    );
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.THREE, Suit.DIAMOND)
    );
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.FOUR, Suit.DIAMOND)
    );
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.FIVE, Suit.DIAMOND)
    );
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.SIX, Suit.DIAMOND)
    );
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.SEVEN, Suit.DIAMOND)
    );
    cards.push(new PlayingCard(emptyString, isSelected, Face.NINE, Suit.HEART));
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.QUEEN, Suit.SPADE)
    );
    cards.push(new PlayingCard(emptyString, isSelected, Face.EIGHT, Suit.CLUB));
    cards.push(new PlayingCard(emptyString, isSelected, Face.KING, Suit.SPADE));
    cards.push(new PlayingCard(emptyString, isSelected, Face.SIX, Suit.CLUB));
    cards.push(new PlayingCard(emptyString, isSelected, Face.FIVE, Suit.CLUB));
    cards.push(new PlayingCard(emptyString, isSelected, Face.FOUR, Suit.CLUB));
    cards.push(new PlayingCard(emptyString, isSelected, Face.THREE, Suit.CLUB));
    cards.push(new PlayingCard(emptyString, isSelected, Face.TWO, Suit.CLUB));
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.EIGHT, Suit.DIAMOND)
    );
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.EIGHT, Suit.HEART)
    );
    cards.push(new PlayingCard(emptyString, isSelected, Face.KING, Suit.SPADE));
    cards.push(new PlayingCard(emptyString, isSelected, Face.NINE, Suit.CLUB));
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.QUEEN, Suit.SPADE)
    );
    cards.push(new PlayingCard(emptyString, isSelected, Face.SEVEN, Suit.CLUB));
    cards.push(new PlayingCard(emptyString, isSelected, Face.SIX, Suit.HEART));
    cards.push(new PlayingCard(emptyString, isSelected, Face.FIVE, Suit.HEART));
    cards.push(new PlayingCard(emptyString, isSelected, Face.FOUR, Suit.HEART));
    cards.push(new PlayingCard(emptyString, isSelected, Face.ACE, Suit.HEART));
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.NINE, Suit.DIAMOND)
    );
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.SEVEN, Suit.HEART)
    );
    cards.push(new PlayingCard(emptyString, isSelected, Face.ACE, Suit.SPADE));
    cards.push(new PlayingCard(emptyString, isSelected, Face.TEN, Suit.CLUB));
    cards.push(new PlayingCard(emptyString, isSelected, Face.TEN, Suit.SPADE));
    cards.push(new PlayingCard(emptyString, isSelected, Face.EIGHT, Suit.CLUB));
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.SEVEN, Suit.HEART)
    );
    cards.push(new PlayingCard(emptyString, isSelected, Face.TWO, Suit.HEART));
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.THREE, Suit.HEART)
    );
    cards.push(new PlayingCard(emptyString, isSelected, Face.KING, Suit.HEART));
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.TEN, Suit.DIAMOND)
    );
    cards.push(new PlayingCard(emptyString, isSelected, Face.SIX, Suit.HEART));
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.TWO, Suit.DIAMOND)
    );
    cards.push(new PlayingCard(emptyString, isSelected, Face.QUEEN, Suit.CLUB));
    cards.push(new PlayingCard(emptyString, isSelected, Face.NINE, Suit.SPADE));
    cards.push(new PlayingCard(emptyString, isSelected, Face.NINE, Suit.CLUB));
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.EIGHT, Suit.HEART)
    );
    cards.push(new PlayingCard(emptyString, isSelected, Face.NINE, Suit.HEART));
    cards.push(new PlayingCard(emptyString, isSelected, Face.TEN, Suit.HEART));
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.QUEEN, Suit.HEART)
    );
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.QUEEN, Suit.DIAMOND)
    );
    cards.push(new PlayingCard(emptyString, isSelected, Face.FIVE, Suit.HEART));
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.THREE, Suit.DIAMOND)
    );
    cards.push(new PlayingCard(emptyString, isSelected, Face.KING, Suit.CLUB));
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.EIGHT, Suit.SPADE)
    );
    cards.push(new PlayingCard(emptyString, isSelected, Face.TEN, Suit.CLUB));
    cards.push(new PlayingCard(emptyString, isSelected, Face.QUEEN, Suit.CLUB));
    cards.push(new PlayingCard(emptyString, isSelected, Face.KING, Suit.CLUB));
    cards.push(new PlayingCard(emptyString, isSelected, Face.ACE, Suit.CLUB));
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.ACE, Suit.DIAMOND)
    );
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.KING, Suit.DIAMOND)
    );
    cards.push(new PlayingCard(emptyString, isSelected, Face.FOUR, Suit.HEART));
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.FOUR, Suit.DIAMOND)
    );
    cards.push(new PlayingCard(emptyString, isSelected, Face.ACE, Suit.CLUB));
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.SEVEN, Suit.SPADE)
    );
    cards.push(new PlayingCard(emptyString, isSelected, Face.SIX, Suit.SPADE));
    cards.push(new PlayingCard(emptyString, isSelected, Face.FIVE, Suit.SPADE));
    cards.push(new PlayingCard(emptyString, isSelected, Face.FOUR, Suit.SPADE));
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.THREE, Suit.SPADE)
    );
    cards.push(new PlayingCard(emptyString, isSelected, Face.TWO, Suit.SPADE));
    cards.push(new PlayingCard(emptyString, isSelected, Face.TWO, Suit.HEART));
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.THREE, Suit.HEART)
    );
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.FIVE, Suit.DIAMOND)
    );
    cards.push(new PlayingCard(emptyString, isSelected, Face.FREE, Suit.SPADE)); // suit does not matter here because html will hide it if Face is FREE
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.ACE, Suit.DIAMOND)
    );
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.KING, Suit.DIAMOND)
    );
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.QUEEN, Suit.DIAMOND)
    );
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.TEN, Suit.DIAMOND)
    );
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.NINE, Suit.DIAMOND)
    );
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.EIGHT, Suit.DIAMOND)
    );
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.SEVEN, Suit.DIAMOND)
    );
    cards.push(
      new PlayingCard(emptyString, isSelected, Face.SIX, Suit.DIAMOND)
    );
    cards.push(new PlayingCard(emptyString, isSelected, Face.FREE, Suit.SPADE)); // suit does not matter here because html will hide it if Face is FREE
  }
}
