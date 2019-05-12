import * as _ from "lodash";
import { Attendance } from "../models/attendance";
import { getRandomId } from "../shared/common";
import { HttpClient } from "@angular/common/http";
import { HubConnection, HubConnectionBuilder } from "@aspnet/signalr";
import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { Rating } from "../models/rating";
import { Room } from "../models/room";
import { Session } from "../models/session";
import { SessionOptions } from "../models/sessionOptions";
import { Slot } from "../models/slot";
import { Topic } from "../models/topic";
import { TopicComment } from "../models/topicComment";

@Injectable()
export class SessionService {
  private _hubConnection: HubConnection;
  private _sessionOptions: SessionOptions;

  public sessionDeleted = new Subject();
  public currentSession: Session;

  public get sessionOptions() {
    if (this._sessionOptions != null) {
      return this._sessionOptions;
    }

    try {
      this._sessionOptions = JSON.parse(localStorage.getItem(`sessions${this.currentSession.id}`)) || new SessionOptions();
      this._sessionOptions = Object.assign(new SessionOptions(), this._sessionOptions);
      this.saveSessionOptions();
    } catch {
      this._sessionOptions = new SessionOptions();
      this.saveSessionOptions();
    }

    return this._sessionOptions;
  }

  constructor(private http: HttpClient) { }

  public saveSessionOptions() {
    try {
      localStorage.setItem(`sessions${this.currentSession.id}`, JSON.stringify(this._sessionOptions));
    } catch { }
  }

  public update(session: Session = <Session>{}): Promise<Session> {
    const request = session.id != null
      ? this.http.put<Session>(`/api/sessions/${session.id}`, session)
      : this.http.post<Session>(`/api/sessions`, session);

    return request.toPromise();
  }

  public delete(id: number): Promise<void> {
    return this.http.delete<void>(`/api/sessions/${id}`).toPromise();
  }

