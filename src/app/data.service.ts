import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Utils } from './utils';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  allWords: Array<String> = [];

  constructor(private firebaseDb: AngularFireDatabase) { }

  async getAllWords(): Promise<String> {
    const snapshot = await this.firebaseDb.database.ref('/words').get();
    return snapshot.val();
  }

  async getAllImages(): Promise<String> {
    const snapshot = await this.firebaseDb.database.ref('/imgPaths').get();
    return snapshot.val();
  }

  // pass in either 25 (words) or 20 (pictures)
  getRandomItems(list, num: number){
    Utils.shuffle(list);
    const randomItems: Array<String> = [];
    for (let i = 0; i < num; i++){
      randomItems.push(list[i]);
    }
    return randomItems;
  }
}
