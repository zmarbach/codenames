import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from 'src/environments/environment';
import { routes } from '../app-routing.module';
import { Card } from '../models/cards/card';
import { GameIdPair } from '../models/game-id-pair';
import { GameService } from '../services/game.service';

import { HomeComponent } from './home.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { ReactiveFormsModule } from '@angular/forms';
import { GameMode } from '../models/game-mode.enum';
import { CodenamesGameContext } from '../models/game-contexts/codenames-game-context';
import { CodenamesGameService } from '../services/codenames-game.service';

describe('HomeComponent', () => {
  let router: Router;
  let location: Location;
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let gameServiceSpy: jasmine.SpyObj<CodenamesGameService>;

  beforeEach(async () => {
    const spyForGameService = jasmine.createSpyObj('GameService', ['createNewGame', 'addGameToDb']);

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
        {provide: CodenamesGameService, useValue: spyForGameService},
      ],
      declarations: [ HomeComponent ],
    })
    .compileComponents();

    gameServiceSpy = TestBed.inject(CodenamesGameService) as jasmine.SpyObj<CodenamesGameService>;
  });

  beforeEach(() => {
    const fakeCodenamesGame = new CodenamesGameContext(GameMode.CODENAMES_WORDS, new Array<Card>(), 0, 0, false, false);
    const fakeGamePairId = new GameIdPair('test1234', fakeCodenamesGame);
    gameServiceSpy.createNewGame.and.returnValue(Promise.resolve(fakeCodenamesGame));
    gameServiceSpy.addGameToDb.and.returnValue(fakeGamePairId.id.toString());

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // set up location change listener and execute initial nav
    router.initialNavigation();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // routing is async so need to set up unit test acccordingly
  it('navigation should default to /home', async () => {
    fixture.detectChanges();

    fixture.whenStable().then( () => {
      expect(location.path()).toBe('/home');
    });
  });

  it('submit should call createNewGame method on GameService one time', async () => {
    fixture.detectChanges();

    // WAIT for promise to resolve before making assertions
    await component.submit();

    expect(gameServiceSpy.createNewGame.calls.count()).toEqual(1);
    expect(gameServiceSpy.createNewGame).toHaveBeenCalledWith(GameMode.CODENAMES_WORDS);
  });

  it('submit should call addGameToDb method on GameService one time', async () => {
    fixture.detectChanges();

    // WAIT for promise to resolve before making assertions
    await component.submit();

    expect(gameServiceSpy.addGameToDb.calls.count()).toEqual(1);
  });

  // Have to use tick and fakeAsync together
  // Can do the same thing with async/await, but use fakeAsync and tick here as an example
  // fakeAsync essentially turns all async stuff into sync
  // tick simulates passage of time, so 'async' actions have resolved (can pass ms into tick if need more than default time to pass)
  it('submit should route to correct URL for board component', fakeAsync (() => {
    fixture.detectChanges();

    component.submit();
    tick()

    expect(location.path()).toBe('/board/test1234');
  }));

  afterEach(() => {
    fixture.destroy();
    TestBed.resetTestingModule();
  });
});