  public getLastSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`/api/sessions/last`);
  }

  public getAll(): Observable<Session[]> {
    return this.http.get<Session[]>('/api/sessions');
  }

  public get(sessionId: number): Promise<Session> {
    return this.http.get(`/api/sessions/${sessionId}`)
      .toPromise()
      .then(obj => {
        this.currentSession = obj as Session;

        if (this.currentSession != null) {
          this.registerHub();
        }

        return this.currentSession;
      });
  }

  public updateTopic(topic: Topic): Promise<Topic> {
    const request = topic.id != null
      ? this.http.put(`/api/sessions/${this.currentSession.id}/topics/${topic.id}`, topic)
      : this.http.post(`/api/sessions/${this.currentSession.id}/topics/`, topic);

    return request.toPromise().then(obj => this.updateInternal(this.currentSession.topics, obj as Topic));
  }

  public updateSlot(slot: Slot): Promise<Slot> {
    const request = slot.id != null
      ? this.http.put(`/api/sessions/${this.currentSession.id}/slots/${slot.id}`, slot)
      : this.http.post(`/api/sessions/${this.currentSession.id}/slots/`, slot);

    return request.toPromise().then(obj => this.updateInternal(this.currentSession.slots, obj as Slot));
  }

  public updateRoom(room: Room): Promise<Room> {
    const request = room.id != null
      ? this.http.put(`/api/sessions/${this.currentSession.id}/rooms/${room.id}`, room)
      : this.http.post(`/api/sessions/${this.currentSession.id}/rooms/`, room);

    return request.toPromise().then(obj => this.updateInternal(this.currentSession.rooms, obj as Room));
  }

  public updateTopicAttendance(topicId: string, value: boolean): Promise<Attendance> {
    const topicAttendance = this.sessionOptions.topicsAttending[topicId];
    const id = topicAttendance != null && !this.currentSession.freeForAll ? topicAttendance.id : getRandomId();
    const attendance = <Attendance>{ id, value };

    this.sessionOptions.topicsAttending[topicId] = { id, value: value };
    this.saveSessionOptions();

    const request = attendance.id != null
      ? this.http.put(`/api/sessions/${this.currentSession.id}/topics/${topicId}/attendances/${attendance.id}`, attendance)
      : this.http.post(`/api/sessions/${this.currentSession.id}/topics/${topicId}/attendances/`, [attendance]);

    return request.toPromise().then(obj => this.updateInternal(this.getTopic(topicId).attendees, attendance));
  }

  public updateTopicAttendances(topicId: string, value: number): Promise<Attendance[]> {
    if (!this.currentSession.freeForAll) {
      return;
    }

    const attendances: Attendance[] = [];
    for (let i = 0; i < value; i++) {
      attendances.push(<Attendance>{ id: getRandomId(), value: true });
    }

    const request = this.http.post(`/api/sessions/${this.currentSession.id}/topics/${topicId}/attendances/`, attendances);
    return request.toPromise().then(obj => this.getTopic(topicId).attendees = attendances);
  }

  public updateTopicRating(topicId: string, value: number): Promise<Rating> {
    const topicRating = this.sessionOptions.topicsRating[topicId];
    const id = topicRating != null && !this.currentSession.freeForAll ? topicRating.id : getRandomId();
    const rating = <Rating>{ id, value };

    this.sessionOptions.topicsRating[topicId] = { id, value: value };
    this.saveSessionOptions();

    const request = rating.id != null
      ? this.http.put(`/api/sessions/${this.currentSession.id}/topics/${topicId}/ratings/${rating.id}`, rating)
      : this.http.post(`/api/sessions/${this.currentSession.id}/topics/${topicId}/ratings/`, rating);

    return request.toPromise().then(_ => this.updateInternal(this.getTopic(topicId).ratings, rating));
  }

  public updateTopicComment(topicId: string, value: string): Promise<TopicComment> {
    const id = getRandomId();
    const comment = <TopicComment>{ id, value };

    const request = this.http.post(`/api/sessions/${this.currentSession.id}/topics/${topicId}/comments/`, comment);

    return request.toPromise().then(_ => this.updateInternal(this.getTopic(topicId).comments, comment));
  }

  public deleteTopic(id: string): Promise<void> {
    return this.http.delete(`/api/sessions/${this.currentSession.id}/topics/${id}`)
      .toPromise()
      .then(() => this.deleteInternal(this.currentSession.topics, id))
      .then(() => null);
  }

  public deleteSlot(id: string): Promise<void> {
    return this.http.delete(`/api/sessions/${this.currentSession.id}/slots/${id}`)
      .toPromise()
      .then(() => this.deleteInternal(this.currentSession.slots, id))
      .then(() => null);
  }

  public deleteRoom(id: string): Promise<void> {
    return this.http.delete(`/api/sessions/${this.currentSession.id}/rooms/${id}`)
      .toPromise()
      .then(() => this.deleteInternal(this.currentSession.rooms, id))
      .then(() => null);
  }

  public deleteTopicAttendance(topicId: string): Promise<void> {
    const topic = _.find(this.currentSession.topics, { id: topicId });
    if (topic.attendees.length <= 0) {
      return;
    }

    let attendanceId;
    if (this.currentSession.freeForAll) {
      // if it's free for all, we just delete a random attendance
      attendanceId = topic.attendees[0].id;
    } else {
      const topicAttendance = this.sessionOptions.topicsAttending[topicId];
      attendanceId = topicAttendance.id;
    }

    delete this.sessionOptions.topicsRating[topicId];

    return this.http.delete(`/api/sessions/${this.currentSession.id}/topics/${topicId}/attendances/${attendanceId}`)
      .toPromise()
      .then(() => this.deleteInternal(this.getTopic(topicId).attendees, attendanceId))
      .then(() => null);
  }

  public deleteTopicComment(topicId: string, commentId: string): Promise<void> {
    return this.http.delete(`/api/sessions/${this.currentSession.id}/topics/${topicId}/comments/${commentId}`)
      .toPromise()
      .then(() => this.deleteInternal(this.getTopic(topicId).comments, commentId))
      .then(() => null);
  }

  public resetRatings() {
    return this.http.delete(`/api/sessions/${this.currentSession.id}/ratings`)
      .toPromise()
      .then(() => null);
  }

  public resetAttendance() {
    return this.http.delete(`/api/sessions/${this.currentSession.id}/attendances`)
      .toPromise()
      .then(() => null);
  }

  public deleteTopicRating(topicId: string): Promise<void> {
    const topic = _.find(this.currentSession.topics, { id: topicId });
    if (topic.ratings.length <= 0) {
      return;
    }

    let ratingId;
    if (this.currentSession.freeForAll) {
      // if it's free for all, we just delete a random rating
      ratingId = topic.ratings[0].id;
    } else {
      const topicRating = this.sessionOptions.topicsRating[topicId];
      ratingId = topicRating.id;
    }

    delete this.sessionOptions.topicsRating[topicId];

    return this.http.delete(`/api/sessions/${this.currentSession.id}/topics/${topicId}/ratings/${ratingId}`)
      .toPromise()
      .then(() => this.deleteInternal(this.getTopic(topicId).ratings, ratingId))
      .then(() => null);
  }

  public getTopicRating(topicId: string) {
    if (this.currentSession.freeForAll) {
      return 0;
    }

    const topic = _.find(this.currentSession.topics, { id: topicId });
    if (topic == null) {
      return false;
    }

    const topicRating = this.sessionOptions.topicsRating[topicId];
    const sessionHasTopicRating = topicRating != null
      && _.some(topic.ratings, t => t.id === topicRating.id);
    return sessionHasTopicRating ? topicRating.value : 0;
  }

  public getTopicAttendance(topicId: string) {
    if (this.currentSession.freeForAll) {
      return false;
    }

    const topic = _.find(this.currentSession.topics, { id: topicId });
    if (topic == null) {
      return false;
    }

    const topicAttendance = this.sessionOptions.topicsAttending[topicId];
    const sessionHasTopicAttendance = topicAttendance != null
      && _.some(topic.attendees, t => t.id === topicAttendance.id);
    return sessionHasTopicAttendance ? topicAttendance.value : false;
  }

  private updateInternal(arr: any[], obj: any) {
    const index = _.findIndex(arr, { id: obj.id });
    if (index >= 0) {
      arr[index] = obj;
    } else {
      arr.push(obj);
    }

    return obj;
  }

  private deleteInternal(obj: any[], id: string) {
    const index = _.findIndex(obj, o => o.id === id);
    if (index >= 0) {
      obj.splice(index, 1);
    }
  }

  private getTopic(topicId: string) {
    return _.find(this.currentSession.topics, t => t.id === topicId);
  }

  private registerHub() {
    this._hubConnection = new HubConnectionBuilder()
      .withUrl(`/hubs/sessions?sessionId=${this.currentSession.id}`)
      .build();

    this._hubConnection.on("updateSession", (session: Session) => this.currentSession = session);
    this._hubConnection.on("updateTopic", (topic: Topic) => this.updateInternal(this.currentSession.topics, topic));
    this._hubConnection.on("updateRoom", (room: Room) => this.updateInternal(this.currentSession.rooms, room));
    this._hubConnection.on("updateSlot", (slot: Slot) => this.updateInternal(this.currentSession.slots, slot));
    this._hubConnection.on("deleteTopic", (id: string) => this.deleteInternal(this.currentSession.topics, id));
    this._hubConnection.on("deleteRoom", (id: string) => this.deleteInternal(this.currentSession.rooms, id));
    this._hubConnection.on("deleteSlot", (id: string) => this.deleteInternal(this.currentSession.slots, id));
    this._hubConnection.on("deleteSession", () => this.sessionDeleted.next());

    this._hubConnection.start()
      .then(() => {
        console.log("Hub connection started");
      })
      .catch(err => {
        console.log("Error while establishing connection");
      });
  }
}
