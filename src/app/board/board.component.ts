import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Card } from '../card';
import { GameIdPair } from '../game-id-pair';
import { GameService } from '../game.service';
import { GameMode } from '../game-mode.enum';
import { CodenamesGameContext } from '../codenames-game-context';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
})
export class BoardComponent implements OnInit {
  currentGameIdPair = new GameIdPair('', new CodenamesGameContext(GameMode.CODENAMES_WORDS, new Array<Card>(), 0, 0, false, false));
  isSpyMaster = false;

  constructor(private activeRoute: ActivatedRoute, public router: Router, private gameService: GameService) { }

  ngOnInit() {
    this.setUpCurrentGame(this.currentGameIdPair);
    console.log('currentGameIdPair is: ' + JSON.stringify(this.currentGameIdPair));
  }

  setUpCurrentGame(currentGameIdPair: GameIdPair){
    this.activeRoute.params.subscribe(params => {
      currentGameIdPair.id = params.id;
    });

    this.gameService.setUpGameAndDbListener(currentGameIdPair);
  }

  async nextGame(){
    // // figure out game mode before deleteing
    // let gameMode = 'Words';
    // if (this.currentGameIdPair.game.cards[0].imgPath){
    //   gameMode = 'Pictures';
    // }

    // delete old game
    this.deleteGameFromDb();

    // create new game, set it equal to current game and update page
    const nextGameIdPair = await this.gameService.createNewGame(this.currentGameIdPair.game.mode);
    this.currentGameIdPair.id = nextGameIdPair.id;
    this.currentGameIdPair.game = nextGameIdPair.game;
    this.router.navigate(['/board/' + this.currentGameIdPair.id]);
  }

  toggleSpyMaster(){
    if (this.isSpyMaster === false){
      this.isSpyMaster = true;
    } else {
      this.isSpyMaster = false;
    }
  }

  async select(card: Card){
    if (!card.selected){
      card.selected = true;
      await this.updateScore(card.color);
      await this.gameService.updateGameInDb(this.currentGameIdPair);
    }
  }

  updateScore(color: String){
    if (color == 'red' && this.currentGameIdPair.game.redScore !== 0){
      this.currentGameIdPair.game.redScore--;
      console.log('hello');
    } else if (color == 'blue' && this.currentGameIdPair.game.blueScore !== 0){
      this.currentGameIdPair.game.blueScore--;
      console.log('hello');
    }
  }

  async endTurn(){
    if (this.currentGameIdPair.game.isRedTurn){
      this.currentGameIdPair.game.isRedTurn = false;
      this.currentGameIdPair.game.isBlueTurn = true;
    } else {
      this.currentGameIdPair.game.isRedTurn = true;
      this.currentGameIdPair.game.isBlueTurn = false;
    }
    // update game in Firebase DB
    await this.gameService.updateGameInDb(this.currentGameIdPair);
  }

  async deleteGameFromDb(){
    await this.gameService.deleteGameFromDb(this.currentGameIdPair.id);
  }

}
