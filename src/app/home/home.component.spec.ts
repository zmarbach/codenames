import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from 'src/environments/environment';
import { routes } from '../app-routing.module';
import { Card } from '../card';
import { GameContext } from '../game-context';
import { GameIdPair } from '../game-id-pair';
import { GameService } from '../game.service';

import { HomeComponent } from './home.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { ReactiveFormsModule } from '@angular/forms';

describe('HomeComponent', () => {
  let router : Router;
  let location: Location;
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let gameServiceSpy: jasmine.SpyObj<GameService>;

  beforeEach(async () => {
    const spyForGameService = jasmine.createSpyObj('GameService', ['createNewGame']);

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
        {provide: GameService, useValue: spyForGameService},
      ],
      declarations: [ HomeComponent ],
    })
    .compileComponents();

    gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
  });

  beforeEach(() => {
    const fakeGamePairId = new GameIdPair("test1234", new GameContext(new Array<Card>(), 0, 0, false, false));
    gameServiceSpy.createNewGame.and.returnValue(Promise.resolve(fakeGamePairId));

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    //set up location change listener and execute initial nav
    router.initialNavigation();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  //routing is async so need to set up unit test acccordingly
  it('navigation should default to /home', async () => {
    fixture.detectChanges();

    fixture.whenStable().then( () => {
      expect(location.path()).toBe('/home');
    });
  });

  it('submit should call createNewGame method on GameService', async () => {
    fixture.detectChanges();

    //WAIT for promise to resolve before making assertions
    await component.submit();

    expect(gameServiceSpy.createNewGame.calls.count()).toEqual(1);
    expect(gameServiceSpy.createNewGame).toHaveBeenCalledWith("Words");
  });

  //Have to use tick and fakeAsync together
  //Can do the same thing with async/await, but use fakeAsync and tick here as an example
  //fakeAsync essentially turns all asycn stuff into sync
  //tick simulates passage of time, so 'asycn' actions have resolved (can pass ms into tick if need more than default time to pass)
  it('submit should route to correct URL for board component', fakeAsync(() => {
    component.submit();
    tick();

    expect(location.path()).toBe('/board/test1234');
  }));

});
