import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-board-bottom',
  templateUrl: './board-bottom.component.html',
  styleUrls: ['./board-bottom.component.css']
})
export class BoardBottomComponent implements OnInit {
  @Input() isCodenames: Boolean;
  @Output() nextGameEvent = new EventEmitter<string>();
  @Output() toggleSpyMasterEvent = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  nextGame(){
    this.nextGameEvent.emit();
  }

  toggleSpyMaster(){
    this.toggleSpyMasterEvent.emit();
  }

}
