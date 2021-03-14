import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Router } from '@angular/router';
import { Card } from '../models/cards/card';
import { CodenameCard } from '../models/cards/codename-card';
import { CodenamesGameContext } from '../models/game-contexts/codenames-game-context';
import { GameContext } from '../models/game-contexts/game-context';
import { GameMode } from '../models/game-mode.enum';
import { Utils } from '../utils';
import { DataService } from './data.service';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class CodenamesGameService extends GameService {

  constructor(dataService: DataService, firebaseDb: AngularFireDatabase, router: Router) { 
    super(dataService, firebaseDb, router);
  }

  async createNewGame(gameMode: GameMode): Promise<GameContext> {
    const cardsForBoard = await this.createCodeNamesCardList(gameMode);
    const redStartingScore = this.calcStartingScore(cardsForBoard, 'red');
    const blueStartingScore = this.calcStartingScore(cardsForBoard, 'blue');
    return new CodenamesGameContext(gameMode, cardsForBoard, redStartingScore, blueStartingScore, this.isFirstTurn(redStartingScore, blueStartingScore), this.isFirstTurn(blueStartingScore, redStartingScore));
  }

  private isFirstTurn(scoreToEval: number, comparingScore: number): Boolean {
    return scoreToEval > comparingScore;
  }

  private async createCodeNamesCardList(gameMode: GameMode) {
    const cardsForBoard: Array<Card> = [];

    if (gameMode === GameMode.CODENAMES_WORDS) {
      await this.setInitialCardsWithWords(cardsForBoard);
      this.setCodeNamesCardColors(cardsForBoard);
    } else if (gameMode === GameMode.CODENAMES_PICTURES) {
      await this.setInitialCardsWithPictures(cardsForBoard);
      this.setCodeNamesCardColors(cardsForBoard);
    }

    return cardsForBoard;
  }

  private setCodeNamesCardColors(cards: Array<Card>) {
    // randomly determine if blue or red will have 9 (this impacts who will go first)
    const randomNumForColorWithMore = Utils.getRandomNumber(2);
    if (randomNumForColorWithMore == 0) {
      this.setCodeNameColors(cards, 'blue', 'red');
    } else {
      this.setCodeNameColors(cards, 'red', 'blue');
    }
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

  private calcStartingScore(cards: Array<Card>, color: String) {
    let score = 0;
    for (const card of cards) {
      if (card.color == color) {
        score++;
      }
    }
    return score;
  }

  private setCodeNameColors(cards: Array<Card>, colorWithMore: String, colorWithLess: String) {
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

  updateScore(game: CodenamesGameContext, color: String) {
    if (color == 'red' && game.redScore !== 0) {
      game.redScore--;
    } else if (color == 'blue' && game.blueScore !== 0) {
      game.blueScore--;
    }
  }
}
