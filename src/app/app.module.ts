import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { HomeComponent } from './home/home.component';
import { BoardComponent } from './boards/board/board.component';
import { ReactiveFormsModule } from '@angular/forms';
import { GameService } from './services/game.service';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabase, AngularFireDatabaseModule } from '@angular/fire/database';
import { PlayerNameDialogComponent } from './player-name-dialog/player-name-dialog.component';
import { DataService } from './services/data.service';
import { Router } from '@angular/router';
import { SequenceGameService } from './services/sequence-game.service';
import { CodenamesGameService } from './services/codenames-game.service';
import { SequenceBoardComponent } from './boards/sequence-board/sequence-board.component';
import { CodenamesBoardComponent } from './boards/codenames-board/codenames-board.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    BoardComponent,
    PlayerNameDialogComponent,
    SequenceBoardComponent,
    CodenamesBoardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatSelectModule,
    MatInputModule,
    MatDialogModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
  ],
  providers: [SequenceGameService, CodenamesGameService],
  bootstrap: [AppComponent]
})
export class AppModule { }
