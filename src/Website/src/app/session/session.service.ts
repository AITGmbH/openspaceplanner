import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Observable, Subject, lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { SessionOptions } from '../models/sessionOptions';
import { getRandomId } from '../shared/common';
import {
  Attendance,
  Feedback,
  Rating,
  Room,
  Session,
  SessionRoomsService,
  SessionSlotsService,
  SessionTopicsAttendanceService,
  SessionTopicsFeedbackService,
  SessionTopicsRatingService,
  SessionTopicsService,
  SessionTopicsVotesService,
  SessionsService,
  Slot,
  Topic,
} from '../shared/services/api';

@Injectable()
export class SessionService {
  private _hubConnection?: HubConnection;
  private _sessionOptions: SessionOptions | null = null;

  public sessionDeleted = new Subject();
  public sessionChanged = new Subject();
  public currentSession: Session = {} as Session;

  public get sessionOptions() {
    if (this._sessionOptions != null) {
      return this._sessionOptions;
    }

    try {
      this._sessionOptions = JSON.parse(localStorage.getItem(`sessions${this.currentSession.id}`) ?? '') || new SessionOptions();
      this._sessionOptions = Object.assign(new SessionOptions(), this._sessionOptions);

      this.syncSessionOptions();

      this.saveSessionOptions();
    } catch {
      this._sessionOptions = new SessionOptions();
      this.saveSessionOptions();
    }

    return this._sessionOptions;
  }

  constructor(
    private readonly sessionsService: SessionsService,
    private readonly sessionTopicsService: SessionTopicsService,
    private readonly sessionSlotsService: SessionSlotsService,
    private readonly sessionRoomsService: SessionRoomsService,
    private readonly sessionTopicsAttendanceService: SessionTopicsAttendanceService,
    private readonly sessionTopicsRatingService: SessionTopicsRatingService,
    private readonly sessionTopicsFeedbackService: SessionTopicsFeedbackService,
    private readonly sessionTopicsVotesService: SessionTopicsVotesService,
    private readonly hubConnectionBuilder: HubConnectionBuilder,
  ) {}

  public getSortedSlots(slots: Slot[]) {
    return slots.sort((a, b) => a.time?.localeCompare(b.time ?? '') || a.name.localeCompare(b.name));
  }

  public getSortedRooms(rooms: Room[]) {
    return rooms.sort((a, b) => ((a.seats || 0) > (b.seats || 0) ? -1 : 1 || a.name.localeCompare(b.name)));
  }

  public getSlotsOfTopic(slots: Slot[], topic: Topic) {
    let slot = slots.find((slot) => slot.id === topic.slotId);
    if (slot == null) {
      return [];
    }

    const slotIndex = slots.indexOf(slot);
    const foundSlots = [slot];

    if (topic.slots > 1) {
      for (let index = 1; index < topic.slots; index++) {
        slot = slots[slotIndex + index];
        foundSlots.push(slot);
      }
    }

    return foundSlots;
  }

  public saveSessionOptions() {
    try {
      localStorage.setItem(`sessions${this.currentSession.id}`, JSON.stringify(this._sessionOptions));
    } catch {
      // do nothing
    }
  }

  public async update(session: Session = <Session>{}): Promise<Session> {
    const request = session.id != null ? this.sessionsService.updateSession(session.id, session) : this.sessionsService.createSession();

    return await lastValueFrom(request);
  }

  public async delete(id: number): Promise<void> {
    await lastValueFrom(this.sessionsService.deleteSession(id));
  }

  public getLastSessions(): Observable<Session[]> {
    return this.sessionsService.getLastSessions();
  }

  public getAll(): Observable<Session[]> {
    return this.sessionsService.getSessions();
  }

  public async get(sessionId: number): Promise<Session> {
    const obj = await lastValueFrom(this.sessionsService.getSessionById(sessionId));

    this.currentSession = obj as Session;

    if (this.currentSession != null) {
      this.registerHub();
    }

    return this.currentSession;
  }

  public async updateTopic(topic: Topic): Promise<Topic> {
    const request = topic.id != null ? this.sessionTopicsService.updateTopic(this.currentSession.id, topic.id, topic) : this.sessionTopicsService.createTopic(this.currentSession.id, topic);

    const obj = await lastValueFrom(request);
    return this.updateInternal(this.currentSession.topics, obj as Topic);
  }

