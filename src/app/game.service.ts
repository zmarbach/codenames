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
import { SequenceCard } from './sequence-card';
import { Face } from './face';
import { Suit } from './suit.enum';
import { SequenceGameContext } from './sequence-game-context';
import { FormGroup } from '@angular/forms';
import { Player } from './player';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private WORDS = "Words";
  private PICTURES = "Pictures";
  private SEQUENCE = "Sequence";

  constructor(private dataService: DataService, private firebaseDb: AngularFireDatabase, private router: Router) {}

  setUpGameAndDbListener(gameIdPair: GameIdPair) {
    this.firebaseDb.database.ref('/games').child(gameIdPair.id.toString()).on('value', (snapshot) => {
      console.log('New changes in firebase');
      console.log("New shapshot val is " + JSON.stringify(snapshot.val()));

      //if snapshot does not exist, then the id is not in db...game has been deleted.
      if (snapshot.exists()){
        gameIdPair.game = snapshot.val();
      }
    });
  }

  addGameToDb(game: GameContext) {
    const firebaseId = this.firebaseDb.database.ref('/games').push(game);
    console.log('Game added to DB with id of ' + firebaseId.key);
    return firebaseId.key;
  }

  async updateGameInDb(gameIdToUpdate: String, updatedGame: GameContext){
    if ((await this.firebaseDb.database.ref('/games').child(gameIdToUpdate.toString()).get()).exists()){
      await this.firebaseDb.database.ref('/games').child(gameIdToUpdate.toString()).set(updatedGame);
      console.log('Updating game DB with id of ' + gameIdToUpdate);
    } else {
      window.alert('This game has been deleted. You will now be redirected to the Home Page to start a new game');
      this.router.navigate(['/home']);
    }
  }

  async deleteGameFromDb(firebaseId: any) {
   await this.firebaseDb.database.ref('/games').child(firebaseId).remove();
  }

  async createNewGame(gameMode: GameMode, playerNames: Player[]): Promise<GameContext> {
    const cards = await this.createCardList(gameMode);
    const redStartingScore = this.calcStartingScore(cards, 'red');
    const blueStartingScore = this.calcStartingScore(cards, 'blue');
    if (gameMode === GameMode.SEQUENCE){
      //TODO - randomize which team goes first
      console.log('Player names ---> ' + playerNames);
      return new SequenceGameContext(playerNames, gameMode, cards, 0, 0, true, false);
    } else {
      return new CodenamesGameContext(gameMode, cards, redStartingScore, blueStartingScore, this.isFirstTurn(redStartingScore, blueStartingScore), this.isFirstTurn(blueStartingScore, redStartingScore));
    }
  }

  private isFirstTurn(scoreToEval: number, comparingScore: number): Boolean {
    return scoreToEval > comparingScore;
  }

  private async createCardList(gameMode: GameMode){
    const cards: Array<Card> = [];

    if (gameMode === GameMode.CODENAMES_WORDS){
      await this.setInitialCardsWithWords(cards);
      this.setCardColors(cards);
    } else if (gameMode === GameMode.CODENAMES_PICTURES) {
      await this.setInitialCardsWithPictures(cards);
      this.setCardColors(cards);
    } else if (gameMode === GameMode.SEQUENCE){
      //Cards will always be in same order, so make sure to maintain order when adding to list of cards
      await this.setInitialCardsForSequence(cards);
    }

    return cards;
  }

  private setCardColors(cards: Array<Card>) {
    // randomly determine if blue or red will have 9 (this impacts who will go first)
    const randomNumForColorWithMore = this.getRandomNumber(2);
    if (randomNumForColorWithMore == 0){
      this.setColors(cards, 'blue', 'red');
    } else {
      this.setColors(cards, 'red', 'blue');
    }
  }

  private createPlayers(playerNames: Array<String>){
    
  }

  private async setInitialCardsWithWords(cards: Array<Card>){
    let wordList: Array<String> = [];
    const allWords = await this.dataService.getAllWords();
    wordList = this.dataService.getRandomItems(allWords, 25);

    for (const word of wordList){
      cards.push(new CodenameCard('', false, word, ''));
    }
  }

  private async setInitialCardsWithPictures(cards: Array<Card>){
    let imgPathList: Array<String> = [];
    const allImgPaths = await this.dataService.getAllImages();
    imgPathList = this.dataService.getRandomItems(allImgPaths, 20);

    for (const imgPath of imgPathList){
      cards.push(new CodenameCard('', false, '', imgPath));
    }
  }

  private async setInitialCardsForSequence(cards: Array<Card>){
    let emptyString = '';
    let isSelected = false;
    cards.push(new SequenceCard(emptyString, isSelected, Face.FREE, Suit.SPADE)); // suit does not matter here because html will hide it if Face is FREE
    cards.push(new SequenceCard(emptyString, isSelected, Face.TWO, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.THREE, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.FOUR, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.FIVE, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.SIX, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.SEVEN, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.EIGHT, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.NINE, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.FREE, Suit.SPADE)); // suit does not matter here because html will hide it if Face is FREE
    cards.push(new SequenceCard(emptyString, isSelected, Face.SIX, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.FIVE, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.FOUR, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.THREE, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.TWO, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.ACE, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.KING, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.QUEEN, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.TEN, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.TEN, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.SEVEN, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.ACE, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.TWO, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.THREE, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.FOUR, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.FIVE, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.SIX, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.SEVEN, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.NINE, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.QUEEN, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.EIGHT, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.KING, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.SIX, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.FIVE, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.FOUR, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.THREE, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.TWO, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.EIGHT, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.EIGHT, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.KING, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.NINE, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.QUEEN, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.SEVEN, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.SIX, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.FIVE, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.FOUR, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.ACE, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.NINE, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.SEVEN, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.ACE, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.TEN, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.TEN, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.EIGHT, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.SEVEN, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.TWO, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.THREE, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.KING, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.TEN, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.SIX, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.TWO, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.QUEEN, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.NINE, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.NINE, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.EIGHT, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.NINE, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.TEN, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.QUEEN, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.QUEEN, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.FIVE, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.THREE, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.KING, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.EIGHT, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.TEN, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.QUEEN, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.KING, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.ACE, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.ACE, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.KING, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.FOUR, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.FOUR, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.ACE, Suit.CLUB));
    cards.push(new SequenceCard(emptyString, isSelected, Face.SEVEN, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.SIX, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.FIVE, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.FOUR, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.THREE, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.TWO, Suit.SPADE));
    cards.push(new SequenceCard(emptyString, isSelected, Face.TWO, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.THREE, Suit.HEART));
    cards.push(new SequenceCard(emptyString, isSelected, Face.FIVE, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.FREE, Suit.SPADE)); // suit does not matter here because html will hide it if Face is FREE
    cards.push(new SequenceCard(emptyString, isSelected, Face.ACE, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.KING, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.QUEEN, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.TEN, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.NINE, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.EIGHT, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.SEVEN, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.SIX, Suit.DIAMOND));
    cards.push(new SequenceCard(emptyString, isSelected, Face.FREE, Suit.SPADE)); // suit does not matter here because html will hide it if Face is FREE
  }

  private calcStartingScore(cards: Array<Card>, color: String){
    let score = 0;
    for (const card of cards){
      if (card.color == color){
        score++;
      }
    }
    return score;
  }

  private setColors(cards: Array<Card>, colorWithMore: String, colorWithLess: String){
    let firstBatchIndex: number;
    let secondBatchIndex: number;

    if (cards.length == 25){
      firstBatchIndex = 9;
      secondBatchIndex = firstBatchIndex + 8;
    } else {
      firstBatchIndex = 8;
      secondBatchIndex = firstBatchIndex + 7;
    }

    // assign first 8/9 cards with colorWithMore
    for (let i = 0; i < firstBatchIndex ; i++){
      cards[i].color = colorWithMore;
    }

    // assign next 7/8 cards with colorWithLess
    for (let i = firstBatchIndex; i < secondBatchIndex; i++){
      cards[i].color = colorWithLess;
    }

    // randomly assign 1 assassin
    for (let i = secondBatchIndex; i < secondBatchIndex + 1; i++){
      cards[i].color = 'black';
    }

    // assign rest as beige
    for (let i = secondBatchIndex + 1; i < cards.length; i++){
      cards[i].color = 'beige';
    }


    // shuffle the cards at end to make it random
    this.shuffle(cards);
  }

  private getRandomNumber(maxNum: number){
    // this will generate random number from 0 to maxNum - 1
    return Math.floor(Math.random() * maxNum);
  }

  private shuffle(cards: Array<Card>){
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = cards[i];
      cards[i] = cards[j];
      cards[j] = temp;
    }
  }
}
