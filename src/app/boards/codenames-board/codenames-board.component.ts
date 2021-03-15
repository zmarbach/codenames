import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Card } from 'src/app/models/cards/card';
import { CodenamesGameIdPair } from 'src/app/models/codenames-game-id-pair';
import { GameIdPair } from 'src/app/models/game-id-pair';
import { CodenamesGameService } from 'src/app/services/codenames-game.service';

@Component({
  selector: 'app-codenames-board',
  templateUrl: './codenames-board.component.html',
  styleUrls: ['./codenames-board.component.css']
})
export class CodenamesBoardComponent implements OnInit {

  currentGameIdPair = new CodenamesGameIdPair('', null);
  isSpyMaster = false;
  title: String;

  constructor(private activeRoute: ActivatedRoute, public router: Router, private codenamesGameService: CodenamesGameService) {}

  ngOnInit() {
    //TODO - handle this better!!! No setTimeout, figure it out with async await instead!!!
    // maybe create currentGameIdPair instead of "setting it up". Await for it and then move on once we know it is created
    this.setUpCurrentGame(this.currentGameIdPair);
    this.title = 'CODENAMES';
  }

  setUpCurrentGame(currentGameIdPair: GameIdPair) {
    this.activeRoute.params.subscribe((params) => {
      currentGameIdPair.id = params.id;
    });

    this.codenamesGameService.setUpGameAndDbListener(currentGameIdPair);
  }

  async nextGame() {
    // create new game and update it in the DB
    // data on page will update dynamically since using event listener for any DB changes specific to current game id
    const nextGame = await this.codenamesGameService.createNewGame(this.currentGameIdPair.game.mode);
    await this.codenamesGameService.updateGameInDb(this.currentGameIdPair.id, nextGame);
  }

  toggleSpyMaster() {
    if (this.isSpyMaster === false) {
      this.isSpyMaster = true;
    } else {
      this.isSpyMaster = false;
    }
  }

  async select(card: Card) {
    if (!card.selected) {
      card.selected = true;
      this.codenamesGameService.updateScore(this.currentGameIdPair.game, card.color);
      await this.codenamesGameService.updateGameInDb(this.currentGameIdPair.id, this.currentGameIdPair.game);
    }
  }

  async endTurn() {
    if (this.currentGameIdPair.game.isRedTurn) {
      this.currentGameIdPair.game.isRedTurn = false;
      this.currentGameIdPair.game.isBlueTurn = true;
    } else {
      this.currentGameIdPair.game.isRedTurn = true;
      this.currentGameIdPair.game.isBlueTurn = false;
    }
    await this.codenamesGameService.updateGameInDb(this.currentGameIdPair.id, this.currentGameIdPair.game);
  }

  async deleteGameFromDb() {
    await this.codenamesGameService.deleteGameFromDb(this.currentGameIdPair.id);
  }
}



