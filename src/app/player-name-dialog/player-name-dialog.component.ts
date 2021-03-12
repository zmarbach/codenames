import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Player } from '../models/player';

@Component({
  selector: 'app-player-name-dialog',
  templateUrl: './player-name-dialog.component.html',
  styleUrls: ['./player-name-dialog.component.css']
})
export class PlayerNameDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<PlayerNameDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: Array<Player>) {}

  nameForm: FormControl;
  selectedPlayerId: number;

  ngOnInit(): void {
    this.nameForm = new FormControl("", Validators.required);
    
    this.nameForm.valueChanges.subscribe(player => this.selectedPlayerId = player.id);
  }
}
