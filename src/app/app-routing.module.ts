import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BoardComponent } from './boards/board/board.component';
import { CodenamesBoardComponent } from './boards/codenames-board/codenames-board.component';
import { SequenceBoardComponent } from './boards/sequence-board/sequence-board.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'board/sequence/:id', component: SequenceBoardComponent},
  {path: 'board/codenames/:id', component: CodenamesBoardComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
