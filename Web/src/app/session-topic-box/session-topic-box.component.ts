import * as _ from "lodash";
import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild
    } from "@angular/core";
import { RatingStatistic } from "../models/ratingStatistic";
import { SessionService } from "../session/session.service";
import { Topic } from "../models/topic";

@Component({
  selector: 'app-session-topic-box',
  templateUrl: './session-topic-box.component.html',
  styleUrls: ['session-topic-box.component.css']
})
export class SessionTopicBoxComponent implements OnInit {
  public showAttendeesInput: boolean;

  @Input()
  public topic: Topic;

  @Input()
  public showAdditionalInformation: boolean;

  @Input()
  public enableDrag = true;

  @Output("edit")
  public edit = new EventEmitter<Event>();

  public errors: string[];

  @ViewChild("ratingTooltip") ratingTooltip: ElementRef;

  @ViewChild("ratingElement") ratingElement: ElementRef;

  @ViewChild("errorTooltip") errorTooltip: ElementRef;

  @ViewChild("errorElement") errorElement: ElementRef;

  @ViewChild("topicAttendees") topicAttendees: ElementRef;

  public get isFavorite() {
    return this.sessionService.sessionOptions != null
      && this.sessionService.sessionOptions.topicsFavorite != null
      && this.sessionService.sessionOptions.topicsFavorite[this.topic.id] || false;
  }

  public get hasComments() {
    return this.topic != null && this.topic.comments != null && this.topic.comments.length > 0;
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
      this.hasRoomCapabilitiesConflict()
    ];

    return _.some(hasErrors);
  }

  public get slot() {
    if (this.session == null) {
      return null;
    }

    return _.find(this.session.slots, { id: this.topic.slotId });
  }

  public get room() {
    if (this.session == null) {
      return null;
    }

    return _.find(this.session.rooms, { id: this.topic.roomId });
  }

  constructor(private sessionService: SessionService) { }

  public ngOnInit() {
    tippy(this.ratingElement.nativeElement, { content: this.ratingTooltip.nativeElement, interactive: true });
    tippy(this.errorElement.nativeElement, { content: this.errorTooltip.nativeElement, interactive: true });
  }

  public favorite() {
    this.sessionService.sessionOptions.topicsFavorite[this.topic.id] = !this.isFavorite;
    this.sessionService.saveSessionOptions();
  }

  public hasRoomSeatsConflict() {
    if (this.topic == null || this.topic.slotId == null || this.topic.roomId == null) {
      return false;
    }

    const room = _.find(this.sessionService.currentSession.rooms, { id: this.topic.roomId });
    if (room == null) {
      return false;
    }

    const hasError = room.seats < this.topic.attendees.length;
    if (hasError) {
      this.errors.push("Too many attendees for the given room size.");
    }

    return hasError;
  }

  public hasSameOwnerSlotConflict() {
    if (this.topic == null || this.topic.slotId == null || this.topic.roomId == null || this.topic.owner == null) {
      return false;
    }

    const topics = _.filter(this.sessionService.currentSession.topics, { slotId: this.topic.slotId, owner: this.topic.owner });
    if (topics == null) {
      return false;
    }

    const hasError = topics.length > 1;
    if (hasError) {
      this.errors.push("Owner with two or more topics in the same slot.");
    }

    return hasError;
  }

  public hasRoomCapabilitiesConflict() {
    if (this.topic == null || this.topic.slotId == null || this.topic.roomId == null || this.topic.owner == null) {
      return false;
    }

    if (this.topic.demands == null || this.topic.demands.length == 0) {
      return false;
    }

    const room = _.find(this.sessionService.currentSession.rooms, { id: this.topic.roomId });
    if (room == null) {
      return false;
    }

    const hasError = !_.every(this.topic.demands, d => room.capabilities.findIndex(c => c == d) >= 0);
    if (hasError) {
      this.errors.push("The room does not have the capabilities required by the topic.");
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

  public ratingChange(ratingText: string) {
    const rating = parseInt(ratingText, 10);

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

  public expandDescription(content, description) {
    description.expanded = true;
    content.expanded = true;
  }

  public collapseDescription(content, description) {
    description.expanded = false;
    content.expanded = false;
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
