import { TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Card } from './card';
import { CodenameCard } from './codename-card';
import { CodenamesGameContext } from './codenames-game-context';
import { GameContext } from './game-context';
import { GameIdPair } from './game-id-pair';
import { GameMode } from './game-mode.enum';

import { GameService } from './game.service';

let numOfReds = 0;
let numOfBlues = 0;
let numOfBlacks = 0;
let numOfInnocent = 0;

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule,
      ],
    });
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Add, Update, Get, and Delete should all succeed', async function() {
    let gameIdPair = new GameIdPair(null, new CodenamesGameContext(GameMode.CODENAMES_WORDS,new Array<Card>(), 0, 0, false, false));
    try {
      gameIdPair.id = await service.addGameToDb(gameIdPair.game);
      expect(gameIdPair.id).not.toBeNull();
      console.log('Add game ---> SUCCESS');

      gameIdPair.game.blueScore = 99;
      let resultAfterUpdate = await service.updateGameInDb(gameIdPair.id, gameIdPair.game);
      expect(resultAfterUpdate).not.toBeNull();
      console.log('Update game ---> SUCCESS');

      const resultAfterGetById = await service.setUpGameAndDbListener(gameIdPair);
      expect(resultAfterGetById).not.toBeNull();
      console.log('Get game by id is NOT null BEFORE delete ---> SUCCESS');
    } catch {
      console.log('ERROR!!!');
    } finally {
      if (gameIdPair.id !== null){
        const resultAfterDelete = await service.deleteGameFromDb(gameIdPair.id);
        expect(resultAfterDelete).not.toBeNull();
        console.log('Delete game ---> SUCCESS');

        const resultAfterGetById = await service.setUpGameAndDbListener(gameIdPair);
        expect(resultAfterGetById).toBeUndefined();
        console.log('Get game by id is undeffined AFTER delete ---> SUCCESS');
      }
    }
  });

  it('createNewGame in "Words" game mode should populate words in cards', async function() {
    const newGame = await service.createNewGame(GameMode.CODENAMES_WORDS, [], []);
    const newGameId = service.addGameToDb(newGame);
    let codeNamesCard = newGame.cardsForBoard[0] as CodenameCard;

    expect(codeNamesCard.word).toBeTruthy();
    expect(codeNamesCard.imgPath).toBeFalsy();

    service.deleteGameFromDb(newGameId);
  });

  it('createNewGame in "Words" game mode should create game with 25 cards', async function() {
    const newGame = await service.createNewGame(GameMode.CODENAMES_WORDS, [], []);
    const newGameId = service.addGameToDb(newGame);

    expect(newGame.cardsForBoard.length).toBe(25);
    service.deleteGameFromDb(newGameId);
  });

  it('createNewGame in "Words" game mode should create game with 9 of one color, 8 of the other, 1 assassin, and 7 innocent', async function() {
    const newGame = await service.createNewGame(GameMode.CODENAMES_WORDS, [], []);
    const newGameId = service.addGameToDb(newGame);

    countNumOfColors(newGame.cardsForBoard);

    if (newGame.isRedTurn){
      expect(numOfReds).toBe(9);
      expect(numOfBlues).toBe(8);
      expect(newGame.redScore).toBe(9);
      expect(newGame.blueScore).toBe(8);
      expect(newGame.isRedTurn).toBeTrue();
    } else {
      expect(numOfReds).toBe(8);
      expect(numOfBlues).toBe(9);
      expect(newGame.redScore).toBe(8);
      expect(newGame.blueScore).toBe(9);
      expect(newGame.isBlueTurn).toBeTrue();
    }
    expect(numOfBlacks).toBe(1);
    expect(numOfInnocent).toBe(7);

    // Remove game from DB and reset colors for next test
    service.deleteGameFromDb(newGameId);
    resetColors();
  });

  it('createNewGame in "Pictures" game mode should populate imgPaths in cards', async function() {
    const newGame = await service.createNewGame(GameMode.CODENAMES_PICTURES, [], []);
    const newGameId = service.addGameToDb(newGame);
    let codeNamesCard = newGame.cardsForBoard[0] as CodenameCard;

    expect(codeNamesCard.word).toBeFalsy();
    expect(codeNamesCard.imgPath).toContain('.jpg');

    service.deleteGameFromDb(newGameId);
  });

  it('createNewGame in "Pictures" game mode should create game with 20 cards', async function() {
    const newGame = await service.createNewGame(GameMode.CODENAMES_PICTURES, [], []);
    const newGameId = service.addGameToDb(newGame);

    expect(newGame.cardsForBoard.length).toBe(20);

    service.deleteGameFromDb(newGameId);
  });

  it('createNewGame in "Pictures" game mode should create game with 8 of one color, 7 of the other, 1 assassin, and 4 innocent', async function() {
    const newGame = await service.createNewGame(GameMode.CODENAMES_PICTURES, [], []);
    const newGameId = service.addGameToDb(newGame);

    countNumOfColors(newGame.cardsForBoard);

    if (newGame.isRedTurn){
      expect(numOfReds).toBe(8);
      expect(numOfBlues).toBe(7);
      expect(newGame.redScore).toBe(8);
      expect(newGame.blueScore).toBe(7);
      expect(newGame.isRedTurn).toBeTrue();
    } else {
      expect(numOfReds).toBe(7);
      expect(numOfBlues).toBe(8);
      expect(newGame.redScore).toBe(7);
      expect(newGame.blueScore).toBe(8);
      expect(newGame.isBlueTurn).toBeTrue();
    }
    expect(numOfBlacks).toBe(1);
    expect(numOfInnocent).toBe(4);

    // Remove game from DB and reset colors for next test
    service.deleteGameFromDb(newGameId);
    resetColors();
  });

});

// Utility functions
function countNumOfColors(cards: Array<Card>){
  for (let card of cards){
    if (card.color == 'red'){
      numOfReds++;
    } else if (card.color == 'blue'){
      numOfBlues++;
    } else if (card.color == 'black'){
      numOfBlacks++;
    } else {
      numOfInnocent++;
    }
  }
}

function resetColors(){
  numOfReds = 0;
  numOfBlues = 0;
  numOfBlacks = 0;
  numOfInnocent = 0;
}
