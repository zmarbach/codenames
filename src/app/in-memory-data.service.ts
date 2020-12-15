import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';

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

  genId(): number {
    this.counter++;
    return this.counter + 1;
  }
}