  public async updateSlot(slot: Slot): Promise<Slot> {
    const request = slot.id != null ? this.sessionSlotsService.updateSlot(this.currentSession.id, slot.id, slot) : this.sessionSlotsService.createSlot(this.currentSession.id, slot);

    const obj = await lastValueFrom(request);
    return this.updateInternal(this.currentSession.slots, obj as Slot);
  }

  public async updateRoom(room: Room): Promise<Room> {
    const request = room.id != null ? this.sessionRoomsService.updateRoom(this.currentSession.id, room.id, room) : this.sessionRoomsService.createRoom(this.currentSession.id, room);

    const obj = await lastValueFrom(request);
    return this.updateInternal(this.currentSession.rooms, obj as Room);
  }

  public async updateTopicAttendance(topicId: string, value: boolean): Promise<Attendance> {
    const topicAttendance = this.sessionOptions.topicsAttending[topicId];
    const id = topicAttendance != null && !this.currentSession.freeForAll ? topicAttendance.id : getRandomId();
    const attendance = <Attendance>{ id, value };

    this.sessionOptions.topicsAttending[topicId] = { id, value: value };
    this.saveSessionOptions();

    const request =
      attendance.id != null
        ? this.sessionTopicsAttendanceService.updateTopicAttendance(this.currentSession.id, topicId, attendance.id, attendance)
        : this.sessionTopicsAttendanceService.createTopicAttendance(this.currentSession.id, topicId, [attendance]);

    await lastValueFrom(request);
    return this.updateInternal(this.getTopic(topicId)?.attendees ?? [], attendance);
  }

  public async updateTopicAttendances(topicId: string, value: number): Promise<Attendance[] | null> {
    if (!this.currentSession.freeForAll) {
      return null;
    }

    const attendances: Attendance[] = [];
    for (let i = 0; i < value; i++) {
      attendances.push(<Attendance>{ id: getRandomId(), value: true });
    }

    const request = this.sessionTopicsAttendanceService.createTopicAttendance(this.currentSession.id, topicId, attendances);
    await lastValueFrom(request);

    const topic = this.getTopic(topicId);
    if (topic != null) {
      topic.attendees = attendances;
    }

    return attendances;
  }

  public async updateTopicRating(topicId: string, value: number): Promise<Rating> {
    const topicRating = this.sessionOptions.topicsRating[topicId];

    const request =
      topicRating != null && !this.currentSession.freeForAll
        ? this.sessionTopicsRatingService.updateTopicRating(this.currentSession.id, topicId, topicRating.id, { id: topicRating.id, value })
        : this.sessionTopicsRatingService.createTopicRating(this.currentSession.id, topicId, { value });

    const rating = await lastValueFrom(request);

    if (!this.currentSession.freeForAll) {
      this.sessionOptions.topicsRating[topicId] = rating;
      this.saveSessionOptions();
    }

    return this.updateInternal(this.getTopic(topicId)?.ratings ?? [], rating);
  }

  public async updateTopicVote(topicId: string) {
    const voteId = getRandomId();
    const request = this.sessionTopicsVotesService.createTopicVote(this.currentSession.id, topicId, voteId);
    await lastValueFrom(request);

    if (this.sessionOptions.topicsVote[topicId] == null) {
      this.sessionOptions.topicsVote[topicId] = [];
    }
    this.sessionOptions.topicsVote[topicId].push(voteId);
    this.saveSessionOptions();

    this.sessionHasChanged();
  }

  public async updateTopicFeedback(topicId: string, value: string): Promise<Feedback> {
    const request = this.sessionTopicsFeedbackService.createTopicFeedback(this.currentSession.id, topicId, { value });

    const feedback = await lastValueFrom(request);
    return this.updateInternal(this.getTopic(topicId)?.feedback ?? [], feedback);
  }

  public async deleteTopic(id: string): Promise<void> {
    await lastValueFrom(this.sessionTopicsService.deleteTopic(this.currentSession.id, id));
    return this.deleteInternal(this.currentSession.topics, id);
  }

  public async deleteSlot(id: string): Promise<void> {
    await lastValueFrom(this.sessionSlotsService.deleteSlot(this.currentSession.id, id));
    return this.deleteInternal(this.currentSession.slots, id);
  }

