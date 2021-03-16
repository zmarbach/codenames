import { TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';

import { SequenceGameService } from './sequence-game.service';

describe('SequenceGameService', () => {
  let service: SequenceGameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule,
      ],
    });
    service = TestBed.inject(SequenceGameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
})
