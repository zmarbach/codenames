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
    const snapshot = await this.firebaseDb.database.ref("/games").child(firebaseId)
      .get();
    return snapshot.val();
  }

  addGameToDb(game: GameContext) {
    var firebaseId = this.firebaseDb.database.ref("/games").push(game);
    console.log("Game added to DB with id of " + firebaseId.key);
    return firebaseId.key;
  }

  updateGameInDb(gameIdPair: GameIdPair){
    this.firebaseDb.database.ref("/games").child(gameIdPair.id.toString()).set(gameIdPair.game);
    console.log("Updating game DB with id of " + gameIdPair.id);
  }

  async deleteGameFromDb(firebaseId: any) {
   await this.firebaseDb.database.ref("/games").child(firebaseId).remove();
  }

  async createNewGame(gameMode: String) {
    var cards = await this.createCardList(gameMode);
    var redStartingScore = this.calcStartingScore(cards, "red");
    var blueStartingScore = this.calcStartingScore(cards, "blue");
    // var id = this.getNewId();
    var newGame = new GameContext(cards, redStartingScore, blueStartingScore, this.isFirstTurn(redStartingScore), this.isFirstTurn(blueStartingScore))

    var firebaseId = this.addGameToDb(newGame);

    return new GameIdPair(firebaseId, newGame);
  }
  isFirstTurn(startingScore: number): Boolean {
    return startingScore === 9;
  }

  async createCardList(gameMode: String){
    var cards: Array<Card> = [];

    if (gameMode === "Words"){
      await this.setInitialCardsWithWords(cards);
    } else {
      this.setInitialCardsWithPictures(cards)
    }

    this.setCardColors(cards);

    return cards;
  }

  setCardColors(cards: Array<Card>) {
    //randomly determine if blue or red will have 9 (this impacts who will go first)
    var randomNumForColorWithNine = this.getRandomNumber(2);
    if (randomNumForColorWithNine == 0){
      this.setColors(cards, "blue", "red");
    } else {
      this.setColors(cards, "red", "blue");
    }

  }

  async setInitialCardsWithWords(cards: Array<Card>){
    var wordList: Array<String> = []
    var allWords = await this.dataService.getAllWords();
    wordList = this.dataService.get25RandomWords(allWords);

    for (var word of wordList){
      cards.push(new Card(word, "", "", false));
    }
  }

  private setInitialCardsWithPictures(cards: Array<Card>){
    //handle this logic
    for(var i=0; i<25; i++){
      cards.push(new Card("", "/assets/dog.jpg", "", false))
    }
  }

  calcStartingScore(cards: Array<Card>, color: String){
    var score = 0;
    for (var card of cards){
      if (card.color == color){
        score++;
      }
    }

    return score;
  }

  setColors(cards: Array<Card>, colorWithNine: String, colorWithEight: String){
    //assign first 9 cards with colorWithNine
    for (var i=0; i < 9 ; i++){
      cards[i].color = colorWithNine;
    }

    //assign next 8 cards with colorWithEight
    for (var i=9; i < 17 ; i++){
      cards[i].color = colorWithEight;
    }

    //randomly assign 1 assassin
    for (var i=17; i < 18; i++){
      cards[i].color = "black";
    }

    //assign rest as beige
    for (var i=18; i < cards.length; i++){
      cards[i].color = "beige";
    }

    //shuffle the cards at end to make it random
    this.shuffle(cards);
  }

  getRandomNumber(maxNum: number){
    //this will generate random number from 0 to maxNum - 1
    return Math.floor(Math.random() * maxNum);
  }

  shuffle(cards: Array<Card>){
    for (var i = cards.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = cards[i];
      cards[i] = cards[j];
      cards[j] = temp;
    }
  }

  getNewId(){
    return 1;
    // var id: number;
    // this.firebaseDb.database.ref("/games").on("value", function(snapshotList) {
    //   console.log(snapshotList.val);
    //   id = snapshotList[snapshotList.val().length - 1].id + 1
    // })

    // return id;

    // console.log("List");
    // console.log(list);
    // console.log(list[list.length - 1].id + 1);

    // return list[list.length - 1].id + 1;
  }
}
