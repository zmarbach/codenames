import { TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Card } from '../models/cards/card';
import { CodenamesGameIdPair } from '../models/game-id-pairs/codenames-game-id-pair';
import { CodenamesGameContext } from '../models/game-contexts/codenames-game-context';
import { GameMode } from '../models/game-mode.enum';

import { GameService } from './game.service';

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
    let gameIdPair = new CodenamesGameIdPair(null, new CodenamesGameContext(GameMode.CODENAMES_WORDS,new Array<Card>(), 0, 0, false, false));
    try {
      gameIdPair.id = service.addGameToDb(gameIdPair.game);
      expect(gameIdPair.id).not.toBeNull();

      gameIdPair.game.blueScore = 99;
      let resultAfterUpdate = await service.updateGameInDb(gameIdPair.id, gameIdPair.game);
      expect(resultAfterUpdate).not.toBeNull();

      const resultAfterGetById = service.setUpGameAndDbListener(gameIdPair);
      expect(resultAfterGetById).not.toBeNull();
    } catch {
      console.log('ERROR!!!');
    } finally {
      if (gameIdPair.id !== null){
        const resultAfterDelete = await service.deleteGameFromDb(gameIdPair.id);
        expect(resultAfterDelete).not.toBeNull();

        const resultAfterGetById = service.setUpGameAndDbListener(gameIdPair);
        expect(resultAfterGetById).toBeUndefined();
      }
    }
  });
});