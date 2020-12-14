import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import * as uuid from 'uuid';
import { GameService } from '../game.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  settingsForm = new FormGroup({
    gameMode: new FormControl(''),
    test: new FormControl('')
  });

  constructor(private router: Router, private gameService: GameService) { }

  ngOnInit(): void {
  }

  async submit(){
    var newGame = await this.gameService.createNewGame(this.settingsForm.value.gameMode)
    this.router.navigate(['/board/' + newGame.id]);
  }

}
