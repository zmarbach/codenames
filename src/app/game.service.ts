import { Injectable } from '@angular/core';

import { Card } from './card';
import { DataService } from './data.service';
import { GameContext } from './game-context';
import { AngularFireDatabase } from '@angular/fire/database';
import { GameIdPair } from './game-id-pair';
import { Router } from '@angular/router';
import { GameMode } from './game-mode.enum';
import { CodenameCard } from './codename-card';
import { CodenamesGameContext } from './codenames-game-context';
import { PlayingCard } from './playing-card';
import { Face } from './face';
import { Suit } from './suit.enum';
import { SequenceGameContext } from './sequence-game-context';
import { Player } from './player';
import { Utils } from './utils';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  constructor(
    private dataService: DataService,
    private firebaseDb: AngularFireDatabase,
    private router: Router
  ) {}

  setUpGameAndDbListener(gameIdPair: GameIdPair) {
    this.firebaseDb.database.ref('/games').child(gameIdPair.id.toString()).on('value', (snapshot) => {
        console.log('New shapshot val is ' + JSON.stringify(snapshot.val()));

        //if snapshot does not exist, then the id is not in db...game has been deleted.
        if (snapshot.exists()) {
          // if((snapshot.toJSON() as GameContext).mode === 'SEQUENCE'){
          //   let sequenceGameJSON = snapshot.toJSON() as SequenceGameContext;
          //   gameIdPair.game = new SequenceGameContext(sequenceGameJSON.players, sequenceGameJSON.mode, sequenceGameJSON.cardsForBoard, sequenceGameJSON.redScore, sequenceGameJSON.blueScore, sequenceGameJSON.isRedTurn, sequenceGameJSON.isBlueTurn);
          // } else {
            //Change this to transform to specific game...either WORDS or PICTURES
            gameIdPair.game = snapshot.val();
          // }
        }
      });
  }

  addGameToDb(game: GameContext) {
    const firebaseId = this.firebaseDb.database.ref('/games').push(game);
    console.log('Game added to DB with id of ' + firebaseId.key);
    return firebaseId.key;
  }

  async updateGameInDb(gameIdToUpdate: String, updatedGame: GameContext) {
    if (
      (
        await this.firebaseDb.database
          .ref('/games')
          .child(gameIdToUpdate.toString())
          .get()
      ).exists()
    ) {
      await this.firebaseDb.database
        .ref('/games')
        .child(gameIdToUpdate.toString())
        .set(updatedGame);
      console.log('Updating game DB with id of ' + gameIdToUpdate);
    } else {
      window.alert(
        'This game has been deleted. You will now be redirected to the Home Page to start a new game'
      );
      this.router.navigate(['/home']);
    }
  }

  async deleteGameFromDb(firebaseId: any) {
    await this.firebaseDb.database.ref('/games').child(firebaseId).remove();
  }

  async createNewGame(gameMode: GameMode, redPlayerNames: Array<String>, bluePlayerNames: Array<String>): Promise<GameContext> {
    const cardsForBoard = await this.createCardList(gameMode);
    const redStartingScore = this.calcStartingScore(cardsForBoard, 'red');
    const blueStartingScore = this.calcStartingScore(cardsForBoard, 'blue');
    if (gameMode === GameMode.SEQUENCE) {
      //TODO - randomize which team goes first
      return new SequenceGameContext(this.createPlayers(redPlayerNames, bluePlayerNames), gameMode, cardsForBoard, 0, 0, true, false);
    } else {
      return new CodenamesGameContext(gameMode, cardsForBoard, redStartingScore, blueStartingScore, this.isFirstTurn(redStartingScore, blueStartingScore), this.isFirstTurn(blueStartingScore, redStartingScore));
    }
  }

  private isFirstTurn(scoreToEval: number, comparingScore: number): Boolean {
    return scoreToEval > comparingScore;
  }

  private async createCardList(gameMode: GameMode) {
    const cardsForBoard: Array<Card> = [];

    if (gameMode === GameMode.CODENAMES_WORDS) {
      await this.setInitialCardsWithWords(cardsForBoard);
      this.setCardColors(cardsForBoard);
    } else if (gameMode === GameMode.CODENAMES_PICTURES) {
      await this.setInitialCardsWithPictures(cardsForBoard);
      this.setCardColors(cardsForBoard);
    } else if (gameMode === GameMode.SEQUENCE) {
      //Cards will always be in same order, so make sure to maintain order when adding to list of cards
      await this.setInitialCardsForSequence(cardsForBoard);
    }

    return cardsForBoard;
  }

  private setCardColors(cards: Array<Card>) {
    // randomly determine if blue or red will have 9 (this impacts who will go first)
    const randomNumForColorWithMore = Utils.getRandomNumber(2);
    if (randomNumForColorWithMore == 0) {
      this.setColors(cards, 'blue', 'red');
    } else {
      this.setColors(cards, 'red', 'blue');
    }
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

  private async setInitialCardsWithWords(cards: Array<Card>) {
    let wordList: Array<String> = [];
    const allWords = await this.dataService.getAllWords();
    wordList = this.dataService.getRandomItems(allWords, 25);

    for (const word of wordList) {
      cards.push(new CodenameCard('', false, word, ''));
    }
  }

  private async setInitialCardsWithPictures(cards: Array<Card>) {
    let imgPathList: Array<String> = [];
    const allImgPaths = await this.dataService.getAllImages();
    imgPathList = this.dataService.getRandomItems(allImgPaths, 20);

    for (const imgPath of imgPathList) {
      cards.push(new CodenameCard('', false, '', imgPath));
    }
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

  private calcStartingScore(cards: Array<Card>, color: String) {
    let score = 0;
    for (const card of cards) {
      if (card.color == color) {
        score++;
      }
    }
    return score;
  }

  private setColors(
    cards: Array<Card>,
    colorWithMore: String,
    colorWithLess: String
  ) {
    let firstBatchIndex: number;
    let secondBatchIndex: number;

    if (cards.length == 25) {
      firstBatchIndex = 9;
      secondBatchIndex = firstBatchIndex + 8;
    } else {
      firstBatchIndex = 8;
      secondBatchIndex = firstBatchIndex + 7;
    }

    // assign first 8/9 cards with colorWithMore
    for (let i = 0; i < firstBatchIndex; i++) {
      cards[i].color = colorWithMore;
    }

    // assign next 7/8 cards with colorWithLess
    for (let i = firstBatchIndex; i < secondBatchIndex; i++) {
      cards[i].color = colorWithLess;
    }

    // randomly assign 1 assassin
    for (let i = secondBatchIndex; i < secondBatchIndex + 1; i++) {
      cards[i].color = 'black';
    }

    // assign rest as innocent
    for (let i = secondBatchIndex + 1; i < cards.length; i++) {
      cards[i].color = 'gray';
    }
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
    } else if (this.getindexOfTwoEyedJack(cardsInHand) !== undefined) {
      const response = confirm("You don't have a " + cardToBeRemoved.displayValue + '. Do you want to play your Two-Eyed Jack?');
      if (response) {
        removedCard = cardsInHand.splice(this.getindexOfTwoEyedJack(cardsInHand), 1)[0];
        return removedCard;
      }
    } else {
      alert("You can't play there because you don't have a " + cardToBeRemoved.displayValue);
      return undefined;
    }
  }

  getindexOfTwoEyedJack(targetHand: Array<PlayingCard>): number {
    for (let i = 0; i < targetHand.length; i++) {
      //TODO - figure out why this not working with Face.TWO_EYED_JACK equal comparison
      if (targetHand[i].face.displayName === '👁👁 J') {
        return i;
      }
    }
    return undefined;
  }

  getindexOfOneEyedJack(targetHand: Array<PlayingCard>): number {
    for (let i = 0; i < targetHand.length; i++) {
      //TODO - figure out why this not working with Face.ONE_EYED_JACK equal comparison
      if (targetHand[i].face.displayName === '👁 J') {
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

    console.log('Current Player is ' + sequenceGame.currentPlayer.name + "They are on " + sequenceGame.currentPlayer.teamColor)

    if (sequenceGame.currentPlayer.teamColor === 'blue'){
      console.log('PrevRedPlayerIndex is ' + sequenceGame.prevRedPlayerIndex)
      if (sequenceGame.prevRedPlayerIndex < this.getRedPlayers(sequenceGame).length - 1){
        nextPlayer = this.getRedPlayers(sequenceGame)[sequenceGame.prevRedPlayerIndex + 1]
      } else {
        nextPlayer =  this.getRedPlayers(sequenceGame)[0]
      }
      sequenceGame.prevRedPlayerIndex = this.getRedPlayers(sequenceGame).indexOf(nextPlayer)
      console.log('PrevRedPlayerIndex AFTER setting to new player is ' + sequenceGame.prevRedPlayerIndex)


    } else {
      console.log('PrevBluePlayerIndex is ' + sequenceGame.prevBluePlayerIndex)
      if (sequenceGame.prevBluePlayerIndex < this.getBluePlayers(sequenceGame).length - 1){
        nextPlayer = this.getBluePlayers(sequenceGame)[sequenceGame.prevBluePlayerIndex + 1]
      } else {
        nextPlayer = this.getBluePlayers(sequenceGame)[0]
      }
      sequenceGame.prevBluePlayerIndex = this.getBluePlayers(sequenceGame).indexOf(nextPlayer)
    }

    console.log("Next player is " + nextPlayer.name)
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
}
