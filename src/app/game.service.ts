import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Card } from './card';
import { DataService } from './data.service';
import { GameContext } from './game-context';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private baseUrl = 'api/games';  // URL to web api
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  counter = 0;

  constructor(private dataService: DataService, private http: HttpClient) { }

  getGameById(id: number): Promise<GameContext> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.get<GameContext>(url).toPromise();
  }

  addGame(game: GameContext): Promise<GameContext> {
    return this.http.post<GameContext>(this.baseUrl, game, this.httpOptions).toPromise();
  }

  deleteGame(game: GameContext | number): Promise<GameContext> {
    const id = typeof game === 'number' ? game : game.id;
    const url = `${this.baseUrl}/${id}`;

    return this.http.delete<GameContext>(url, this.httpOptions).toPromise();
  }

  async createNewGame(gameMode: String){
    var cards = this.createCardList(gameMode);
    //TODO - make it random which team goes first
    var redStartingScore = this.calcStartingScore(cards, "red");
    var blueStartingScore = this.calcStartingScore(cards, "blue");
    var newGame = new GameContext(this.counter + 1, cards, redStartingScore, blueStartingScore, this.isFirstTurn(redStartingScore), this.isFirstTurn(blueStartingScore))
    this.counter++;

    await this.addGame(newGame);

    return newGame;
  }
  isFirstTurn(startingScore: number): Boolean {
    return startingScore === 9;
  }

  private createCardList(gameMode: String){
    var cards: Array<Card> = [];

    if (gameMode === "Words"){
      this.setInitialCardsWithWords(cards);
    } else {
      this.setInitialCardsWithPictures(cards)
    }

    this.setCardColors(cards);

    return cards;
  }

  setCardColors(cards: Array<Card>) {
    //randomly determine if blue or red will have 9
    var randomNumForColorWithNine = this.getRandomNumber(2);
    if (randomNumForColorWithNine == 0){
      this.setColors(cards, "blue", "red");
    } else {
      this.setColors(cards, "red", "blue");
    }

  }

  private setInitialCardsWithWords(cards: Array<Card>){
    var wordList: Array<String> = []
    var allWords = this.dataService.getAllWords();
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
}