  public async deleteRoom(id: string): Promise<void> {
    await lastValueFrom(this.sessionRoomsService.deleteRoom(this.currentSession.id, id));
    return this.deleteInternal(this.currentSession.rooms, id);
  }

  public async deleteTopicAttendance(topicId: string): Promise<void> {
    const topic = this.currentSession.topics.find((topic) => topic.id === topicId);
    if (topic == null || topic.attendees.length <= 0) {
      return;
    }

    let attendanceId: string;
    if (this.currentSession.freeForAll) {
      // if it's free for all, we just delete a random attendance
      attendanceId = topic.attendees[0].id;
    } else {
      const topicAttendance = this.sessionOptions.topicsAttending[topicId];
      attendanceId = topicAttendance.id;
    }

    delete this.sessionOptions.topicsRating[topicId];

    await lastValueFrom(this.sessionTopicsAttendanceService.deleteTopicAttendance(this.currentSession.id, topicId, attendanceId));
    return this.deleteInternal(this.getTopic(topicId)?.attendees ?? [], attendanceId);
  }

  public async deleteTopicVote(topicId: string) {
    if (this.sessionOptions.topicsVote[topicId] == null) {
      return;
    }

    const voteId = this.sessionOptions.topicsVote[topicId][0];
    await lastValueFrom(this.sessionTopicsVotesService.deleteTopicVote(this.currentSession.id, topicId, voteId));

    this.sessionOptions.topicsVote[topicId] = this.sessionOptions.topicsVote[topicId].filter((v) => v !== voteId) ?? [];
    this.saveSessionOptions();

    this.sessionHasChanged();
  }

  public async deleteTopicFeedback(topicId: string, feedbackId: string): Promise<void> {
    await lastValueFrom(this.sessionTopicsFeedbackService.deleteTopicFeedback(this.currentSession.id, topicId, feedbackId));
    return this.deleteInternal(this.getTopic(topicId)?.feedback ?? [], feedbackId);
  }

  public async resetRatings() {
    await lastValueFrom(this.sessionsService.deleteSessionRatings(this.currentSession.id));
  }

  public async resetAttendance() {
    await lastValueFrom(this.sessionsService.deleteSessionAttendances(this.currentSession.id));
  }

  public async resetTopicVotes() {
    await lastValueFrom(this.sessionsService.deleteSessionVotes(this.currentSession.id));
  }

  public async deleteTopicRating(topicId: string): Promise<void> {
    const topic = this.currentSession.topics.find((topic) => topic.id === topicId);
    if (topic == null || topic.ratings.length <= 0) {
      return;
    }

    let ratingId: string;
    if (this.currentSession.freeForAll) {
      // if it's free for all, we just delete a random rating
      ratingId = topic.ratings[0].id;
    } else {
      const topicRating = this.sessionOptions.topicsRating[topicId];
      ratingId = topicRating.id;
    }

    delete this.sessionOptions.topicsRating[topicId];

    await lastValueFrom(this.sessionTopicsRatingService.deleteTopicRating(this.currentSession.id, topicId, ratingId));
    return this.deleteInternal(this.getTopic(topicId)?.ratings ?? [], ratingId);
  }

  public getTopicRating(topicId: string) {
    if (this.currentSession.freeForAll) {
      return 0;
    }

    const topic = this.currentSession.topics.find((topic) => topic.id === topicId);
    if (topic == null) {
      return false;
    }

    const topicRating = this.sessionOptions.topicsRating[topicId];
    const sessionHasTopicRating = topicRating != null && topic.ratings.some((t) => t.id === topicRating.id);
    return sessionHasTopicRating ? topicRating.value : 0;
  }

  public getTopicAttendance(topicId: string) {
    if (this.currentSession.freeForAll) {
      return false;
    }

    const topic = this.currentSession.topics.find((topic) => topic.id === topicId);
    if (topic == null) {
      return false;
    }

    const topicAttendance = this.sessionOptions.topicsAttending[topicId];
    const sessionHasTopicAttendance = topicAttendance != null && topic.attendees.some((t) => t.id === topicAttendance.id);
    return sessionHasTopicAttendance ? topicAttendance.value : false;
  }

