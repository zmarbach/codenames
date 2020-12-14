import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Card } from '../card';
import { GameContext } from '../game-context';
import { GameService } from '../game.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
})
export class BoardComponent implements OnInit {
  currentGame: GameContext;
  isSpyMaster=false;

  constructor(private activeRoute: ActivatedRoute, private router: Router, private gameService: GameService) { }

  ngOnInit() {
    this.getCurrentGame();
  }

  async getCurrentGame(){
    var gameId;
    this.activeRoute.params.subscribe(params => {
      gameId = params.id;
    })

    this.currentGame = await this.gameService.getGameById(gameId);
  }

  async nextGame(){
    //figure out game mode before deleteing
    var gameMode = "Words"
    if (this.currentGame.cards[0].imgPath){
      gameMode = "Pictures";
    }

    //delete old game
    var oldGame = this.currentGame;
    this.deleteGame(oldGame);

    //create new game, set it equal to current game and update page
    const nextGame = await this.gameService.createNewGame(gameMode);
    this.currentGame = nextGame;
    this.router.navigate(['/board/' + nextGame.id]);
  }

  deleteGame(game: GameContext){
    this.gameService.deleteGame(game);
  }

  toggleSpyMaster(){
    if (this.isSpyMaster === false){
      this.isSpyMaster = true;
    } else {
      this.isSpyMaster = false;
    }
  }

  select(card: Card){
    if (!card.selected){
      this.updateScore(card.color);
      card.selected = true;
    }
    //update game in Firebase DB
  }

  updateScore(color: String){
    if (color == "red" && this.currentGame.redScore !== 0){
      this.currentGame.redScore--;
    } else if (color == "blue" && this.currentGame.blueScore !== 0){
      this.currentGame.blueScore--;
    }
    //update game in Firebase DB
  }

  endTurn(){
    if (this.currentGame.isRedTurn){
      this.currentGame.isRedTurn = false;
      this.currentGame.isBlueTurn = true;
    } else {
      this.currentGame.isRedTurn = true;
      this.currentGame.isBlueTurn = false;
    }
    //update game in Firebase DB
  }

}
