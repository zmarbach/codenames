import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { GameContext } from "../app/game-context";
import { Card } from './card';

@Injectable({
  providedIn: 'root'
})

export class InMemoryDataService implements InMemoryDbService {
  counter = 0;
  createDb() {
    const games = [];
    // const games = [
    //   { id: 1,
    //     cards: [
    //       {
    //         word: "Hello",
    //         imgPath: "",
    //         color: "red",
    //         selected: false
    //       }
    //     ],
    //     redScore: 0,
    //     blueScore: 0,
    //     isRedTurn: false,
    //     isBlueTurn: false
    //   },

    // ];
    return {games};
  }

  // Overrides the genId method to ensure that a hero always has an id.
  genId(): number {
    this.counter++;
    return this.counter + 1;
  }
}
