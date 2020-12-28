import { Injectable } from '@angular/core';

import { Card } from './card';
import { DataService } from './data.service';
import { GameContext } from './game-context';
import { AngularFireDatabase } from '@angular/fire/database';
import { GameIdPair } from './game-id-pair';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private dataService: DataService, private firebaseDb: AngularFireDatabase) { }

  async getGameById(firebaseId: any): Promise<GameContext> {
    const snapshot = await this.firebaseDb.database.ref('/games').child(firebaseId)
      .get();
    return snapshot.val();
  }

  addGameToDb(game: GameContext) {
    const firebaseId = this.firebaseDb.database.ref('/games').push(game);
    console.log('Game added to DB with id of ' + firebaseId.key);
    return firebaseId.key;
  }

  async updateGameInDb(gameIdPair: GameIdPair){
    await this.firebaseDb.database.ref('/games').child(gameIdPair.id.toString()).set(gameIdPair.game);
    console.log('Updating game DB with id of ' + gameIdPair.id);
  }

  async deleteGameFromDb(firebaseId: any) {
   await this.firebaseDb.database.ref('/games').child(firebaseId).remove();
  }

  async createNewGame(gameMode: String) {
    const cards = await this.createCardList(gameMode);
    const redStartingScore = this.calcStartingScore(cards, 'red');
    const blueStartingScore = this.calcStartingScore(cards, 'blue');
    const newGame = new GameContext(cards, redStartingScore, blueStartingScore, this.isFirstTurn(redStartingScore, blueStartingScore), this.isFirstTurn(blueStartingScore, redStartingScore));

    const firebaseId = this.addGameToDb(newGame);

    return new GameIdPair(firebaseId, newGame);
  }

  private isFirstTurn(scoreToEval: number, comparingScore: number): Boolean {
    return scoreToEval > comparingScore;
  }

  private async createCardList(gameMode: String){
    const cards: Array<Card> = [];

    if (gameMode === 'Words'){
      await this.setInitialCardsWithWords(cards);
    } else {
      await this.setInitialCardsWithPictures(cards);
    }

    this.setCardColors(cards);

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

  private async setInitialCardsWithWords(cards: Array<Card>){
    let wordList: Array<String> = [];
    const allWords = await this.dataService.getAllWords();
    wordList = this.dataService.getRandomItems(allWords, 25);

    for (const word of wordList){
      cards.push(new Card(word, '', '', false));
    }
  }

  private async setInitialCardsWithPictures(cards: Array<Card>){
    let imgPathList: Array<String> = [];
    const allImgPaths = await this.dataService.getAllImages();
    imgPathList = this.dataService.getRandomItems(allImgPaths, 20);

    for (const imgPath of imgPathList){
      cards.push(new Card('', imgPath, '', false));
    }
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
