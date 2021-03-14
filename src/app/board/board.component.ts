import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Card } from '../models/cards/card';
import { GameIdPair } from '../models/game-id-pair';
import { GameMode } from '../models/game-mode.enum';
import { Suit } from '../models/suit.enum';
import { SequenceGameContext } from '../models/game-contexts/sequence-game-context';
import { GameContext } from '../models/game-contexts/game-context';
import { MatDialog } from '@angular/material/dialog';
import { Player } from '../models/player';
import { FormControl } from '@angular/forms';
import { PlayerNameDialogComponent } from '../player-name-dialog/player-name-dialog.component';
import { PlayingCard } from '../models/cards/playing-card';
import { Face } from '../models/face';
import { Utils } from '../utils';
import { SequenceGameService } from '../services/sequence-game.service';
import { CodenamesGameService } from '../services/codenames-game.service';
import { ThrowStmt } from '@angular/compiler';

const FAILURE = "fail"
const SUCCESS = "success"

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
  selectedPlayer = new Player(9999, 'test', [], '');
  title: String;
  nameForm: FormControl;
  selectedPlayerId: number;

  constructor(private activeRoute: ActivatedRoute, public router: Router, private sequenceGameService: SequenceGameService, private codenamesGameService: CodenamesGameService, private dialog: MatDialog) {}

  ngOnInit() {
    //TODO - handle this better!!! No setTimeout, figure it out with async await instead!!!
    // maybe create currentGameIdPair instead of "setting it up". Await for it and then move on once we know it is created
    this.setUpCurrentGame(this.currentGameIdPair);

    setTimeout(() => {
      this.isSequence = this.currentGameIdPair.game.mode === GameMode.SEQUENCE ? true : false;
      this.title = this.isSequence ? 'SEQUENCE' : 'CODENAMES';
      if (this.currentGameIdPair.game.mode === GameMode.SEQUENCE) {
        this.handleDialog();
      }
    }, 1000);
  }

  handleDialog() {
    let sequenceGame = this.currentGameIdPair.game as SequenceGameContext;

    const dialogRef = this.dialog.open(PlayerNameDialogComponent, {
      width: '250px',
      data: sequenceGame.players,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Selected player has id of ' + result);
      const selectedPlayerJSON = sequenceGame.players.find(
        (player) => player.id === result
      );
      // Transform the data from find into an ACTUAL player obj so we have access to functions
      this.selectedPlayer = new Player(selectedPlayerJSON.id, selectedPlayerJSON.name, selectedPlayerJSON.cardsInHand, selectedPlayerJSON.teamColor)
    });
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
    let nextGame: GameContext;
    if (this.currentGameIdPair.game.mode === GameMode.SEQUENCE) {
      let sequenceGame = this.currentGameIdPair.game as SequenceGameContext;
      nextGame = await this.sequenceGameService.createNewGame(this.currentGameIdPair.game.mode, this.sequenceGameService.getRedPlayerNames(sequenceGame), this.sequenceGameService.getBluePlayerNames(sequenceGame));
    } else {
      nextGame = await this.codenamesGameService.createNewGame(this.currentGameIdPair.game.mode);
    }
    await this.sequenceGameService.updateGameInDb(this.currentGameIdPair.id, nextGame);
    if (nextGame.mode === GameMode.SEQUENCE){
      this.handleDialog()
    }
  }

  toggleSpyMaster() {
    if (this.isSpyMaster === false) {
      this.isSpyMaster = true;
    } else {
      this.isSpyMaster = false;
    }
  }

  //TODO - clean this up. Lots of duplicate code between select and removeWithOneEyedJack
  async select(card: Card) {
    let statusCode: String = ''

    if (!card.selected) {
      if (this.isSequence) {
        statusCode = this.doSequenceSelect(card);
        if (this.isSequence && statusCode === SUCCESS){
          const sequenceGame = this.currentGameIdPair.game as SequenceGameContext;
          this.sequenceGameService.checkForSequence(sequenceGame.cardsForBoard, this.selectedPlayer.teamColor, sequenceGame.existingSequences);
        }
      } else {
        card.selected = true;
        this.updateScore(card.color);
      }

      console.log("Hand RIGHT BEFORE updating db --->");
      this.printDisplayValuesOfHand(this.selectedPlayer.cardsInHand);

      await this.codenamesGameService.updateGameInDb(this.currentGameIdPair.id, this.currentGameIdPair.game);
    }
  }

  private doSequenceSelect(card: Card) : String {
    let _card = card as PlayingCard;
    //Have to manually create new PlayingCard because really this is just JSON passed in.
    //Otherwise won't have access to functions on PlayingCard, Face, Suit, or any other objects
    let playingCard = new PlayingCard(card.color, card.selected, Face.mapToFace(_card.face.rank, _card.face.displayName), _card.suit);

    if (playingCard.isFreeSpace()) {
      alert("No need to select this space. It's a freebie.");
      return FAILURE;
    } else if (!this.isPlayersTurn()){
      alert("It is not your turn yet.")
      return FAILURE;
    } else {
      let sequenceGame = this.currentGameIdPair.game as SequenceGameContext;

      console.log("Hand BEFORE play --->")
      this.printDisplayValuesOfHand(this.selectedPlayer.cardsInHand)

      //removed card because the card selected is not always the card played (one eyed jack or two eyed jack)
      const removedCard = this.sequenceGameService.removeCardFromHand(playingCard.displayValue, this.selectedPlayer.cardsInHand as PlayingCard[]);
      
      console.log("Hand AFTER play but BEFORE draw ---> ")
      this.printDisplayValuesOfHand(this.selectedPlayer.cardsInHand)

      if (removedCard) {
        this.selectedPlayer.cardsInHand.push(this.sequenceGameService.drawTopCardFromDeck(sequenceGame));

        console.log("Hand AFTER draw ---> ");
        this.printDisplayValuesOfHand(this.selectedPlayer.cardsInHand)


        this.sequenceGameService.addToDiscardPile(removedCard, sequenceGame);
        sequenceGame.topCardOnDiscardPile = removedCard;
        card.color = this.selectedPlayer.teamColor;
        card.selected = true;
        sequenceGame.currentPlayer = this.sequenceGameService.getNextPlayer(sequenceGame as SequenceGameContext)
        return SUCCESS;
      }
    }
  }
  printDisplayValuesOfHand(cardsInHand: Card[]) {
    let displayValues = []
    for (let card of cardsInHand){
      displayValues.push((card as PlayingCard).displayValue)
    }

    console.log(JSON.stringify(displayValues))
  }

  //TODO - clean this up. Lots of duplicate code between select and removeWithOneEyedJack
  async removeWithOneEyedJack(card: PlayingCard, boardIndexOfCard: number) {
    let sequenceGame = this.currentGameIdPair.game as SequenceGameContext;

    if (this.selectedPlayer.teamColor === card.color){
      alert("You can only remove the other team's cards.");
      return;
    }

    console.log("Board index is " + boardIndexOfCard)
    if (this.sequenceGameService.cardIsPartOfExistingSequence(boardIndexOfCard, sequenceGame.existingSequences)){
      alert('You cannot remove this card because it is already part of an exisiting sequence');
      return;
    }

    let indexOfOneEyedJack = this.sequenceGameService.getindexOfCard(this.selectedPlayer.cardsInHand as PlayingCard[], '👁 J');
    if (indexOfOneEyedJack !== undefined) {
      if (confirm('Are you sure you want to use your One-Eyed Jack to remove the ' + card.displayValue + '?')) {
        let removedCard = this.selectedPlayer.cardsInHand.splice(indexOfOneEyedJack, 1)[0] as PlayingCard;
        this.selectedPlayer.cardsInHand.push(this.sequenceGameService.drawTopCardFromDeck(sequenceGame));

        this.sequenceGameService.addToDiscardPile(removedCard, sequenceGame);
        sequenceGame.topCardOnDiscardPile = removedCard;

        card.selected = false;
        // Reset color because sequence check looks for colors to match
        card.color = '';
        
        sequenceGame.currentPlayer = this.sequenceGameService.getNextPlayer(sequenceGame as SequenceGameContext)

        await this.sequenceGameService.updateGameInDb(
          this.currentGameIdPair.id,
          this.currentGameIdPair.game
        );
      }
    } else {
      alert('You cannot remove the ' + card.displayValue + " because you don't have a One-Eyed Jack.");
    }
  }

  updateScore(color: String) {
    if (color == 'red' && this.currentGameIdPair.game.redScore !== 0) {
      this.currentGameIdPair.game.redScore--;
      console.log('hello');
    } else if (color == 'blue' && this.currentGameIdPair.game.blueScore !== 0) {
      this.currentGameIdPair.game.blueScore--;
      console.log('hello');
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
    // update game in Firebase DB
    await this.codenamesGameService.updateGameInDb(this.currentGameIdPair.id, this.currentGameIdPair.game);
  }

  async deleteGameFromDb() {
    await this.codenamesGameService.deleteGameFromDb(this.currentGameIdPair.id);
  }

  midGameShuffle() {
    let sequenceGame = this.currentGameIdPair.game as SequenceGameContext;

    //multiple shuffles just for fun
    Utils.shuffle(sequenceGame.discardPile);
    Utils.shuffle(sequenceGame.discardPile);
    Utils.shuffle(sequenceGame.discardPile);

    sequenceGame.deck = sequenceGame.discardPile;
    sequenceGame.discardPile = [];
  }

  private isPlayersTurn(): Boolean {
    const sequenceGame = this.currentGameIdPair.game as SequenceGameContext;
    return this.selectedPlayer.equals(sequenceGame.currentPlayer)
  }

  topDiscardIsRedSuit(){
    let sequenceGame = this.currentGameIdPair.game as SequenceGameContext
    return sequenceGame.topCardOnDiscardPile.suit === Suit.HEART || sequenceGame.topCardOnDiscardPile.suit === Suit.DIAMOND; 
  }
}


