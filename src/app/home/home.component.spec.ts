import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from 'src/environments/environment';
import { routes } from '../app-routing.module';
import { Card } from '../card';
import { GameContext } from '../game-context';
import { GameIdPair } from '../game-id-pair';
import { GameService } from '../game.service';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let gameServiceSpy: jasmine.SpyObj<GameService>;
  let router = {
    navigate: jasmine.createSpy('navigate')
  }

  beforeEach(async () => {
    const spyForGameService = jasmine.createSpyObj('GameService', ['createNewGame']);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule,
      ],
      providers: [
        {provide: GameService, useValue: spyForGameService},
        {provide: Router, useValue: router}
      ],
      declarations: [ HomeComponent ]
    })
    .compileComponents();

    gameServiceSpy = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
  });

  beforeEach(() => {
    const fakeGamePairId = new GameIdPair("test1234", new GameContext(new Array<Card>(), 0, 0, false, false));
    gameServiceSpy.createNewGame.and.returnValue(Promise.resolve(fakeGamePairId));

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('submit should call createNewGame method on GameService', () => {
    //act
    component.submit();

    //assert
    expect(gameServiceSpy.createNewGame.calls.count()).toEqual(1);
    expect(gameServiceSpy.createNewGame).toHaveBeenCalledWith("Words");
  });

  it('submit should route to correct URL for board component', () => {
    //act
    component.submit();

    //assert
    expect(router.navigate).toHaveBeenCalledWith(['/board/test1234']);
  });
});
