import { Attendance } from "./attendance";
import { Feedback } from "./feedback";
import { Rating } from "./rating";
import { TopicComment } from "./topicComment";

export class Topic {
    public id: string;
    public name: string;
    public demands: string[];
    public description: string;
    public owner: string;
    public attendees: Attendance[];
    public comments: TopicComment[];
    public feedback: Feedback[];
    public ratings: Rating[];
    public roomId: string;
    public slotId: string;

    constructor(owner: string = null) {
        this.owner = owner;
    }
}
