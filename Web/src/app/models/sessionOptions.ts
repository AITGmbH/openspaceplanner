import { getRandomId } from '../shared/common';

export class SessionOptions {
    public topicsAttending: { [id: number]: boolean };
    public topicsRating: { [id: number]: ({ id: string, value: number}); };

    constructor() {
        this.topicsAttending = {};
        this.topicsRating = {};
    }
}
