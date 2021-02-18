import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../game.service';
import { GameMode } from '../game-mode.enum';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isSequence = false;
  settingsForm = new FormGroup({
    gameMode: new FormControl(GameMode.CODENAMES_WORDS, Validators.required),
  });
  GameMode = GameMode;

  constructor(private router: Router, private gameService: GameService) { }

  ngOnInit(): void {
  }

  async submit(){
    console.log('Creating new game...');
    console.log('Game mode value is : ' + this.settingsForm.value.gameMode as GameMode);
    const newGame = await this.gameService.createNewGame(this.settingsForm.value.gameMode as GameMode);
    const newGameFirebaseId = this.gameService.addGameToDb(newGame);

    console.log('New game created with this id ---> ' + newGameFirebaseId);
    this.router.navigate(['/board/' + newGameFirebaseId]);
  }

  showSequence(){
    this.isSequence = true;
  }

  hideSequence(){
    this.isSequence = false;
  }

}
