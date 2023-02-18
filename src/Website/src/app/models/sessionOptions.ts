import { Attendance } from '../shared/services/api';

export class SessionOptions {
  public topicsAttending: { [id: string]: Attendance };
  public topicsRating: { [id: string]: ({ id: string, value: number }); };
  public topicsFavorite: { [id: string]: boolean };

  constructor() {
    this.topicsAttending = {};
    this.topicsRating = {};
    this.topicsFavorite = {};
  }
}
