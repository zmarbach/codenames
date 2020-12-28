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
import { GameContext } from '../game-context';
import { GameIdPair } from '../game-id-pair';
import { GameService } from '../game.service';
import { Location } from '@angular/common';

import { BoardComponent } from './board.component';
import { from } from 'rxjs';

describe('BoardComponent', () => {
  let router: Router;
  let location: Location;
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let gameServiceSpy: jasmine.SpyObj<GameService>;

  beforeEach(async () => {
    const spyForGameService = jasmine.createSpyObj('GameService', ['getGameById', 'addGameToDb', 'updateGameInDb', 'deleteGameFromDb', 'createNewGame']);

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
        ReactiveFormsModule
      ],
      providers: [
        { provide: GameService, useValue: spyForGameService },
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

    let card = new Card('testWord', 'testImgPath', 'red', false);
    let cards = new Array<Card>();
    cards.push(card);
    component.currentGameIdPair = new GameIdPair('abc1234', new GameContext(cards, 0, 0, false, false));

    fixture.detectChanges();

    router.initialNavigation();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // setUpCurrentGame() tests
  it('setUpCurrentGame should call getGameById of GameService twice', async () => {
    gameServiceSpy.getGameById.and.returnValue(Promise.resolve(component.currentGameIdPair.game));
    console.log('CurrentGame = ' + component.currentGameIdPair.game);

    await component.setUpCurrentGame();

    expect(gameServiceSpy.getGameById).toHaveBeenCalledTimes(2);
    expect(component.currentGameIdPair.game).not.toBe(undefined);
  });

  it('setUpCurrentGame should redirect to /home if game is undefined', async () => {
    gameServiceSpy.getGameById.and.returnValue(Promise.resolve(undefined));

    await component.setUpCurrentGame();

    expect(component.currentGameIdPair.game).toBe(undefined);
    expect(location.path()).toBe('/home');
  });

  // nextGame() tests
  it('nextGame should call deleteGameFromDb and createNewGame with Words as parameter', () => {
    component.currentGameIdPair.game.cards[0].imgPath = '';
    fixture.detectChanges();

    component.nextGame();

    expect(gameServiceSpy.deleteGameFromDb).toHaveBeenCalledTimes(1);
    expect(gameServiceSpy.createNewGame).toHaveBeenCalledWith('Words');
  });

  it('nextGame should call deleteGameFromDb and createNewGame with Pictures as parameter', () => {
    component.currentGameIdPair.game.cards[0].imgPath = 'test';
    fixture.detectChanges();

    component.nextGame();

    expect(gameServiceSpy.deleteGameFromDb).toHaveBeenCalledTimes(1);
    expect(gameServiceSpy.createNewGame).toHaveBeenCalledWith('Pictures');
  });

  // updateScore() tests
  it('updateScore should decrememnt redScore by 1 if selected card color is red', () => {
    component.currentGameIdPair.game.redScore = 4;
    fixture.detectChanges();

    component.updateScore('red');

    expect(component.currentGameIdPair.game.redScore).toEqual(3);
    expect(gameServiceSpy.updateGameInDb).toHaveBeenCalledTimes(1);
  });

  it('updateScore should decrememnt blueScore by 1 if selected card color is blue', () => {
    component.currentGameIdPair.game.blueScore = 8;
    fixture.detectChanges();

    component.updateScore('blue');

    expect(component.currentGameIdPair.game.blueScore).toEqual(7);
    expect(gameServiceSpy.updateGameInDb).toHaveBeenCalledTimes(1);
  });

  it('updateScore should NOT decrememnt blueScore if score is already 0', () => {
    component.currentGameIdPair.game.blueScore = 0;
    fixture.detectChanges();

    component.updateScore('blue');

    expect(component.currentGameIdPair.game.blueScore).toEqual(0);
    expect(gameServiceSpy.updateGameInDb).toHaveBeenCalledTimes(1);
  });

  // select() tests
  it('select should mark the card as selected', () => {
    let card = new Card('', '', 'red', false);
    component.select(card);

    expect(card.selected).toBeTruthy();
  });

  it('select should make 2 calls to updateGameInDb of GameService if card is NOT selected', () => {
    let card = new Card('', '', 'red', false);
    component.select(card);

    expect(gameServiceSpy.updateGameInDb).toHaveBeenCalledTimes(2);
  });

  it('select should 1 call to updateGameInDb of GameService if card is selected', () => {
    let card = new Card('', '', 'red', true);
    component.select(card);

    expect(gameServiceSpy.updateGameInDb).toHaveBeenCalledTimes(1);
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
  it('endTurn should flip turns and call updateGameInDb on GameService', () => {
    component.currentGameIdPair.game.isBlueTurn = true;
    component.currentGameIdPair.game.isRedTurn = false;
    fixture.detectChanges();

    component.endTurn();

    expect(component.currentGameIdPair.game.isBlueTurn).toBeFalse();
    expect(component.currentGameIdPair.game.isRedTurn).toBeTrue();
    expect(gameServiceSpy.updateGameInDb).toHaveBeenCalledTimes(1);
  });

  // deleteGameFromDb() tests
  it('deleteGameFromDb should call GameService', () => {
    component.deleteGameFromDb();
    expect(gameServiceSpy.deleteGameFromDb).toHaveBeenCalledTimes(1);
  });

});
