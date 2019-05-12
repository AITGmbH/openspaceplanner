import * as _ from "lodash";
import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { Room } from "../models/room";
import { SessionService } from "../session/session.service";
import { Slot } from "../models/slot";
import { Topic } from "../models/topic";

@Component({
  selector: 'app-session-overview',
  templateUrl: './session-overview.component.html',
  styleUrls: ['./session-overview.component.css']
})
export class SessionOverviewComponent implements OnInit {
  public get session() { return this.sessionService.currentSession || { name: '' }; }

  constructor(private sessionService: SessionService, private router: Router, private route: ActivatedRoute) { }

  public get slots(): Slot[] {
    if (this.sessionService.currentSession == null) {
      return null;
    }

    return _.sortBy(this.sessionService.currentSession.slots, s => s.time);
  }

  public getTopics(slotId: string): Topic[] {
    if (this.sessionService.currentSession == null) {
      return null;
    }

    return _.sortBy(
        _.filter(this.sessionService.currentSession.topics, (t) => t.slotId === slotId),
        [t => this.getRoom(t.roomId).seats, t => this.getSlot(t.slotId).name], ['desc', 'asc']);
  }

  public getRating(topic: Topic): number {
    return _.meanBy(topic.ratings, r => r.value) || 0;
  }

  public getRoom(id: string): Room {
    return _.find(this.sessionService.currentSession.rooms, { id });
  }

  public getSlot(id: string) {
    return _.find(this.sessionService.currentSession.slots, { id });
  }

  public async ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id');
    if (id == null) {
      this.router.navigate(['/']);
    }

    await this.sessionService.get(id);
  }
}
