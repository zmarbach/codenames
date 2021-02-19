import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, ControlContainer } from '@angular/forms';
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
  settingsForm: FormGroup;
  GameMode = GameMode;
  numOfPlayerOptions = [
      {value: '2', displayValue: 2},
      {value: '4', displayValue: 4},
      {value: '6', displayValue: 6},
      {value: '8', displayValue: 8},
      {value: '10', displayValue: 10},
      {value: '12', displayValue: 12},
  ]

  constructor(private router: Router, private gameService: GameService) { }

  ngOnInit(): void {
    this.settingsForm = new FormGroup({
      gameMode: new FormControl(GameMode.CODENAMES_WORDS, Validators.required),
      numOfPlayers: new FormControl(''),
      playerNames: new FormArray([])
    });  

    this.settingsForm.get('gameMode').valueChanges.subscribe(mode => this.updateRequiredStatus(mode))
    this.settingsForm.get('numOfPlayers').valueChanges.subscribe(num => this.updateNumOfPlayers(num))
  }

  updateRequiredStatus(mode: GameMode){
    console.log(mode);
    if (mode === GameMode.SEQUENCE){
      this.numOfPlayers.enable();
      this.playerNames.controls.forEach(control => control.enable);
      this.numOfPlayers.setValidators(Validators.required);
      this.playerNames.controls.forEach(control => control.setValidators(Validators.required));
    } else {
      this.numOfPlayers.disable();
      this.playerNames.controls.forEach(control => control.disable());
      this.numOfPlayers.clearValidators();
      this.playerNames.controls.forEach(control => control.clearValidators());
    }
  }

  updateNumOfPlayers(numOfPlayerOption){
    let num = numOfPlayerOption.value;
    if (this.playerNames.length !== 0){
      console.log("player length is " + this.playerNames.length);
      this.playerNames.clear();
    }
    for (let i=0; i < num; i++){
      console.log(num);
      this.playerNames.push(new FormControl("", Validators.required));
    }
  }

  async submit(){
    console.log('Creating new game...');
    console.log('Game mode value is : ' + this.settingsForm.value.gameMode as GameMode);
    console.log('Player names are : ' + JSON.stringify(this.settingsForm.value.playerNames));
    const newGame = await this.gameService.createNewGame(this.settingsForm.value.gameMode as GameMode, this.settingsForm.value.playerNames as []);
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

  get gameMode() { 
    return this.settingsForm.get('gameMode');
  }

  get numOfPlayers() { 
    return this.settingsForm.get('numOfPlayers');
  }

  get playerNames() { 
    return this.settingsForm.get('playerNames') as FormArray;
  }
}
