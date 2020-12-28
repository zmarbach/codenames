import { TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';

import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule,
      ],
    });
    service = TestBed.inject(DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAllWords should return list of words', async function() {
    const result = await service.getAllWords();
    expect(result).not.toBeNull();
    expect(result[0]).not.toContain('.jpg');
  });

  it('getAllImages should return list of imgPaths', async function() {
    const result = await service.getAllImages();
    expect(result).not.toBeNull();
    expect(result[0]).toContain('.jpg');
  });

  it('getRandomItems should return 25 items from given wordList', async function() {
    let allWords = await service.getAllWords();

    // store variables to test against before shuffle in getRandomItems
    let allWordsIndex0 = allWords[0];
    let allWordsIndex1 = allWords[1];
    let allWordsIndex2 = allWords[2];

    let randomList = service.getRandomItems(allWords, 25);

    // Not perfect and may get some false test failures, but decent way to make sure the items are random
    expect(randomList[0]).not.toEqual(allWordsIndex0);
    expect(randomList[1]).not.toEqual(allWordsIndex1);
    expect(randomList[2]).not.toEqual(allWordsIndex2);
    expect(randomList.length).toEqual(25);

  });
});
