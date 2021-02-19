import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Card } from '../card';
import { GameIdPair } from '../game-id-pair';
import { GameService } from '../game.service';
import { GameMode } from '../game-mode.enum';
import { CodenamesGameContext } from '../codenames-game-context';
import { Suit } from '../suit.enum';
import { SequenceGameContext } from '../sequence-game-context';
import { GameContext } from '../game-context';
import { MatDialog } from '@angular/material/dialog';
import { Player } from '../player';
import { PlayerNameDialogComponent } from '../player-name-dialog/player-name-dialog.component';
import { SequenceCard } from '../sequence-card';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
})
export class BoardComponent implements OnInit {
  currentGameIdPair = new GameIdPair('', new CodenamesGameContext(GameMode.CODENAMES_WORDS, new Array<Card>(), 0, 0, false, false));
  isSpyMaster = false;
  Suit = Suit;
  currentPlayer: Player;

  constructor(private activeRoute: ActivatedRoute, public router: Router, private gameService: GameService, private dialog: MatDialog) { }

  ngOnInit() {
    this.setUpCurrentGame(this.currentGameIdPair);
    if (this.currentGameIdPair.game.mode === GameMode.SEQUENCE){
      this.handleDialog();
    }
    console.log('currentGameIdPair is: ' + JSON.stringify(this.currentGameIdPair));
  }

  handleDialog(){
    console.log("handling dialog open");
    let sequenceGame = this.currentGameIdPair.game as SequenceGameContext;
    console.log("players in sequence game ---- " + JSON.stringify(sequenceGame.players));

      const dialogRef = this.dialog.open(PlayerNameDialogComponent, {
        width: '250px',
        data: sequenceGame.players
      });
  
      dialogRef.afterClosed().subscribe(result => {
        //need to do something with this result;
        console.log('Selected player has id of ' + result);
      });
  }

  setUpCurrentGame(currentGameIdPair: GameIdPair){
    this.activeRoute.params.subscribe(params => {
      currentGameIdPair.id = params.id;
    });

    this.gameService.setUpGameAndDbListener(currentGameIdPair);
  }

  async nextGame(){
    // create new game and update it in the DB
    // data on page will update dynamically since using event listener for any DB changes specific to current game id
    let nextGame: GameContext;
    if (this.currentGameIdPair.game.mode === GameMode.SEQUENCE){
      let game = this.currentGameIdPair.game as SequenceGameContext
      nextGame = await this.gameService.createNewGame(this.currentGameIdPair.game.mode, game.getAllPlayerNames());
    } else {
      nextGame = await this.gameService.createNewGame(this.currentGameIdPair.game.mode, []);
    }
    this.gameService.updateGameInDb(this.currentGameIdPair.id, nextGame);
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
      this.updateScore(card.color);
      await this.gameService.updateGameInDb(this.currentGameIdPair.id, this.currentGameIdPair.game);
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
    await this.gameService.updateGameInDb(this.currentGameIdPair.id, this.currentGameIdPair.game);
  }

  async deleteGameFromDb(){
    await this.gameService.deleteGameFromDb(this.currentGameIdPair.id);
  }

}
