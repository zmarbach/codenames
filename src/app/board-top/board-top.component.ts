import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Player } from '../models/player';

@Component({
  selector: 'app-board-top',
  templateUrl: './board-top.component.html',
  styleUrls: ['./board-top.component.css']
})
export class BoardTopComponent implements OnInit {
  @Input() redScore: number;
  @Input() blueScore: number;
  @Input() isRedTurn: Boolean;
  @Input() isBlueTurn: Boolean;
  @Input() currentPlayer: Player;
  @Output() endTurnEvent = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  endTurn(){
    this.endTurnEvent.emit();
  }

}
