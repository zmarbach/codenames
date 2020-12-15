import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  allWords: Array<String> = [];

  constructor(private firebaseDb: AngularFireDatabase) { }

  // async getAllWords(){
  //   const allWords = await this.firebaseDb.list<String>("/words").valueChanges().toPromise();
  //   return allWords.values();
  // }

  async getAllWords(): Promise<String> {
    const snapshot = await this.firebaseDb.database.ref("/words")
      .get();
    return snapshot.val();
  }
  // gotData(data) {
  //   console.log("All words...");
  //   console.log(data.val());
  //   this.allWords = data.val();
  // }

  // errData(errData) {
  //   console.log("Error!");
  //   console.log(errData);
  // }

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

  get25RandomImages(){
    //get 25 random image paths from assets
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
