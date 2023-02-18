import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { SessionComponent } from "./session/session.component";
import { CreateSessionComponent } from "./create-session/create-session.component";
import { SessionOverviewComponent } from "./session-overview/session-overview.component";

const routes: Routes = [
  { path: "sessions/:id",  component: SessionComponent },
  { path: "sessions/:id/overview",  component: SessionOverviewComponent },
  { path: "session/:id", redirectTo: "sessions/:id" },
  { path: "session/:id/overview", redirectTo: "sessions/:id/overview" },
  { path: "**",  component: CreateSessionComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
