import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray} from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../game.service';
import { GameMode } from '../game-mode.enum';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  isSequence = false;
  settingsForm: FormGroup;
  GameMode = GameMode;
  numOfPlayerOptions = [
    { value: '2', displayValue: 2 },
    { value: '4', displayValue: 4 },
    { value: '6', displayValue: 6 },
    { value: '8', displayValue: 8 },
    { value: '10', displayValue: 10 },
    { value: '12', displayValue: 12 },
  ];

  constructor(private router: Router, private gameService: GameService) {}

  ngOnInit(): void {
    this.settingsForm = new FormGroup({
      gameMode: new FormControl(GameMode.CODENAMES_WORDS, Validators.required),
      numOfPlayers: new FormControl(''),
      redPlayerNames: new FormArray([]),
      bluePlayerNames: new FormArray([]),
    });

    this.settingsForm
      .get('gameMode')
      .valueChanges.subscribe((mode) => this.updateRequiredStatus(mode));
    this.settingsForm
      .get('numOfPlayers')
      .valueChanges.subscribe((num) => this.updateNumOfPlayers(num));
  }

  updateRequiredStatus(mode: GameMode) {
    console.log(mode);
    if (mode === GameMode.SEQUENCE) {
      this.numOfPlayers.enable();
      this.redPlayerNames.controls.forEach((control) => control.enable);
      this.bluePlayerNames.controls.forEach((control) => control.enable);
      this.numOfPlayers.setValidators(Validators.required);
      this.redPlayerNames.controls.forEach((control) =>
        control.setValidators(Validators.required)
      );
      this.bluePlayerNames.controls.forEach((control) =>
        control.setValidators(Validators.required)
      );
    } else {
      this.numOfPlayers.disable();
      this.redPlayerNames.controls.forEach((control) => control.disable());
      this.bluePlayerNames.controls.forEach((control) => control.disable());
      this.numOfPlayers.clearValidators();
      this.redPlayerNames.controls.forEach((control) =>
        control.clearValidators()
      );
      this.bluePlayerNames.controls.forEach((control) =>
        control.clearValidators()
      );
    }
  }

  updateNumOfPlayers(numOfPlayerOption) {
    let num = numOfPlayerOption.value;
    if (this.redPlayerNames.length !== 0) {
      this.redPlayerNames.clear();
    }
    if (this.bluePlayerNames.length !== 0) {
      this.bluePlayerNames.clear();
    }
    for (let i = 0; i < num; i++) {
      // Check odd/even to add half red and half blue
      if (i % 2 === 0) {
        this.redPlayerNames.push(new FormControl('', Validators.required));
      } else {
        this.bluePlayerNames.push(new FormControl('', Validators.required));
      }
    }
  }

  async submit() {
    console.log('Creating new game...');
    const newGame = await this.gameService.createNewGame(
      this.settingsForm.value.gameMode as GameMode,
      this.settingsForm.value.redPlayerNames as [],
      this.settingsForm.value.bluePlayerNames as []
    );
    const newGameFirebaseId = this.gameService.addGameToDb(newGame);

    console.log('New game created with this id ---> ' + newGameFirebaseId);
    this.router.navigate(['/board/' + newGameFirebaseId]);
  }

  showSequence() {
    this.isSequence = true;
  }

  hideSequence() {
    this.isSequence = false;
  }

  get gameMode() {
    return this.settingsForm.get('gameMode');
  }

  get numOfPlayers() {
    return this.settingsForm.get('numOfPlayers');
  }

  get redPlayerNames() {
    return this.settingsForm.get('redPlayerNames') as FormArray;
  }

  get bluePlayerNames() {
    return this.settingsForm.get('bluePlayerNames') as FormArray;
  }
}
