import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Topic } from '../models/topic';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';
import { SessionService } from '../session/session.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-topic-modal',
  templateUrl: './topic-modal.component.html',
  styleUrls: ['topic-modal.component.css']
})
export class TopicModalComponent {
  private _item: Topic;

  public selectedTab: string;
  public feedback = '';

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
    this.close.next();
  }

  public selectTab(tabName: string) {
    this.selectedTab = tabName;
  }

  public async addFeedback() {
    if (this.feedback.trim() === '') {
      return;
    }

    const feedback = await this.sessionService.updateTopicFeedback(this.item.id, this.feedback);
    this.item.feedback.splice(0, 0, feedback);
  }

  public async deleteFeedback(id) {
    if (confirm('Do you really want to delete this feedback?')) {
      await this.sessionService.deleteTopicFeedback(this.item.id, id);

      const index = _.findIndex(this.item.feedback, { id });
      if (index >= 0) {
        this.item.feedback.splice(index, 1);
      }
    }
  }
}
