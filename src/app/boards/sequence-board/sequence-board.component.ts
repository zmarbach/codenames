import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Card } from 'src/app/models/cards/card';
import { PlayingCard } from 'src/app/models/cards/playing-card';
import { Face } from 'src/app/models/face';
import { GameIdPair } from 'src/app/models/game-id-pairs/game-id-pair';
import { Player } from 'src/app/models/player';
import { SequenceGameIdPair } from 'src/app/models/game-id-pairs/sequence-game-id-pair';
import { Suit } from 'src/app/models/suit.enum';
import { PlayerNameDialogComponent } from 'src/app/player-name-dialog/player-name-dialog.component';
import { SequenceGameService } from 'src/app/services/sequence-game.service';
import { Utils } from 'src/app/utils';

const FAILURE = "fail"
const SUCCESS = "success"

@Component({
  selector: 'app-sequence-board',
  templateUrl: './sequence-board.component.html',
  styleUrls: ['./sequence-board.component.css']
})
export class SequenceBoardComponent implements OnInit {

  currentGameIdPair = new SequenceGameIdPair('', null);
  Suit = Suit;
  Face = Face;
  selectedPlayer = new Player(9999, 'test', [], '');
  title: String;
  nameForm: FormControl;

  constructor(private activeRoute: ActivatedRoute, public router: Router, private sequenceGameService: SequenceGameService, private dialog: MatDialog) {}

  ngOnInit() {
    //TODO - handle this better!!! No setTimeout, figure it out with async await instead!!!
    // maybe create currentGameIdPair instead of "setting it up". Await for it and then move on once we know it is created
    this.setUpCurrentGame(this.currentGameIdPair);

    setTimeout(() => {
      this.title = 'SEQUENCE';
      this.handleDialog();
    }, 1000);

  }

  handleDialog() {
    const dialogRef = this.dialog.open(PlayerNameDialogComponent, {
      width: '250px',
      data: this.currentGameIdPair.game.players,
    });

    dialogRef.afterClosed().subscribe((result) => {
      const selectedPlayerJSON = this.currentGameIdPair.game.players.find(
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

    this.sequenceGameService.setUpGameAndDbListener(currentGameIdPair);
  }

  async nextGame() {
    // create new game and update it in the DB
    // data on page will update dynamically since using event listener for any DB changes specific to current game id
    const nextGame = await this.sequenceGameService.createNewGame(this.currentGameIdPair.game.mode, this.sequenceGameService.getRedPlayerNames(this.currentGameIdPair.game), this.sequenceGameService.getBluePlayerNames(this.currentGameIdPair.game));
    await this.sequenceGameService.updateGameInDb(this.currentGameIdPair.id, nextGame);
    this.handleDialog();
  }

  //TODO - clean this up. Lots of duplicate code between select and removeWithOneEyedJack
  async select(card: Card) {
    if (!card.selected) {
        const statusCode = this.doSequenceSelect(card);
        if (statusCode === SUCCESS){
          this.sequenceGameService.handlePotentialNewSequence(this.currentGameIdPair.game, this.selectedPlayer.teamColor);
        }
      await this.sequenceGameService.updateGameInDb(this.currentGameIdPair.id, this.currentGameIdPair.game);
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
      //removed card because the card selected is not always the card played (one eyed jack or two eyed jack)
      const removedCard = this.sequenceGameService.removeCardFromHand(playingCard.displayValue, this.selectedPlayer.cardsInHand as PlayingCard[]);
      
      if (removedCard) {
        this.selectedPlayer.cardsInHand.push(this.sequenceGameService.drawTopCardFromDeck(this.currentGameIdPair.game));

        //Have to update player object in the actual game that gets persisted in DB (otherwise hand wont be updated on page reload)
        this.currentGameIdPair.game.players.find(player => player.id === this.selectedPlayer.id).cardsInHand = this.selectedPlayer.cardsInHand

        this.sequenceGameService.addToDiscardPile(removedCard, this.currentGameIdPair.game);
        this.currentGameIdPair.game.topCardOnDiscardPile = removedCard;
        card.color = this.selectedPlayer.teamColor;
        card.selected = true;
        this.currentGameIdPair.game.currentPlayer = this.sequenceGameService.getNextPlayer(this.currentGameIdPair.game)
        return SUCCESS;
      }
    }
  }

  //TODO - clean this up. Lots of duplicate code between select and removeWithOneEyedJack
  async removeWithOneEyedJack(card: PlayingCard, boardIndexOfCard: number) {
    if (this.selectedPlayer.teamColor === card.color){
      alert("You can only remove the other team's cards.");
      return;
    }

    if (this.sequenceGameService.cardIsPartOfExistingSequence(boardIndexOfCard, this.currentGameIdPair.game.existingSequences)){
      alert('You cannot remove this card because it is already part of an exisiting sequence');
      return;
    }

    let indexOfOneEyedJack = this.sequenceGameService.getindexOfCard(this.selectedPlayer.cardsInHand as PlayingCard[], '👁 J');
    if (indexOfOneEyedJack !== undefined) {
      if (confirm('Are you sure you want to use your One-Eyed Jack to remove the ' + card.displayValue + '?')) {
        let removedCard = this.selectedPlayer.cardsInHand.splice(indexOfOneEyedJack, 1)[0] as PlayingCard;
        this.selectedPlayer.cardsInHand.push(this.sequenceGameService.drawTopCardFromDeck(this.currentGameIdPair.game));
        
         //Have to update player object in the actual game that gets persisted in DB (otherwise hand wont be updated on page reload)
         this.currentGameIdPair.game.players.find(player => player.id === this.selectedPlayer.id).cardsInHand = this.selectedPlayer.cardsInHand

        this.sequenceGameService.addToDiscardPile(removedCard, this.currentGameIdPair.game);
        this.currentGameIdPair.game.topCardOnDiscardPile = removedCard;

        card.selected = false;
        // Reset color because sequence check looks for colors to match
        card.color = '';
        
        this.currentGameIdPair.game.currentPlayer = this.sequenceGameService.getNextPlayer(this.currentGameIdPair.game)

        await this.sequenceGameService.updateGameInDb(this.currentGameIdPair.id, this.currentGameIdPair.game);
      }
    } else {
        alert('You cannot remove the ' + card.displayValue + " because you don't have a One-Eyed Jack.");
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
    await this.sequenceGameService.updateGameInDb(this.currentGameIdPair.id, this.currentGameIdPair.game);
  }

  async deleteGameFromDb() {
    await this.sequenceGameService.deleteGameFromDb(this.currentGameIdPair.id);
  }

  async midGameShuffle() {
    //multiple shuffles just for fun
    Utils.shuffle(this.currentGameIdPair.game.discardPile);
    Utils.shuffle(this.currentGameIdPair.game.discardPile);
    Utils.shuffle(this.currentGameIdPair.game.discardPile);

    this.currentGameIdPair.game.deck = this.currentGameIdPair.game.discardPile;
    this.currentGameIdPair.game.discardPile = [];
    this.currentGameIdPair.game.topCardOnDiscardPile = null;

    await this.sequenceGameService.updateGameInDb(this.currentGameIdPair.id, this.currentGameIdPair.game);
  }

  private isPlayersTurn(): Boolean {
    return this.selectedPlayer.equals(this.currentGameIdPair.game.currentPlayer)
  }

  topDiscardIsRedSuit(){
    let topDiscard = this.currentGameIdPair.game.topCardOnDiscardPile;
    return topDiscard?.suit === Suit.HEART || topDiscard?.suit === Suit.DIAMOND; 
  }
}



