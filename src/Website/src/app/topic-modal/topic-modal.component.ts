import {
  Component, EventEmitter, Input,
  Output, ViewChild
} from "@angular/core";
import { NgSelectComponent } from "@ng-select/ng-select";
import { Topic } from "../models/topic";
import { SessionService } from "../session/session.service";

@Component({
  selector: "app-topic-modal",
  templateUrl: "./topic-modal.component.html",
  styleUrls: ["topic-modal.component.css"],
})
export class TopicModalComponent {
  private _item: Topic;
  private _capabilities: string[];

  public selectedTab: string;
  public feedback = "";

  @Output()
  public close = new EventEmitter();

  @Input()
  public isShown = false;

  @Input()
  public get item() {
    return this._item || new Topic();
  }

  public set item(value) {
    if (!value) return;
    this._item = value;
  }

  @ViewChild("capabilitiesElement", { static: false })
  public capabilitiesElement: NgSelectComponent;

  public get capabilities() {
    if (this.sessionService.currentSession == null) {
      return [];
    }

    if (this._capabilities != null) {
      return this._capabilities;
    }

    try {
      this._capabilities = [
        ...new Set(this.sessionService.currentSession.rooms
          .map((r) => r.capabilities)
          .reduce((a, b) => a.concat(b))
          .concat(
            this.sessionService.currentSession.topics
              .map((r) => r.demands)
              .reduce((a, b) => a.concat(b))
          )
        )];
    } catch {
      this._capabilities = [];
    }

    return this._capabilities;
  }

  constructor(private sessionService: SessionService) {
    this.selectedTab = "topic";
  }

  public async save() {
    await this.sessionService.updateTopic(this.item);
  }

  public async delete() {
    await this.sessionService.deleteTopic(this.item.id);
  }

  public onClose() {
    this.capabilitiesElement.close();
    this.close.next(null);
  }

  public selectTab(tabName: string) {
    this.selectedTab = tabName;
  }

  public async addFeedback() {
    if (this.feedback.trim() === "") {
      return;
    }

    const feedback = await this.sessionService.updateTopicFeedback(
      this.item.id,
      this.feedback
    );
    this.item.feedback.splice(0, 0, feedback);
  }

  public async deleteFeedback(id) {
    if (confirm("Do you really want to delete this feedback?")) {
      await this.sessionService.deleteTopicFeedback(this.item.id, id);

      const index = this.item.feedback.findIndex(f => f.id === id);
      if (index >= 0) {
        this.item.feedback.splice(index, 1);
      }
    }
  }
}
