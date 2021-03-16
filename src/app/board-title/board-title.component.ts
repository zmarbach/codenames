import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-board-title',
  templateUrl: './board-title.component.html',
  styleUrls: ['./board-title.component.css']
})
export class BoardTitleComponent implements OnInit {
  @Input() title: String;
  @Output() deleteGameEvent = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  deleteGameFromDb() {
    this.deleteGameEvent.emit();
  }

}
