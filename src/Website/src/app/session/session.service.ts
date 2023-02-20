import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { lastValueFrom, Observable, Subject } from "rxjs";
import { environment } from '../../environments/environment';
import { SessionOptions } from "../models/sessionOptions";
import { getRandomId } from "../shared/common";
import { Attendance, Feedback, Rating, Room, Session, Slot, Topic } from '../shared/services/api';

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
      this._sessionOptions = JSON.parse(localStorage.getItem(`sessions${this.currentSession.id}`) ?? "") || new SessionOptions();
      this._sessionOptions = Object.assign(new SessionOptions(), this._sessionOptions);
      this.saveSessionOptions();
    } catch {
      this._sessionOptions = new SessionOptions();
      this.saveSessionOptions();
    }

    return this._sessionOptions;
  }

  constructor(private http: HttpClient) { }

  public getSortedSlots(slots: Slot[]) {
    return slots.sort((a, b) => a.time?.localeCompare(b.time ?? "") || a.name.localeCompare(b.name));
  }

  public getSortedRooms(rooms: Room[]) {
    return rooms.sort((a, b) => (a.seats || 0) > (b.seats || 0) ? -1 : 1 || a.name.localeCompare(b.name));
  }

  public getSlotsOfTopic(slots: Slot[], topic: Topic) {
    let slot = slots.find(slot => slot.id === topic.slotId);
    if (slot == null) {
      return [];
    }

    let slotIndex = slots.indexOf(slot);
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
    } catch { }
  }

  public async update(session: Session = <Session>{}): Promise<Session> {
    const request = session.id != null
      ? this.http.put<Session>(`${environment.apiUrl}/api/sessions/${session.id}`, session)
      : this.http.post<Session>(`${environment.apiUrl}/api/sessions`, session);

    return await lastValueFrom(request);
  }

  public async delete(id: number): Promise<void> {
    await lastValueFrom(this.http.delete<void>(`${environment.apiUrl}/api/sessions/${id}`));
  }

  public getLastSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${environment.apiUrl}/api/sessions/last`);
  }

  public getAll(): Observable<Session[]> {
    return this.http.get<Session[]>(`${environment.apiUrl}/api/sessions`);
  }

  public async get(sessionId: number): Promise<Session> {
    const obj = await lastValueFrom(this.http.get(`${environment.apiUrl}/api/sessions/${sessionId}`));

    this.currentSession = obj as Session;

    if (this.currentSession != null) {
      this.registerHub();
    }

    return this.currentSession;
  }

  public async updateTopic(topic: Topic): Promise<Topic> {
    const request = topic.id != null
      ? this.http.put(`${environment.apiUrl}/api/sessions/${this.currentSession.id}/topics/${topic.id}`, topic)
      : this.http.post(`${environment.apiUrl}/api/sessions/${this.currentSession.id}/topics/`, topic);

    const obj = await lastValueFrom(request);
    return this.updateInternal(this.currentSession.topics, obj as Topic);
  }

  public async updateSlot(slot: Slot): Promise<Slot> {
    const request = slot.id != null
      ? this.http.put(`${environment.apiUrl}/api/sessions/${this.currentSession.id}/slots/${slot.id}`, slot)
      : this.http.post(`${environment.apiUrl}/api/sessions/${this.currentSession.id}/slots/`, slot);

    const obj = await lastValueFrom(request);
    return this.updateInternal(this.currentSession.slots, obj as Slot);
  }

  public async updateRoom(room: Room): Promise<Room> {
    const request = room.id != null
      ? this.http.put(`${environment.apiUrl}/api/sessions/${this.currentSession.id}/rooms/${room.id}`, room)
      : this.http.post(`${environment.apiUrl}/api/sessions/${this.currentSession.id}/rooms/`, room);

    const obj = await lastValueFrom(request)
    return this.updateInternal(this.currentSession.rooms, obj as Room);
  }

  public async updateTopicAttendance(topicId: string, value: boolean): Promise<Attendance> {
    const topicAttendance = this.sessionOptions.topicsAttending[topicId];
    const id = topicAttendance != null && !this.currentSession.freeForAll ? topicAttendance.id : getRandomId();
    const attendance = <Attendance>{ id, value };

    this.sessionOptions.topicsAttending[topicId] = { id, value: value };
    this.saveSessionOptions();

    const request = attendance.id != null
      ? this.http.put(`${environment.apiUrl}/api/sessions/${this.currentSession.id}/topics/${topicId}/attendances/${attendance.id}`, attendance)
      : this.http.post(`${environment.apiUrl}/api/sessions/${this.currentSession.id}/topics/${topicId}/attendances/`, [attendance]);

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

    const request = this.http.post(`${environment.apiUrl}/api/sessions/${this.currentSession.id}/topics/${topicId}/attendances/`, attendances);
    await lastValueFrom(request);

    const topic = this.getTopic(topicId);
    if (topic != null) {
      topic.attendees = attendances;
    }

    return attendances;
  }

  public async updateTopicRating(topicId: string, value: number): Promise<Rating> {
    const topicRating = this.sessionOptions.topicsRating[topicId];
    const id = topicRating != null && !this.currentSession.freeForAll ? topicRating.id : getRandomId();
    const rating = <Rating>{ id, value };

    this.sessionOptions.topicsRating[topicId] = { id, value: value };
    this.saveSessionOptions();

    const request = rating.id != null
      ? this.http.put(`${environment.apiUrl}/api/sessions/${this.currentSession.id}/topics/${topicId}/ratings/${rating.id}`, rating)
      : this.http.post(`${environment.apiUrl}/api/sessions/${this.currentSession.id}/topics/${topicId}/ratings/`, rating);

    await lastValueFrom(request);

    return this.updateInternal(this.getTopic(topicId)?.ratings ?? [], rating);
  }

  public async updateTopicFeedback(topicId: string, value: string): Promise<Feedback> {
    const id = getRandomId();
    const feedback = <Feedback>{ id, value };

    const request = this.http.post(`${environment.apiUrl}/api/sessions/${this.currentSession.id}/topics/${topicId}/feedback/`, feedback);

    await lastValueFrom(request);
    return this.updateInternal(this.getTopic(topicId)?.feedback ?? [], feedback);
  }

  public async deleteTopic(id: string): Promise<void> {
    await lastValueFrom(this.http.delete(`${environment.apiUrl}/api/sessions/${this.currentSession.id}/topics/${id}`))
    return this.deleteInternal(this.currentSession.topics, id);
  }

  public async deleteSlot(id: string): Promise<void> {
    await lastValueFrom(this.http.delete(`${environment.apiUrl}/api/sessions/${this.currentSession.id}/slots/${id}`));
    return this.deleteInternal(this.currentSession.slots, id);
  }

  public async deleteRoom(id: string): Promise<void> {
    await lastValueFrom(this.http.delete(`${environment.apiUrl}/api/sessions/${this.currentSession.id}/rooms/${id}`));
    return this.deleteInternal(this.currentSession.rooms, id);
  }

  public async deleteTopicAttendance(topicId: string): Promise<void> {
    const topic = this.currentSession.topics.find(topic => topic.id === topicId);
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

    await lastValueFrom(this.http.delete(`${environment.apiUrl}/api/sessions/${this.currentSession.id}/topics/${topicId}/attendances/${attendanceId}`));
    return this.deleteInternal(this.getTopic(topicId)?.attendees ?? [], attendanceId);
  }

  public async deleteTopicFeedback(topicId: string, feedbackId: string): Promise<void> {
    await lastValueFrom(this.http.delete(`${environment.apiUrl}/api/sessions/${this.currentSession.id}/topics/${topicId}/feedback/${feedbackId}`));
    return this.deleteInternal(this.getTopic(topicId)?.feedback ?? [], feedbackId);
  }

  public async resetRatings() {
    await lastValueFrom(this.http.delete(`${environment.apiUrl}/api/sessions/${this.currentSession.id}/ratings`));
  }

  public async resetAttendance() {
    await lastValueFrom(this.http.delete(`${environment.apiUrl}/api/sessions/${this.currentSession.id}/attendances`));
  }

  public async deleteTopicRating(topicId: string): Promise<void> {
    const topic = this.currentSession.topics.find(topic => topic.id === topicId);
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

    await lastValueFrom(this.http.delete(`${environment.apiUrl}/api/sessions/${this.currentSession.id}/topics/${topicId}/ratings/${ratingId}`));
    return this.deleteInternal(this.getTopic(topicId)?.ratings ?? [], ratingId);
  }

  public getTopicRating(topicId: string) {
    if (this.currentSession.freeForAll) {
      return 0;
    }

    const topic = this.currentSession.topics.find(topic => topic.id === topicId);
    if (topic == null) {
      return false;
    }

    const topicRating = this.sessionOptions.topicsRating[topicId];
    const sessionHasTopicRating = topicRating != null
      && topic.ratings.some(t => t.id === topicRating.id);
    return sessionHasTopicRating ? topicRating.value : 0;
  }

  public getTopicAttendance(topicId: string) {
    if (this.currentSession.freeForAll) {
      return false;
    }

    const topic = this.currentSession.topics.find(topic => topic.id === topicId);
    if (topic == null) {
      return false;
    }

    const topicAttendance = this.sessionOptions.topicsAttending[topicId];
    const sessionHasTopicAttendance = topicAttendance != null
      && topic.attendees.some(t => t.id === topicAttendance.id);
    return sessionHasTopicAttendance ? topicAttendance.value : false;
  }

  private updateInternal(arr: any[], obj: any) {
    const index = arr.findIndex(a => a.id === obj.id);
    if (index >= 0) {
      arr[index] = obj;
    } else {
      arr.push(obj);
    }

    this.sessionChanged.next(this.currentSession);

    return obj;
  }

  private deleteInternal(obj: any[], id: string) {
    const index = obj.findIndex(o => o.id === id);
    if (index >= 0) {
      obj.splice(index, 1);
    }

    this.sessionChanged.next(this.currentSession);
  }

  private getTopic(topicId: string) {
    return this.currentSession.topics.find(topic => topic.id === topicId);
  }

  private registerHub() {
    this._hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/sessions?sessionId=${this.currentSession.id}`)
      .build();

    this._hubConnection.on("updateSession", (session: Session) => this.currentSession = session);
    this._hubConnection.on("updateTopic", (topic: Topic) => this.updateInternal(this.currentSession.topics, topic));
    this._hubConnection.on("updateRoom", (room: Room) => this.updateInternal(this.currentSession.rooms, room));
    this._hubConnection.on("updateSlot", (slot: Slot) => this.updateInternal(this.currentSession.slots, slot));
    this._hubConnection.on("deleteTopic", (id: string) => this.deleteInternal(this.currentSession.topics, id));
    this._hubConnection.on("deleteRoom", (id: string) => this.deleteInternal(this.currentSession.rooms, id));
    this._hubConnection.on("deleteSlot", (id: string) => this.deleteInternal(this.currentSession.slots, id));
    this._hubConnection.on("deleteSession", () => this.sessionDeleted.next(null));

    this._hubConnection.start()
      .then(() => {
        console.log("Hub connection started");
      })
      .catch(() => {
        console.log("Error while establishing connection");
      });
  }
}
