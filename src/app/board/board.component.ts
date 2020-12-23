import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Card } from '../card';
import { GameContext } from '../game-context';
import { GameIdPair } from '../game-id-pair';
import { GameService } from '../game.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
})
export class BoardComponent implements OnInit {
  currentGameIdPair = new GameIdPair("", new GameContext(new Array<Card>(), 0,0, false, false));
  isSpyMaster=false;

  constructor(private activeRoute: ActivatedRoute, public router: Router, private gameService: GameService) { }

  ngOnInit() {
    this.setUpCurrentGame();
    console.log("currentGameIdPair is: " + JSON.stringify(this.currentGameIdPair));
  }

  async setUpCurrentGame(){
    this.activeRoute.params.subscribe(params => {
      this.currentGameIdPair.id = params.id;
    })

    this.currentGameIdPair.game = await this.gameService.getGameById(this.currentGameIdPair.id);
    if(this.currentGameIdPair.game == undefined){
      window.alert("This game has been deleted. You will now be redirected to the Home Page to start a new game");
      this.router.navigate(["/home"]);
    }
  }

  async nextGame(){
    //figure out game mode before deleteing
    var gameMode = "Words"
    if (this.currentGameIdPair.game.cards[0].imgPath){
      gameMode = "Pictures";
    }

    //delete old game
    this.deleteGameFromDb();

    //create new game, set it equal to current game and update page
    const nextGameIdPair = await this.gameService.createNewGame(gameMode);
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
      this.updateScore(card.color);
      card.selected = true;
    }
    //update game in Firebase DB
    await this.gameService.updateGameInDb(new GameIdPair(this.currentGameIdPair.id, this.currentGameIdPair.game));
  }

  async updateScore(color: String){
    if (color == "red" && this.currentGameIdPair.game.redScore !== 0){
      this.currentGameIdPair.game.redScore--;
    } else if (color == "blue" && this.currentGameIdPair.game.blueScore !== 0){
      this.currentGameIdPair.game.blueScore--;
    }
    //update game in Firebase DB
    await this.gameService.updateGameInDb(new GameIdPair(this.currentGameIdPair.id, this.currentGameIdPair.game));
  }

  async endTurn(){
    if (this.currentGameIdPair.game.isRedTurn){
      this.currentGameIdPair.game.isRedTurn = false;
      this.currentGameIdPair.game.isBlueTurn = true;
    } else {
      this.currentGameIdPair.game.isRedTurn = true;
      this.currentGameIdPair.game.isBlueTurn = false;
    }
    //update game in Firebase DB
    await this.gameService.updateGameInDb(new GameIdPair(this.currentGameIdPair.id, this.currentGameIdPair.game));
  }

  async deleteGameFromDb(){
    await this.gameService.deleteGameFromDb(this.currentGameIdPair.id);
  }

}
