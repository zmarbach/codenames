import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

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
    this.shuffle(list);
    const randomItems: Array<String> = [];
    for (let i = 0; i < num; i++){
      randomItems.push(list[i]);
    }
    return randomItems;
  }

  private shuffle(wordList: Array<String>){
    for (let i = wordList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = wordList[i];
      wordList[i] = wordList[j];
      wordList[j] = temp;
    }
  }
}
