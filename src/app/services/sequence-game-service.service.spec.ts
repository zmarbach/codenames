import { TestBed } from '@angular/core/testing';

import { SequenceGameServiceService } from './sequence-game-service.service';

describe('SequenceGameServiceService', () => {
  let service: SequenceGameServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SequenceGameServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
