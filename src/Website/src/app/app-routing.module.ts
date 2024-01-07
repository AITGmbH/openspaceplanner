import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CreateSessionComponent } from "./create-session/create-session.component";
import { SessionOverviewComponent } from "./session-overview/session-overview.component";
import { SessionComponent } from "./session/session.component";

const routes: Routes = [
  { path: "sessions/:id", component: SessionComponent },
  { path: "sessions/:id/overview", component: SessionOverviewComponent },
  { path: "session/:id", redirectTo: "sessions/:id" },
  { path: "session/:id/overview", redirectTo: "sessions/:id/overview" },
  { path: "**", component: CreateSessionComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
