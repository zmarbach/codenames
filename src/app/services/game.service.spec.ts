import { TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Card } from '../models/cards/card';
import { CodenamesGameContext } from '../models/game-contexts/codenames-game-context';
import { GameIdPair } from '../models/game-id-pair';
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
    let gameIdPair = new GameIdPair(null, new CodenamesGameContext(GameMode.CODENAMES_WORDS,new Array<Card>(), 0, 0, false, false));
    try {
      gameIdPair.id = service.addGameToDb(gameIdPair.game);
      expect(gameIdPair.id).not.toBeNull();
      console.log('Add game ---> SUCCESS');

      gameIdPair.game.blueScore = 99;
      let resultAfterUpdate = await service.updateGameInDb(gameIdPair.id, gameIdPair.game);
      expect(resultAfterUpdate).not.toBeNull();
      console.log('Update game ---> SUCCESS');

      const resultAfterGetById = service.setUpGameAndDbListener(gameIdPair);
      expect(resultAfterGetById).not.toBeNull();
      console.log('Get game by id is NOT null BEFORE delete ---> SUCCESS');
    } catch {
      console.log('ERROR!!!');
    } finally {
      if (gameIdPair.id !== null){
        const resultAfterDelete = await service.deleteGameFromDb(gameIdPair.id);
        expect(resultAfterDelete).not.toBeNull();
        console.log('Delete game ---> SUCCESS');

        const resultAfterGetById = service.setUpGameAndDbListener(gameIdPair);
        expect(resultAfterGetById).toBeUndefined();
        console.log('Get game by id is undeffined AFTER delete ---> SUCCESS');
      }
    }
  });
});