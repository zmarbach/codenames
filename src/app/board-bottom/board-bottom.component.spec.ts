import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardBottomComponent } from './board-bottom.component';

describe('BoardBottomComponent', () => {
  let component: BoardBottomComponent;
  let fixture: ComponentFixture<BoardBottomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoardBottomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardBottomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