  private updateInternal<T extends { id: string | number }>(arr: T[], obj: T) {
    const index = arr.findIndex((a) => a.id === obj.id);
    if (index >= 0) {
      arr[index] = obj;
    } else {
      arr.push(obj);
    }

    this.sessionHasChanged();

    return obj;
  }

  private deleteInternal<T extends { id: string | number }>(obj: T[], id: string) {
    const index = obj.findIndex((o) => o.id === id);
    if (index >= 0) {
      obj.splice(index, 1);
    }

    this.sessionHasChanged();
  }

  private getTopic(topicId: string) {
    return this.currentSession.topics.find((topic) => topic.id === topicId);
  }

  private registerHub() {
    this._hubConnection = this.hubConnectionBuilder.withUrl(`${environment.apiUrl}/hubs/sessions?sessionId=${this.currentSession.id}`).build();

    this._hubConnection.on('updateSession', (session: Session) => (this.currentSession = session));
    this._hubConnection.on('updateTopic', (topic: Topic) => this.updateInternal(this.currentSession.topics, topic));
    this._hubConnection.on('updateRoom', (room: Room) => this.updateInternal(this.currentSession.rooms, room));
    this._hubConnection.on('updateSlot', (slot: Slot) => this.updateInternal(this.currentSession.slots, slot));
    this._hubConnection.on('deleteTopic', (id: string) => this.deleteInternal(this.currentSession.topics, id));
    this._hubConnection.on('deleteRoom', (id: string) => this.deleteInternal(this.currentSession.rooms, id));
    this._hubConnection.on('deleteSlot', (id: string) => this.deleteInternal(this.currentSession.slots, id));
    this._hubConnection.on('deleteSession', () => this.sessionDeleted.next(null));

    this._hubConnection.start().catch(() => {
      console.warn('Error while establishing connection');
    });
  }

  private sessionHasChanged() {
    this.syncSessionOptions();

    this.sessionChanged.next(this.currentSession);
  }

  private syncSessionOptions() {
    if (this._sessionOptions == null) {
      return;
    }

    for (const topic of this.currentSession.topics) {
      const topicId = topic.id;

      // check if the topic attendance was reset but is still remaining in the browser storage
      this.syncSessionOptionsTopicAttendance(topicId, topic);

      // check if the topic rating was reset but is still remaining in the browser storage
      this.syncSessionOptionsTopicRating(topicId, topic);

      // check if the topic vote was reset but is still remaining in the browser storage
      this.syncSessionOptionsTopicVotes(topicId, topic);
    }

    this.syncSessionOptionsVotes();
  }

  private syncSessionOptionsVotes() {
    if (this._sessionOptions == null) {
      return;
    }

    for (const topicId of Object.keys(this._sessionOptions.topicsVote)) {
      const topicExists = this.currentSession.topics.find((t) => t.id === topicId);
      if (!topicExists) {
        // if we voted for a topic that does no longer exist, we reset the votes for the user
        delete this._sessionOptions.topicsVote[topicId];
      }
    }
  }

  private syncSessionOptionsTopicVotes(topicId: string, topic: Topic) {
    if (this._sessionOptions == null) {
      return;
    }

    const topicVotes = this._sessionOptions.topicsVote[topicId];
    if (topicVotes != null && topicVotes.length > 0) {
      this._sessionOptions.topicsVote[topicId] = this._sessionOptions.topicsVote[topicId].filter((voteId) => topic.votes.includes(voteId));
    }
  }

  private syncSessionOptionsTopicRating(topicId: string, topic: Topic) {
    if (this._sessionOptions == null) {
      return;
    }

    const topicRating = this._sessionOptions.topicsRating[topicId];
    if (topicRating != null) {
      const topicRatingExists = topic.ratings.findIndex((a) => a.id === topicRating.id) >= 0;
      if (!topicRatingExists) {
        delete this._sessionOptions.topicsRating[topicId];
      }
    }
  }

  private syncSessionOptionsTopicAttendance(topicId: string, topic: Topic) {
    if (this._sessionOptions == null) {
      return;
    }

    const topicAttendance = this._sessionOptions.topicsAttending[topicId];
    if (topicAttendance != null) {
      const topicAttendanceExists = topic.attendees.findIndex((a) => a.id === topicAttendance.id) >= 0;
      if (!topicAttendanceExists) {
        delete this._sessionOptions.topicsAttending[topicId];
      }
    }
  }
}
