import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from 'src/environments/environment';
import { routes } from '../app-routing.module';
import { Card } from '../card';
import { GameIdPair } from '../game-id-pair';
import { GameService } from '../game.service';
import { Location } from '@angular/common';

import { BoardComponent } from './board.component';
import { from } from 'rxjs';
import { GameMode } from '../game-mode.enum';
import { CodenameCard } from '../codename-card';
import { CodenamesGameContext } from '../codenames-game-context';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('BoardComponent', () => {
  let router: Router;
  let location: Location;
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let gameServiceSpy: jasmine.SpyObj<GameService>;

  beforeEach(async () => {
    const spyForGameService = jasmine.createSpyObj('GameService', ['setUpGameAndDbListener', 'addGameToDb', 'updateGameInDb', 'deleteGameFromDb', 'createNewGame']);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatSlideToggleModule,
        MatRadioModule,
        MatDialogModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: GameService, useValue: spyForGameService },
        { provide: MatDialogRef, useValue: {}},
        { provide: MAT_DIALOG_DATA, useValue: {}},
        // Mock the activated route so that params actually contain this id
        // params is an Observable so need to use "from"
        { provide: ActivatedRoute, useValue: { params: from([{ id: 'abc1234' }]) } }
      ],
      declarations: [ BoardComponent ]
    })
    .compileComponents();

    gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;

    let card = new CodenameCard('red', false, 'testWord', 'testImgPath');
    let cards = new Array<Card>();
    cards.push(card);
    //Set currentGameIdPair equal to this dummy data, otherwise will get property undefined errors
    let newCodenamesGame = new CodenamesGameContext(GameMode.CODENAMES_WORDS, cards, 0, 0, false, false)
    component.currentGameIdPair = new GameIdPair('abc1234', newCodenamesGame);

    //Set up spy to always return this dummy gameIdPair when createNewGame() is called
    gameServiceSpy.createNewGame.and.returnValue(Promise.resolve(component.currentGameIdPair.game));

    fixture.detectChanges();

    router.initialNavigation();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // setUpCurrentGame() tests
  it('setUpCurrentGame should call getGameById of GameService twice', () => {
    gameServiceSpy.setUpGameAndDbListener.and.callFake(() => {console.log("do nothing")});
    console.log('CurrentGame = ' + component.currentGameIdPair.game);

    component.setUpCurrentGame(component.currentGameIdPair);

    expect(gameServiceSpy.setUpGameAndDbListener).toHaveBeenCalledTimes(2);
    expect(component.currentGameIdPair.game).not.toBe(undefined);
  });

  //nextGame() tests
  it('nextGame should call deleteGameFromDb and createNewGame with WORDS as parameter', async () => {
    let codeNamesCards = component.currentGameIdPair.game.cardsForBoard[0] as CodenameCard;
    codeNamesCards.imgPath = '';

    fixture.detectChanges();

    await component.nextGame();

    expect(gameServiceSpy.deleteGameFromDb).toHaveBeenCalledTimes(0);
    expect(gameServiceSpy.createNewGame).toHaveBeenCalledWith(GameMode.CODENAMES_WORDS, [], []);
  });

  it('nextGame should call deleteGameFromDb and createNewGame with PICTURES as parameter', async () => {
    component.currentGameIdPair.game.mode = GameMode.CODENAMES_PICTURES;

    fixture.detectChanges();

    await component.nextGame();

    expect(gameServiceSpy.deleteGameFromDb).toHaveBeenCalledTimes(0);
    expect(gameServiceSpy.createNewGame).toHaveBeenCalledWith(GameMode.CODENAMES_PICTURES, [], []);
  });

  // updateScore() tests
  it('updateScore should decrememnt redScore by 1 if selected card color is red', () => {
    component.currentGameIdPair.game.redScore = 4;
    fixture.detectChanges();

    component.updateScore('red');

    expect(component.currentGameIdPair.game.redScore).toEqual(3);
  });

  it('updateScore should decrememnt blueScore by 1 if selected card color is blue', () => {
    component.currentGameIdPair.game.blueScore = 8;
    fixture.detectChanges();

    component.updateScore('blue');

    expect(component.currentGameIdPair.game.blueScore).toEqual(7);
  });

  it('updateScore should NOT decrememnt blueScore if score is already 0', () => {
    component.currentGameIdPair.game.blueScore = 0;
    fixture.detectChanges();

    component.updateScore('blue');

    expect(component.currentGameIdPair.game.blueScore).toEqual(0);
  });

  // select() tests
  it('select should mark the card as selected', async () => {
    let card = new CodenameCard('red', false, '', '');
    await component.select(card);

    expect(card.selected).toBeTruthy();
  });

  it('select should make 1 call to updateGameInDb of GameService if card is NOT selected', async () => {
    let card = new CodenameCard('red', false, '', '');
    await component.select(card);

    expect(gameServiceSpy.updateGameInDb).toHaveBeenCalledTimes(1);
  });

  it('select should 0 calls to updateGameInDb of GameService if card is selected', async () => {
    let card = new CodenameCard('red', true, '', '');
    await component.select(card);

    expect(gameServiceSpy.updateGameInDb).toHaveBeenCalledTimes(0);
  });

  // toggleSpyMaster() tests
  it('toggleSpyMaster should switch from true to false', () => {
    component.isSpyMaster = true;
    fixture.detectChanges();

    component.toggleSpyMaster();

    expect(component.isSpyMaster).toBeFalse();
  });

  it('toggleSpyMaster should switch from false to true', () => {
    component.isSpyMaster = false;
    fixture.detectChanges();

    component.toggleSpyMaster();

    expect(component.isSpyMaster).toBeTrue();
  });

  // endTurn() tests
  it('endTurn should flip turns and call updateGameInDb on GameService', async () => {
    component.currentGameIdPair.game.isBlueTurn = true;
    component.currentGameIdPair.game.isRedTurn = false;
    fixture.detectChanges();

    await component.endTurn();

    expect(component.currentGameIdPair.game.isBlueTurn).toBeFalse();
    expect(component.currentGameIdPair.game.isRedTurn).toBeTrue();
    expect(gameServiceSpy.updateGameInDb).toHaveBeenCalledTimes(1);
  });

  // deleteGameFromDb() tests
  it('deleteGameFromDb should call GameService', async () => {
    await component.deleteGameFromDb();
    expect(gameServiceSpy.deleteGameFromDb).toHaveBeenCalledTimes(1);
  });

  afterEach(() => {
    fixture.destroy();
    TestBed.resetTestingModule();
  });

});
