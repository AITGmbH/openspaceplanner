import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DropEvent, InteractEvent } from '@interactjs/types';
import interact from 'interactjs';
import { Subject, Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { Room, Session, Slot, Topic } from '../shared/services/api';
import { SessionService } from './session.service';

type TopicLookup = { [slotId: string]: (Topic | null)[] };

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css'],
})
export class SessionComponent implements OnInit, OnDestroy {
  private _topics?: TopicLookup | null;
  private _subscriptions = new Subscription();

  public isLoading$ = new Subject();
  public modalShown: { [key: string]: any } = {};
  public modalShown$ = new Subject<any>();

  @ViewChild('floatingActionButton', { static: true })
  public floatingActionButton!: ElementRef<any>;

  public session!: Session;

  public get unassignedTopics(): Topic[] {
    return this.session.topics
      .filter((t) => t.roomId == null || t.slotId == null)
      .sort((a, b) => b.owner?.localeCompare(a.owner ?? '') || b.name?.localeCompare(a.name))
      .reverse();
  }

  public get slots(): Slot[] {
    return this.sessionService.getSortedSlots(this.session.slots);
  }

  public get rooms(): Room[] {
    return this.sessionService.getSortedRooms(this.session.rooms);
  }

  public get calendarLink() {
    return `${environment.apiUrl}/api/sessions/${this.session.id}/calendar`;
  }

  constructor(private sessionService: SessionService, private router: Router, private route: ActivatedRoute) {
    this._subscriptions.add(
      this.sessionService.sessionChanged.subscribe(() => {
        this.refreshTopics();

        this.session = this.sessionService.currentSession;
      })
    );
  }

