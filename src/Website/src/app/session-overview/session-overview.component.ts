import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SessionService } from "../session/session.service";
import { Room, Slot, Topic } from '../shared/services/api';

@Component({
  selector: 'app-session-overview',
  templateUrl: './session-overview.component.html',
  styleUrls: ['./session-overview.component.css']
})
export class SessionOverviewComponent implements OnInit {
  public get session() { return this.sessionService.currentSession || { name: '' }; }

  constructor(private sessionService: SessionService, private router: Router, private route: ActivatedRoute) { }

  public get slots(): Slot[] {
    if (this.sessionService.currentSession?.slots == null) {
      return [];
    }

    return this.sessionService.currentSession.slots.sort((a: Slot, b: Slot) => a.time?.localeCompare(b.time ?? "") ?? 0);
  }

  public getTopics(slotId: string): Topic[] {
    if (this.sessionService.currentSession == null) {
      return [];
    }

    const topics = this.sessionService.currentSession.topics.filter((t: Topic) => t.slotId === slotId);
    return topics.sort((a: Topic, b: Topic) => {
      if (a.roomId == null || a.slotId == null || b.roomId == null || b.slotId == null) {
        return 0;
      }

      const s1 = this.getRoom(a.roomId)?.seats ?? 0;
      const s2 = this.getRoom(b.roomId)?.seats ?? 0;

      const n1 = this.getSlot(a.slotId)?.name ?? "";
      const n2 = this.getSlot(b.slotId)?.name ?? "";

      return (s1 > s2 ? -1 : 1) || n1.localeCompare(n2);
    });
  }

  public getRating(topic: Topic): number {
    return topic.ratings.reduce((a, c) => a + c.value, 0) / topic.ratings.length;
  }

  public getRoom(id: string) {
    return this.sessionService.currentSession.rooms.find((room: Room) => room.id === id);
  }

  public getSlot(id: string) {
    return this.sessionService.currentSession.slots.find((slot: Slot) => slot.id === id);
  }

  public async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id == null) {
      this.router.navigate(['/']);
      return;
    }

    await this.sessionService.get(+id);
  }
}
