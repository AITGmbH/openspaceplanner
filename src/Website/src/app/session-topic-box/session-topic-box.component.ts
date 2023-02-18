import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from "@angular/core";
import tippy from "tippy.js";
import { RatingStatistic } from '../models/ratingStatistic';
import { SessionService } from "../session/session.service";
import { Room, Slot, Topic } from '../shared/services/api';

@Component({
  selector: "app-session-topic-box",
  templateUrl: "./session-topic-box.component.html",
  styleUrls: ["session-topic-box.component.css"],
})
export class SessionTopicBoxComponent implements OnInit {
  public showAttendeesInput: boolean = false;

  @Input()
  public topic!: Topic;

  @Input()
  public showAdditionalInformation: boolean = false;

  @Input()
  public enableDrag = true;

  @Output()
  public edit = new EventEmitter<{ event: Event, topic: Topic }>();

  public errors: string[] = [];

  @ViewChild("ratingTooltip", { static: true }) ratingTooltip!: ElementRef;

  @ViewChild("ratingElement", { static: true }) ratingElement!: ElementRef;

  @ViewChild("errorTooltip", { static: true }) errorTooltip!: ElementRef;

  @ViewChild("errorElement", { static: true }) errorElement!: ElementRef;

  @ViewChild("topicAttendees", { static: false }) topicAttendees!: ElementRef;

  public get isFavorite() {
    return this.sessionService.sessionOptions?.topicsFavorite[this.topic.id] || false;
  }

  public get hasComments() {
    return (
      this.topic != null &&
      this.topic.feedback != null &&
      this.topic.feedback.length > 0
    );
  }

  public get rating() {
    return new RatingStatistic(this.topic.ratings);
  }

  public get session() {
    return this.sessionService.currentSession;
  }

  public get errorText() {
    if (this.errors == null || this.errors.length === 0) {
      return "";
    }

    return this.errors.join(" ");
  }

  public get hasError() {
    this.errors = [];

    const hasErrors = [
      this.hasSameOwnerSlotConflict(),
      this.hasRoomSeatsConflict(),
      this.hasRoomCapabilitiesConflict(),
    ];

    return hasErrors.some(hasError => hasError);
  }

  public get slot() {
    if (this.session == null) {
      return null;
    }

    return this.session.slots.find((slot: Slot) => slot.id === this.topic.slotId);
  }

  public get slotEnd() {
    if (this.session == null) {
      return null;
    }

    if (this.topic.slots <= 1) {
      return null;
    }

    const slots = this.sessionService.getSortedSlots(this.session.slots);
    const slotIndex = slots.findIndex((slot: Slot) => slot.id === this.topic.slotId);
    return slots[slotIndex + this.topic.slots - 1];
  }

  public get room() {
    if (this.session == null) {
      return null;
    }

    return this.session.rooms.find((room: Room) => room.id === this.topic.roomId);
  }

  constructor(private sessionService: SessionService) { }

  public ngOnInit() {
    tippy(this.ratingElement.nativeElement, {
      content: this.ratingTooltip.nativeElement,
      interactive: true,
      allowHTML: true,
      appendTo: () => document.body
    });

    tippy(this.errorElement.nativeElement, {
      content: this.errorTooltip.nativeElement,
      interactive: true,
      allowHTML: true,
      appendTo: () => document.body
    });
  }

  public favorite() {
    this.sessionService.sessionOptions.topicsFavorite[this.topic.id] = !this.isFavorite;
    this.sessionService.saveSessionOptions();
  }

  public hasRoomSeatsConflict() {
    if (
      this.topic == null ||
      this.topic.slotId == null ||
      this.topic.roomId == null
    ) {
      return false;
    }

    const room = this.sessionService.currentSession.rooms.find((room: Room) => room.id === this.topic.roomId);
    if (room == null) {
      return false;
    }

    const seats = room.seats ?? 0;
    const hasError = seats < this.topic.attendees.length;
    if (hasError) {
      this.errors.push("Too many attendees for the given room size.");
    }

    return hasError;
  }

  public hasSameOwnerSlotConflict() {
    if (
      this.topic?.slotId == null ||
      this.topic.roomId == null ||
      this.topic.owner == null
    ) {
      return false;
    }

    const slots = this.sessionService.getSortedSlots(this.sessionService.currentSession.slots);

    const slotsOfCurrentTopic = this.sessionService.getSlotsOfTopic(slots, this.topic);

    const slotsOfTopicsWithSameOwner =
      this.sessionService.currentSession.topics.filter((topic: Topic) => topic.owner != null && topic.id !== this.topic.id && topic.owner === this.topic.owner)
        .reduce((a: Slot[], topic: Topic) => [...a, ...this.sessionService.getSlotsOfTopic(slots, topic)], []);

    const hasError = slotsOfCurrentTopic.some(slot => slotsOfTopicsWithSameOwner.includes(slot));
    if (hasError) {
      this.errors.push("Owner with two or more topics in the same slot.");
    }

    return hasError;
  }

  public hasRoomCapabilitiesConflict() {
    if (
      this.topic == null ||
      this.topic.slotId == null ||
      this.topic.roomId == null
    ) {
      return false;
    }

    if (this.topic.demands == null || this.topic.demands.length == 0) {
      return false;
    }

    const room = this.sessionService.currentSession.rooms.find((room: Room) => room.id === this.topic.roomId);
    if (room == null) {
      return false;
    }

    const hasError = !this.topic.demands.every(
      (d) => room.capabilities.findIndex((c: string) => c == d) >= 0
    );
    if (hasError) {
      this.errors.push(
        "The room does not have the capabilities required by the topic."
      );
    }

    return hasError;
  }

  public isAttendee() {
    return this.sessionService.getTopicAttendance(this.topic.id);
  }

  public increaseAttendees() {
    this.sessionService.updateTopicAttendance(this.topic.id, true);
  }

  public decreaseAttendees() {
    this.sessionService.deleteTopicAttendance(this.topic.id);
  }

  public ratingChange(rating: number) {
    if (this.getRating() === rating) {
      // voting for the same is equal to deleting your vote
      this.sessionService.deleteTopicRating(this.topic.id);
    } else {
      this.sessionService.updateTopicRating(this.topic.id, rating);
    }
  }

  public getRating() {
    return this.sessionService.getTopicRating(this.topic.id);
  }

  public expandDescription(content: HTMLElement, description: HTMLElement) {
    description.dataset.expanded = "true";
    content.dataset.expanded = "true";
  }

  public collapseDescription(content: HTMLElement, description: HTMLElement) {
    description.dataset.expanded = "false";
    content.dataset.expanded = "false";
  }

  public updateAttendees(attendeesText: string) {
    if (!this.showAttendeesInput) {
      return;
    }

    const attendees = parseInt(attendeesText, 10);
    this.showAttendeesInput = false;

    if (this.topic.attendees.length === attendees) {
      return;
    }

    this.sessionService.updateTopicAttendances(this.topic.id, attendees);
  }

  public toggleAttendeesInput() {
    this.showAttendeesInput = true;
    setTimeout(() => this.topicAttendees.nativeElement.focus());
  }
}
