import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Room } from "../models/room";
import { Slot } from "../models/slot";
import { Topic } from "../models/topic";
import { SessionService } from "../session/session.service";

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

    return this.sessionService.currentSession.slots.sort((a, b) => a.time?.localeCompare(b.time));
  }

  public getTopics(slotId: string): Topic[] {
    if (this.sessionService.currentSession == null) {
      return null;
    }

    const topics = this.sessionService.currentSession.topics.filter((t) => t.slotId === slotId);
    return topics.sort((a, b) => {
      const s1 = this.getRoom(a.roomId).seats ?? 0;
      const s2 = this.getRoom(b.roomId).seats ?? 0;

      const n1 = this.getSlot(a.slotId).name;
      const n2 = this.getSlot(b.slotId).name;

      return (s1 > s2 ? -1 : 1) || n1.localeCompare(n2);
    });
  }

  public getRating(topic: Topic): number {
    return topic.ratings.reduce((a, c) => a + c.value, 0) / topic.ratings.length;
  }

  public getRoom(id: string): Room {
    return this.sessionService.currentSession.rooms.find(room => room.id === id);
  }

  public getSlot(id: string) {
    return this.sessionService.currentSession.slots.find(slot => slot.id === id);
  }

  public async ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id');
    if (id == null) {
      this.router.navigate(['/']);
    }

    await this.sessionService.get(id);
  }
}
