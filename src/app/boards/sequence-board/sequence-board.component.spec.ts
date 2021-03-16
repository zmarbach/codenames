import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { from } from 'rxjs';
import { routes } from 'src/app/app-routing.module';
import { SequenceGameService } from 'src/app/services/sequence-game.service';
import { environment } from 'src/environments/environment';

import { SequenceBoardComponent } from './sequence-board.component';
import { SequenceGameIdPair } from 'src/app/models/game-id-pairs/sequence-game-id-pair';
import { SequenceGameContext } from 'src/app/models/game-contexts/sequence-game-context';
import { GameMode } from 'src/app/models/game-mode.enum';
import { Player } from 'src/app/models/player';

describe('SequenceBoardComponent', () => {
  let router: Router;
  let location: Location;
  let component: SequenceBoardComponent;
  let fixture: ComponentFixture<SequenceBoardComponent>;
  let gameServiceSpy: jasmine.SpyObj<SequenceGameService>;

  beforeEach(async () => {
    const spyForGameService = jasmine.createSpyObj('SequenceGameService', ['setUpGameAndDbListener', 'addGameToDb', 'updateGameInDb', 'deleteGameFromDb', 'createNewGame', 'updateScore']);

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
        { provide: SequenceGameService, useValue: spyForGameService },
        { provide: MatDialogRef, useValue: {}},
        { provide: MAT_DIALOG_DATA, useValue: {}},
        // Mock the activated route so that params actually contain this id
        // params is an Observable so need to use "from"
        { provide: ActivatedRoute, useValue: { params: from([{ id: 'abc1234' }]) } }
      ],
      declarations: [ SequenceBoardComponent ]
    })
    .compileComponents();

    gameServiceSpy = TestBed.inject(SequenceGameService) as jasmine.SpyObj<SequenceGameService>;
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SequenceBoardComponent);
    component = fixture.componentInstance;

    //Set currentGameIdPair equal to this dummy data, otherwise will get property undefined errors
    let newSequenceGame = new SequenceGameContext(new Array<Player>(new Player(9999, 'bob', [], 'red'), new Player(222, 'sam', [], 'blue')), GameMode.SEQUENCE, [], 0, 0, false, false);
    newSequenceGame.currentPlayer = new Player(9999, 'bob', [], 'red');
    component.currentGameIdPair = new SequenceGameIdPair('abc1234', newSequenceGame);
    fixture.detectChanges();


    //Set up spy to always return this dummy gameIdPair when createNewGame() is called
    gameServiceSpy.createNewGame.and.returnValue(Promise.resolve(component.currentGameIdPair.game));

    fixture.detectChanges();

    router.initialNavigation();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
