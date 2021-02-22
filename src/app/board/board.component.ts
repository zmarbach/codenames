import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Card } from '../card';
import { GameIdPair } from '../game-id-pair';
import { GameService } from '../game.service';
import { GameMode } from '../game-mode.enum';
import { Suit } from '../suit.enum';
import { SequenceGameContext } from '../sequence-game-context';
import { GameContext } from '../game-context';
import { MatDialog } from '@angular/material/dialog';
import { Player } from '../player';
import { FormControl } from '@angular/forms';
import { PlayerNameDialogComponent } from '../player-name-dialog/player-name-dialog.component';
import { PlayingCard } from '../playing-card';
import { Face } from '../face';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
})
export class BoardComponent implements OnInit {
  currentGameIdPair = new GameIdPair('', null);
  isSpyMaster = false;
  isSequence = false;
  Suit = Suit;
  Face = Face;
  currentPlayer = new Player(9999, "test", [], "");
  title: String;
  nameForm: FormControl;
  selectedPlayerId: number;

  constructor(private activeRoute: ActivatedRoute, public router: Router, private gameService: GameService, private dialog: MatDialog) { }

  ngOnInit() {
    //TODO - handle this better!!! No setTimeout, figure it out with async await instead!!!
    // maybe create currentGameIdPair instead of "setting it up". Await for it and then move on once we know it is created
    this.setUpCurrentGame(this.currentGameIdPair);

    setTimeout(() => {
      this.isSequence = this.currentGameIdPair.game.mode === GameMode.SEQUENCE ? true : false;
      this.title = this.isSequence? "SEQUENCE" : "CODENAMES";
      if (this.currentGameIdPair.game.mode === GameMode.SEQUENCE){
        this.handleDialog();
      }
    }, 500);

    console.log('currentGameIdPair is: ' + JSON.stringify(this.currentGameIdPair));
  }

  setCurrentPlayer(){
    let sequenceGame = this.currentGameIdPair.game as SequenceGameContext;
    this.currentPlayer = sequenceGame.players.find(player => player.id === this.selectedPlayerId);
  }

  handleDialog(){
    let sequenceGame = this.currentGameIdPair.game as SequenceGameContext;
    console.log("players in sequence game ---- " + JSON.stringify(sequenceGame.players));

    const dialogRef = this.dialog.open(PlayerNameDialogComponent, {
      width: '250px',
      data: sequenceGame.players
    });

    dialogRef.afterClosed().subscribe(result => {
      //need to do something with this result;
      console.log('Selected player has id of ' + result);
      this.currentPlayer = sequenceGame.players.find(player => player.id === result);
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

      //sequence related logic only
      if (this.isSequence){
        if ((card as PlayingCard).face.displayName === "FREE"){
          alert("No need to select this space. It's a freebie.");
        } else {
          let sequenceGame = this.currentGameIdPair.game as SequenceGameContext;
          //removed card because the card selected is not always the card played (one eyed jack or two eyed jack)
          const removedCard = this.removeCardFromHand(card as PlayingCard, this.currentPlayer.cardsInHand as PlayingCard[]);
          if (removedCard){
            this.currentPlayer.cardsInHand.push(this.drawTopCardFromDeck());
            sequenceGame.topCardOnDiscardPile = removedCard as PlayingCard;
            card.color = this.currentPlayer.teamColor;
            card.selected = true;
          }
        }
      } else {
        card.selected = true;
        this.updateScore(card.color);
      }

      await this.gameService.updateGameInDb(this.currentGameIdPair.id, this.currentGameIdPair.game);
    }
  }

  removeCardFromHand(cardToBeRemoved: PlayingCard, cardsInHand: Array<PlayingCard>) : PlayingCard {
    let indexToRemove: number;
    let removedCard: PlayingCard;

    for (let i=0; i < cardsInHand.length; i++){
      if (cardsInHand[i].displayValue === cardToBeRemoved.displayValue){
        indexToRemove = i;
        break;
      }
    }
    if (indexToRemove !== undefined && !isNaN(indexToRemove) && indexToRemove >=0) {
      removedCard = cardsInHand.splice(indexToRemove, 1)[0];
      return removedCard;
    } else if (this.getindexOfTwoEyedJack() !== undefined){
      const response = confirm("You don't have a " + cardToBeRemoved.displayValue + ". Do you want to play your Two-Eyed Jack?");
      if (response){
        removedCard = cardsInHand.splice(this.getindexOfTwoEyedJack(), 1)[0];
        return removedCard;
      }
    } else {
      alert("You can't play there because you don't have a " + cardToBeRemoved.displayValue);
      return undefined;
    }
  }

  getindexOfTwoEyedJack(): number{
    var cards = this.currentPlayer.cardsInHand as PlayingCard[];

    for (let i=0; i<cards.length; i++) {
      //TODO - figure out why this not working with Face.TWO_EYED_JACK equal comparison
      if (cards[i].face.displayName === "👁👁 J"){
        return i;
      }
    }
    return undefined;
  }

  drawTopCardFromDeck(): Card {
    let card = (this.currentGameIdPair.game as SequenceGameContext).deck.pop();
    console.log((this.currentGameIdPair.game as SequenceGameContext).deck.length);
    return card;
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