  public async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id == null) {
      this.router.navigate(['/']);
      return;
    }

    const isMobile = navigator.userAgent.toLowerCase().match(/mobile/i);
    if (isMobile) {
      this.router.navigate(['/session', id, 'overview']);
    }

    await this.sessionService.get(+id);

    this.session = this.sessionService.currentSession;

    this.isLoading$.next(false);

    interact('.draggable').draggable({
      autoScroll: {
        container: window,
        speed: 1000,
        interval: 5,
      },
      inertia: true,
      onstart: (event: InteractEvent<'drag', 'start'>) => this.onTopicMoveStart(event),
      onmove: (event: InteractEvent<'drag', 'move'>) => this.onTopicMove(event),
      onend: (event: InteractEvent<'drag', 'end'>) => this.onTopicMoveEnd(event),
    });

    interact('.dropable').dropzone({
      accept: '.draggable',
      overlap: 0.4,
      ondrop: (event: DropEvent) => this.onTopicDrop(event),
      ondragenter: (event: DropEvent) => this.onDragEnter(event),
      ondragleave: (event: DropEvent) => this.onDragLeave(event),
    });
  }

  public ngOnDestroy() {
    this._subscriptions.unsubscribe();

    interact('.draggable').unset();
    interact('.dropable').unset();
  }

  public navigateToOverview() {
    this.router.navigate(['session/', this.sessionService.currentSession.id, 'overview']);
  }

  public showModal($event: any, name: string, parameter: any) {
    $event.stopPropagation();

    this.modalShown[name] = parameter;
    this.modalShown$.next(this.modalShown);
  }

  public hideModal(name: string) {
    this.modalShown[name] = false;

    this.refreshTopics();
  }

  public getOpenModal() {
    for (const key in this.modalShown) {
      if (this.modalShown[key] !== false) {
        return key;
      }
    }

    this.modalShown$.next(this.modalShown);

    return null;
  }

  @HostListener('document:keyup', ['$event'])
  public keyup(event: KeyboardEvent) {
    const hasNoModalOpen = this.getOpenModal() == null;

    if (event.shiftKey && hasNoModalOpen) {
      if (event.key == 'T') {
        this.modalShown['topic'] = {};
      } else if (event.key == 'R') {
        this.modalShown['room'] = {};
      } else if (event.key == 'S') {
        this.modalShown['slot'] = {};
      }
    }
  }

  @HostListener('document:click', ['$event'])
  public documentClick(event: MouseEvent) {
    const openModal = this.getOpenModal();
    if (openModal != null) {
      if (!this.hasModalParent(event.target as Element)) {
        this.hideModal(openModal);
      }
    } else {
      this.floatingActionButton.nativeElement.expanded = false;
    }
  }

  private hasModalParent(element: Element): boolean {
    if (element.classList.contains('modal')) {
      return true;
    }

    const isDropdownPanel = element.classList.contains('ng-dropdown-panel') || element.classList.contains('ng-value');
    if (isDropdownPanel) {
      // ignore the ng-select dropdown panel which is appended to the body
      return true;
    }

    if (element.parentElement == null) {
      return false;
    }

    return this.hasModalParent(element.parentElement);
  }

  private onTopicMoveStart(event: InteractEvent<'drag', 'start'>) {
    const topic = this.getTopicByElement(event.target);
    if (topic == null) {
      return;
    }

    event.target.style.width = '150px';
    event.target.style.height = '80px';

    if (event.target.parentElement != null) {
      event.target.parentElement.style.zIndex = '9999';
      event.target.parentElement.style.position = 'absolute';
      event.target.parentElement.style.width = '100%';
      event.target.parentElement.style.height = '100%';
      event.target.parentElement.style.top = event.pageY - 80 + 'px';
      event.target.parentElement.style.left = event.pageX - 150 + 'px';
    }

    this.markSuitableTopicSpaces(topic);

    this.pauseEvent(event);
  }

  private onTopicMove(event: InteractEvent<'drag', 'move'>) {
    const target = event.target,
      x = parseFloat(target.getAttribute('data-x') ?? '0') + event.dx,
      y = parseFloat(target.getAttribute('data-y') ?? '0') + event.dy;

    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

    target.setAttribute('data-x', x.toString());
    target.setAttribute('data-y', y.toString());

    this.pauseEvent(event);
  }

  private async onTopicMoveEnd(event: InteractEvent<'drag', 'end'>) {
    const isNotDropable = event.relatedTarget == null || !event.relatedTarget.classList.contains('dropable');
    if (isNotDropable) {
      event.target.classList.remove('drop-target');
      event.target.dataset.x = event.target.dataset.y = event.target.style.transform = '';

      event.target.setAttribute('style', '');

      if (event.target.parentElement != null) {
        event.target.parentElement.setAttribute('style', '');
      }

      this.refreshTopics();
    }

    document.querySelectorAll('.topic-space').forEach((t) => t.classList.remove('suitable-topic-space', 'dropable'));
  }

  private markSuitableTopicSpaces(topic: Topic) {
    const slotsOfTopicsWithSameOwner = this.sessionService.currentSession.topics
      .filter((t: Topic) => topic.owner != null && t.id !== topic.id && t.owner === topic.owner)
      .reduce((a: Slot[], topic: Topic) => [...a, ...this.sessionService.getSlotsOfTopic(this.slots, topic)], []);

    const topicSpaces = document.querySelectorAll('.topic-space');
    for (let i = 0; i < topicSpaces.length; i++) {
      const topicSpace = <HTMLElement>topicSpaces[i];

      const room = this.rooms.find((r) => r.id == topicSpace.dataset.roomId);
      const slot = this.slots.find((s) => s.id == topicSpace.dataset.slotId);

      if (room == null || slot == null) {
        continue;
      }

      let suitableSpace = true;
      let dropable = true;

      // has space (not blocked by another topic)
      const topicsInRoom = [...this.getTopicsInRoom(room.id)];
      const slotIndex = this.slots.indexOf(slot);

      for (let index = slotIndex; index <= slotIndex + topic.slots - 1 && index < this.slots.length; index++) {
        const nextSlot = this.slots[index];
        const topicInRoom = topicsInRoom[index];
        if (topicInRoom != null && topicInRoom.id !== topic.id) {
          suitableSpace = false;
        }

        const hasTopicsWithSameOwnerInSlot = slotsOfTopicsWithSameOwner.findIndex((s: Slot) => s.id === nextSlot.id) >= 0;
        if (hasTopicsWithSameOwnerInSlot) {
          suitableSpace = false;
        }
      }

      const roomMatchesSeats = room.seats != null && room.seats >= topic.attendees.length;
      if (!roomMatchesSeats) {
        suitableSpace = false;
      }

      // room has all capabilities of the topic's demands
      const roomMatchesDemands = topic.demands.every((d: string) => room.capabilities.findIndex((c) => c == d) >= 0);
      if (!roomMatchesDemands) {
        suitableSpace = false;
      }

      // has enough slots afterwards
      const hasEnoughSlotsAfterwards = this.slots.length - slotIndex >= topic.slots;
      if (!hasEnoughSlotsAfterwards) {
        dropable = false;
        suitableSpace = false;
      }

      // is the slot planable
      if (!slot.isPlanable) {
        dropable = suitableSpace = false;
      }

      if (room.id == topic.roomId && slot.id == topic.slotId) {
        // dropping the topic on the same space as it is now is suitable
        dropable = true;
      }

      if (suitableSpace) {
        topicSpace.classList.add('suitable-topic-space');
      }

      if (dropable) {
        topicSpace.classList.add('dropable');
      }
    }
  }

  private *getTopicsInRoom(roomId: string) {
    const topics = this.session.topics.filter((topic) => topic.roomId === roomId);

    let previousTopic: Topic | null = null;
    let previousTopicSpan = 0;

    for (const slot of this.slots) {
      if (previousTopicSpan > 0) {
        // if a previous topic spans multiple slots into this, we just return the previous topic
        yield previousTopic;
        previousTopicSpan--;
        continue;
      }

      const topic = topics.find((topic) => topic.slotId === slot.id);
      yield topic;

      if (topic != null && topic.slots > 1) {
        // if the topic spans multiple slots, we just return it in the next slots too
        previousTopicSpan = topic.slots - 1;
        previousTopic = topic;
      }
    }
  }

  private async onTopicDrop(event: DropEvent) {
    const sourceTopicElement = event.relatedTarget as HTMLElement;
    const sourceContainerElement = (sourceTopicElement.closest('.topic-space') ?? sourceTopicElement.closest('.topics-unassigned')) as HTMLElement;

    if (sourceContainerElement == null) {
      return;
    }

    const targetContainerElement = event.target as HTMLElement;
    const targetTopicElement = targetContainerElement.querySelector('.topic') as HTMLElement;

    targetContainerElement.classList.remove('drop-target');

    const isUnassigningTopic = targetContainerElement.classList.contains('topics-unassigned');

    const sourceTopic = this.getTopicByElement(sourceTopicElement);
    if (sourceTopic == null) {
      return;
    }

    const sourceCell = {
      roomId: this.getElementRoomId(sourceContainerElement, sourceTopicElement),
      slotId: this.getElementSlotId(sourceContainerElement, sourceTopicElement),
    };

    const targetCell = {
      roomId: this.getElementRoomId(targetContainerElement, targetTopicElement),
      slotId: this.getElementSlotId(targetContainerElement, targetTopicElement),
    };

    const targetTopic = this.getTopicByElement(targetTopicElement);

    const isSwappingTopics = targetTopic != null && sourceTopic != targetTopic && !isUnassigningTopic;

    if (isSwappingTopics) {
      sourceContainerElement.append(targetTopicElement);
      await this.updateTopic(targetTopic, sourceCell.roomId, sourceCell.slotId);
    }

    await this.updateTopic(sourceTopic, targetCell.roomId, targetCell.slotId);

    this.refreshTopics();
  }

  private async updateTopic(topic: Topic, roomId: string | null, slotId: string | null) {
    topic.roomId = roomId;
    topic.slotId = slotId;
    await this.sessionService.updateTopic(topic);
  }

  private onDragEnter(event: DropEvent) {
    event.target.classList.add('drop-target');
  }

  private onDragLeave(event: DropEvent) {
    event.target.classList.remove('drop-target');
  }

  private getTopicByElement(element: Element | null) {
    if (element == null) {
      return null;
    }

    const id = element.getAttribute('id');
    const topic = this.session.topics.find((topic) => topic.id === id);
    return topic == null ? null : Object.assign({}, topic);
  }

  private getElementSlotId(container: HTMLElement, element: HTMLElement): string | null {
    try {
      if (container != null && container.dataset.slotId != null) {
        return container.dataset.slotId;
      }

      if (element.parentElement == null) {
        return null;
      }

      const parent = element.parentElement?.parentElement;
      if (parent == null) {
        return null;
      }

      return parent.getAttribute('id');
    } catch {
      return null;
    }
  }

  private getElementRoomId(container: HTMLElement, element: HTMLElement): string | null {
    try {
      if (container != null && container.dataset.roomId != null) {
        return container.dataset.roomId;
      }

      if (element.parentElement == null) {
        return null;
      }

      const parent = element.parentElement.parentElement;
      if (parent == null) {
        return null;
      }

      const index = (parent.children as unknown as HTMLElement[]).indexOf(element.parentElement);
      var headerRow = document.querySelector('.session-table thead tr');
      if (headerRow == null) {
        return null;
      }

      return headerRow.children[index].getAttribute('id');
    } catch {
      return null;
    }
  }

  public getTopics(slotId: string, roomId: string) {
    return this.session.topics.filter((topic) => topic.slotId === slotId && topic.roomId === roomId);
  }

  public get topics(): TopicLookup {
    if (this._topics != null) {
      return this._topics;
    }

    const topics: TopicLookup = {};

    for (const slot of this.slots) {
      const slotTopics = this.rooms.map((room) => {
        let topic = this.session.topics.find((t) => t.slotId === slot.id && t.roomId === room.id);

        if (topic == null) {
          topic = {
            slotId: slot.id,
            roomId: room.id,
            slots: 1,
          } as Topic;
        }

        if (this.previousTopicOverlaps(slot.id, room.id)) {
          return null;
        }

        return topic;
      });

      topics[slot.id] = slotTopics;
    }

    this._topics = topics;
    return topics;
  }

  private previousTopicOverlaps(slotId: string, roomId: string) {
    const slots = this.slots;
    for (let slotIndex = 0; slotIndex < slots.length; ) {
      const slot = slots[slotIndex];

      if (slot.id === slotId) {
        return false;
      }

      let topic = this.session.topics.find((t) => t.slotId === slot.id && t.roomId === roomId);

      slotIndex += topic == null ? 1 : topic.slots;
    }

    return true;
  }

  public toggleFloatingActionButton(event: Event) {
    event.stopPropagation();

    const isCollapsed = !this.floatingActionButton.nativeElement.dataset.expanded || this.floatingActionButton.nativeElement.dataset.expanded === 'false';

    this.floatingActionButton.nativeElement.dataset.expanded = isCollapsed ? 'true' : 'false';
  }

  private pauseEvent(event: InteractEvent<'drag', 'start'>) {
    if (event.stopPropagation) {
      event.stopPropagation();
    }

    if (event.preventDefault) {
      event.preventDefault();
    }

    event.stopImmediatePropagation();

    return false;
  }

  private refreshTopics() {
    this._topics = null;
  }
}
