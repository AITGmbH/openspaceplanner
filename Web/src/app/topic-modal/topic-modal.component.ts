import * as _ from "lodash";
import {
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild
    } from "@angular/core";
import { ModalDialogComponent } from "../modal-dialog/modal-dialog.component";
import { NgSelectComponent } from "@ng-select/ng-select";
import { SessionService } from "../session/session.service";
import { Topic } from "../models/topic";

@Component({
  selector: 'app-topic-modal',
  templateUrl: './topic-modal.component.html',
  styleUrls: ['topic-modal.component.css']
})
export class TopicModalComponent {
  private _item: Topic;
  private _capabilities: string[];

  public selectedTab: string;
  public comment = '';

  @Output()
  public close = new EventEmitter();

  @Input()
  public isShown = false;

  @Input()
  public get item() {
    return this._item || new Topic();
  }

  public set item(value) {
    this._item = value;
  }

  @ViewChild('capabilitiesElement') public capabilitiesElement: NgSelectComponent;

  public get capabilities() {
    if (this.sessionService.currentSession == null) {
      return [];
    }

    if (this._capabilities != null) {
      return this._capabilities;
    }

    try {
      this._capabilities = _.uniq(this.sessionService.currentSession.rooms.map(r => r.capabilities).reduce((a, b) => a.concat(b))
        .concat(this.sessionService.currentSession.topics.map(r => r.demands).reduce((a, b) => a.concat(b))));
    } catch {
      this._capabilities = [];
    }

    return this._capabilities;
  }

  constructor(private sessionService: SessionService) {
    this.selectedTab = 'topic';
  }

  public save() {
    this.sessionService.updateTopic(this.item);
  }

  public delete() {
    this.sessionService.deleteTopic(this.item.id);
  }

  public onClose() {
    if (this.capabilitiesElement != null) {
        this.capabilitiesElement.close();
    }

    this.close.next();
  }

  public selectTab(tabName: string) {
    this.selectedTab = tabName;
  }

  public async addComment() {
    if (this.comment.trim() === '') {
      return;
    }

    const comment = await this.sessionService.updateTopicComment(this.item.id, this.comment);
    this.item.comments.splice(0, 0, comment);
  }

  public async deleteComment(id) {
    if (confirm('Do you really want to delete this comment?')) {
      await this.sessionService.deleteTopicComment(this.item.id, id);

      const index = _.findIndex(this.item.comments, { id });
      if (index >= 0) {
        this.item.comments.splice(index, 1);
      }
    }
  }
}
