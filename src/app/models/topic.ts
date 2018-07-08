import { Rating } from './rating';
import { Attendance } from './attendance';
import { Feedback } from './feedback';

export class Topic {
    public id: string;
    public name: string;
    public description: string;
    public owner: string;
    public attendees: Attendance[];
    public feedback: Feedback[];
    public ratings: Rating[];
    public roomId: string;
    public slotId: string;

    constructor(owner: string = null) {
        this.owner = owner;
    }
}
