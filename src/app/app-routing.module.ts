import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SessionComponent } from './session/session.component';
import { CreateSessionComponent } from './create-session/create-session.component';
import { SessionOverviewComponent } from './session-overview/session-overview.component';

const routes: Routes = [
  { path: 'session/:id',  component: SessionComponent },
  { path: 'session/:id/overview',  component: SessionOverviewComponent },
  { path: '**',  component: CreateSessionComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
