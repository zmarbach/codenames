import { Injectable } from '@angular/core';

import { DataService } from '..//services/data.service';
import { GameContext } from '../models/game-contexts/game-context';
import { AngularFireDatabase } from '@angular/fire/database';
import { GameIdPair } from '../models/game-id-pair';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})
export abstract class GameService {
  dataService: DataService;
  firebaseDb: AngularFireDatabase;
  router: Router;

  constructor(dataService: DataService, firebaseDb: AngularFireDatabase, router: Router) {
    this.dataService = dataService;
    this.firebaseDb = firebaseDb;
    this.router = router;
  }

  setUpGameAndDbListener(gameIdPair: GameIdPair) {
    this.firebaseDb.database.ref('/games').child(gameIdPair.id.toString()).on('value', (snapshot) => {
        if (snapshot.exists()) {
            gameIdPair.game = snapshot.val();
        }
      });
  }

  addGameToDb(game: GameContext) {
    const firebaseId = this.firebaseDb.database.ref('/games').push(game);
    console.log('Game added to DB with id of ' + firebaseId.key);
    return firebaseId.key;
  }

  async updateGameInDb(gameIdToUpdate: String, updatedGame: GameContext) {
    if ((await this.firebaseDb.database.ref('/games').child(gameIdToUpdate.toString()).get()).exists()) {
      await this.firebaseDb.database.ref('/games').child(gameIdToUpdate.toString()).set(updatedGame);
      console.log('Updating game DB with id of ' + gameIdToUpdate);
    } else {
      window.alert('This game has been deleted. You will now be redirected to the Home Page to start a new game');
      this.router.navigate(['/home']);
    }
  }

  async deleteGameFromDb(firebaseId: any) {
    await this.firebaseDb.database.ref('/games').child(firebaseId).remove();
  }
}
