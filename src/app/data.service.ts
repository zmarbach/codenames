import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  allWords: Array<String> = [];

  constructor(private firebaseDb: AngularFireDatabase) { }

  async getAllWords(): Promise<String> {
    const snapshot = await this.firebaseDb.database.ref("/words").get();
    return snapshot.val();
  }

  get25RandomWords(allWords){
    this.shuffle(allWords);
    var randomWords: Array<String> = [];
    for (var i=0; i < 25; i++){
      randomWords.push(allWords[i]);
    }
    return randomWords;
  }

  getAllImages(){
    //get image paths from assets
  }

  //get 25 random image paths
  get25RandomImages(){
    // const snapshot = await this.firebaseDb.database.ref("/words").get();
    // return snapshot.val();
  }

  shuffle(wordList: Array<String>){
    for (var i = wordList.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = wordList[i];
      wordList[i] = wordList[j];
      wordList[j] = temp;
    }
  }
}
