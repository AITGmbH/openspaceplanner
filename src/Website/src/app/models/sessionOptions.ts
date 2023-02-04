import { getRandomId } from '../shared/common';

export class SessionOptions {
    public topicsAttending: { [id: number]: boolean };
    public topicsRating: { [id: number]: ({ id: string, value: number}); };
    public topicsFavorite: { [id: number]: boolean };

    constructor() {
        this.topicsAttending = {};
        this.topicsRating = {};
        this.topicsFavorite = {};
    }
}
