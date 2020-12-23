import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Card } from '../card';
import { DataService } from '../data.service';
import { GameContext } from '../game-context';
import { GameIdPair } from '../game-id-pair';
import { GameService } from '../game.service';

import { BoardComponent } from './board.component';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let gameServiceSpy: jasmine.SpyObj<GameService>;
  let dataServiceSpy: jasmine.SpyObj<DataService>;

  beforeEach(async () => {
    const spyForGameService = jasmine.createSpyObj('GameService', ['getGameById', 'addGameToDb', 'updateGameInDb', 'deleteGameFromDb', 'createNewGame']);
    const spyForDataService = jasmine.createSpyObj('DataService', ['getAllWords', 'getAllImages', 'getRandomItems']);

    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule,
      ],
      providers: [
        { provide: GameService, useValue: spyForGameService },
        { provide: DataService, useValue: spyForDataService }
      ],
      declarations: [ BoardComponent ]
    })
    .compileComponents();

    gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
    dataServiceSpy = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   var card = new Card("testWord", "testImgPath", "red", false);
  //   var cards = new Array<Card>();
  //   cards.push(card);
  //   component.currentGameIdPair = new GameIdPair("abc1234", new GameContext(cards, 0, 0, false, false));
  //   fixture.detectChanges();
  //   expect(component).toBeTruthy();
  // });

  // it('select should mark the card as selected', () => {
  //   var card = new Card("", "", "red", false);
  //   component.select(card);
  //   expect(card.selected).toBeTruthy;
  // });
});
