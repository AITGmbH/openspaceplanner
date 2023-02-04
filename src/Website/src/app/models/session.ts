import { Room } from "./room";
import { Slot } from "./slot";
import { Topic } from "./topic";

export class Session {
  public id: number;
  public name: string;
  public topics: Topic[];
  public rooms: Room[];
  public slots: Slot[];
  public createdAt: string;
  public freeForAll: boolean;
  public votingEnabled: boolean;
  public attendanceEnabled: boolean;
  public teamsAnnouncementsEnabled: boolean;

  constructor() {
    this.topics = [];
    this.slots = [];
    this.rooms = [];
  }
}
