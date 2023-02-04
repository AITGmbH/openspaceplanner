import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import * as interact from "interactjs";
import { Subject, Subscription } from "rxjs";
import { environment } from '../../environments/environment';
import { Room } from "../models/room";
import { Session } from '../models/session';
import { Slot } from "../models/slot";
import { Topic } from "../models/topic";
import { SessionService } from "./session.service";

@Component({
  selector: "app-session",
  templateUrl: "./session.component.html",
  styleUrls: ["./session.component.css"]
})
export class SessionComponent implements OnInit, OnDestroy {
  private _topics;
  private _subscriptions = new Subscription();

  public isLoading$ = new Subject();
  public modalShown = {};
  public modalShown$ = new Subject();

  @ViewChild("floatingActionButton", { static: true })
  public floatingActionButton;

  public session: Session;

  public get unassignedTopics(): Topic[] {
    return (
      this.session.topics
        .filter((t) => t.roomId == null || t.slotId == null)
        .sort((a, b) => b.owner?.localeCompare(a.owner) || b.name?.localeCompare(a.name))
    ).reverse();
  }

  public get slots(): Slot[] {
    return this.session.slots
      .sort((a, b) => a.time?.localeCompare(b.time));
  }

  public get rooms(): Room[] {
    return this.session.rooms
      .sort((a, b) => a.seats > b.seats ? -1 : 1);
  }

  public get calendarLink() {
    return `${environment.apiUrl}/api/sessions/${this.session.id}/calendar`;
  }

  constructor(
    private sessionService: SessionService,
    private router: Router,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this._subscriptions.add(
      this.sessionService.sessionChanged.subscribe(() => {
        this._topics = null;
        this.session = this.sessionService.currentSession;
      })
    );
  }

  public async ngOnInit() {
    const id = +this.route.snapshot.paramMap.get("id");
    if (id == null) {
      this.router.navigate(["/"]);
    }

    const isMobile = navigator.userAgent.toLowerCase().match(/mobile/i);
    if (isMobile) {
      this.router.navigate(["/session", id, "overview"]);
    }

    await this.sessionService.get(id);

    this.session = this.sessionService.currentSession;

    this.isLoading$.next(false);

    const interactHandler = <any>interact;

    interactHandler(".draggable").draggable({
      autoScroll: true,
      inertia: true,
      onstart: (event) => this.onTopicMoveStart(event),
      onmove: (event) => this.onTopicMove(event),
      onend: (event) => this.onTopicMoveEnd(event),
    });

    interactHandler(".dropable").dropzone({
      accept: ".draggable",
      overlap: 0.5,
      ondrop: (event) => this.onTopicDrop(event),
      ondragenter: (event) => this.onDragEnter(event),
      ondragleave: (event) => this.onDragLeave(event),
    });
  }

  public ngOnDestroy() {
    this._subscriptions.unsubscribe();

    const interactHandler = <any>interact;

    interactHandler(".draggable").unset();
    interactHandler(".dropable").unset();
  }

  public navigateToOverview() {
    this.router.navigate([
      "session/",
      this.sessionService.currentSession.id,
      "overview",
    ]);
  }

  public showModal($event, name: string, parameter) {
    $event.stopPropagation();

    this.modalShown[name] = parameter;
    this.modalShown$.next(this.modalShown);
  }

  public hideModal(name: string) {
    this.modalShown[name] = false;

    this._topics = null;
    this.changeDetectorRef.detectChanges();
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

  @HostListener("document:keyup", ["$event"])
  public keyup(event: KeyboardEvent) {
    const hasNoModalOpen = this.getOpenModal() == null;

    if (event.shiftKey && hasNoModalOpen) {
      if (event.key == "T") {
        this.modalShown["topic"] = {};
      } else if (event.key == "R") {
        this.modalShown["room"] = {};
      } else if (event.key == "S") {
        this.modalShown["slot"] = {};
      }
    }
  }

  @HostListener("document:click", ["$event"])
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

  private hasModalParent(element: Element) {
    if (element.classList.contains("modal")) {
      return true;
    }

    // ignore the ng-select dropdown panel which is appended to the body
    if (
      element.classList.contains("ng-dropdown-panel") ||
      element.classList.contains("ng-value")
    ) {
      return true;
    }

    if (element.parentElement == null) {
      return false;
    }

    return this.hasModalParent(element.parentElement);
  }

  private onTopicMoveStart(event) {
    event.target.style.width = "150px";
    event.target.style.height = "80px";

    event.target.parentElement.style.zIndex = 9999;
    event.target.parentElement.style.position = "absolute";
    event.target.parentElement.style.width = "100%";
    event.target.parentElement.style.height = "100%";
    event.target.parentElement.style.top = event.pageY - 80 + "px";
    event.target.parentElement.style.left = event.pageX - 150 + "px";

    const topic = this.getTopicByElement(event.target);

    const topicSpaces = document.querySelectorAll(".topic-space");
    for (let i = 0; i < topicSpaces.length; i++) {
      const topicSpace = <HTMLElement>topicSpaces[i];

      const room = this.rooms.find(
        (r) => r.id == topicSpace.dataset.roomId
      );
      const slot = this.slots.find(
        (s) => s.id == topicSpace.dataset.slotId
      );

      let suitableSpace = true;
      suitableSpace = suitableSpace && topicSpace.children.length == 0;
      suitableSpace =
        suitableSpace && room.seats >= topic.attendees.length;
      suitableSpace =
        suitableSpace &&
        this.session.topics.filter((t) => t.slotId == slot.id).every(
          (t) =>
            t.id == topic.id ||
            t.owner == null ||
            t.owner != topic.owner
        );
      suitableSpace =
        suitableSpace &&
        topic.demands.every(
          (d) => room.capabilities.findIndex((c) => c == d) >= 0
        );

      if (room.id == topic.roomId && slot.id == topic.slotId) {
        // dropping the topic on the same space as it is now is suitable
        suitableSpace = true;
      }

      if (suitableSpace) {
        topicSpace.classList.add("suitable-topic-space");
      }
    }

    this.pauseEvent(event);
  }

  private async onTopicMoveEnd(event) {
    if (
      event.relatedTarget == null ||
      !event.relatedTarget.classList.contains("dropable")
    ) {
      await this.updateTarget(
        document.querySelector(".topics-unassigned"),
        event.target
      );

      this._topics = null;
      this.changeDetectorRef.detectChanges();
    }

    document
      .querySelectorAll(".topic-space")
      .forEach((t) => t.classList.remove("suitable-topic-space"));
  }

  private onTopicMove(event) {
    const target = event.target,
      x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx,
      y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

    target.style.webkitTransform = target.style.transform =
      "translate(" + x + "px, " + y + "px)";

    target.setAttribute("data-x", x);
    target.setAttribute("data-y", y);

    this.pauseEvent(event);
  }

  private async onTopicDrop(event) {
    const isSwappingTopics =
      event.target.children.length > 0 &&
      event.target.children[0] !== event.relatedTarget.parentElement &&
      !event.target.classList.contains("topics-unassigned");

    if (isSwappingTopics) {
      const currentTopicElement = event.target.children[0].children[0];
      const relatedTargetParent =
        event.relatedTarget.parentElement.parentElement;

      if (currentTopicElement === event.relatedTarget) {
        this.resetTarget(event.relatedTarget);
        return;
      }

      relatedTargetParent.append(currentTopicElement);
      await this.updateTopicByElement(
        relatedTargetParent,
        currentTopicElement
      );
      currentTopicElement.remove();
    }

    await this.updateTarget(event.target, event.relatedTarget);
    event.target.classList.remove("drop-target");

    this._topics = null;
    this.changeDetectorRef.detectChanges();
  }

  private onDragEnter(event) {
    event.target.classList.add("drop-target");
  }

  private onDragLeave(event) {
    event.target.classList.remove("drop-target");
  }

  private async updateTarget(container, target) {
    container.appendChild(target);
    await this.updateTopicByElement(container, target);
    target.remove();

    this.resetTarget(target);
  }

  private resetTarget(target) {
    target.style.webkitTransform = target.style.transform = "";

    target.setAttribute("data-x", 0);
    target.setAttribute("data-y", 0);
  }

  private async updateTopicByElement(container, element: Element) {
    const topic = this.getTopicByElement(element);
    topic.roomId = this.getElementRoom(container, element);
    topic.slotId = this.getElementSlot(element);

    await this.sessionService.updateTopic(topic);
  }

  private getTopicByElement(element: Element): Topic {
    const id = element.getAttribute("id");
    return this.session.topics.find(topic => topic.id === id);
  }

  private getElementSlot(element: Element) {
    try {
      const parent = element.parentElement.parentElement;
      return parent.getAttribute("id");
    } catch {
      return null;
    }
  }

  private getElementRoom(container: HTMLElement, element: Element) {
    try {
      if (container != null && container.dataset.roomId != null) {
        return container.dataset.roomId;
      }

      const parent = element.parentElement.parentElement;
      const index = (parent.children as unknown as any[]).indexOf(element.parentElement);
      return document
        .querySelector(".session-table thead tr")
        .children[index].getAttribute("id");
    } catch {
      return null;
    }
  }

  public getTopics(slotId: string, roomId: string) {
    return this.session.topics.filter(topic => topic.slotId === slotId && topic.roomId === roomId);
  }

  public get topics() {
    if (this._topics != null) {
      return this._topics;
    }

    const topics = {};

    for (const slot of this.slots) {
      topics[slot.id] = this.rooms.map((room) => {
        let topic = this.session.topics.find(
          (t) => t.slotId === slot.id && t.roomId === room.id
        );

        if (topic == null) {
          topic = {
            slotId: slot.id,
            roomId: room.id,
            slots: 1,
          } as any;
        }

        if (this.previousTopicOverlaps(slot.id, room.id)) {
          return null;
        }

        return topic;
      });
    }

    this._topics = topics;
    return topics;
  }

  private previousTopicOverlaps(slotId: string, roomId: string) {
    const slots = this.slots;
    for (let slotIndex = 0; slotIndex < slots.length;) {
      const slot = slots[slotIndex];

      if (slot.id === slotId) {
        return false;
      }

      let topic = this.session.topics.find(
        (t) => t.slotId === slot.id && t.roomId === roomId
      );

      slotIndex += topic == null ? 1 : topic.slots;
    }

    return true;
  }

  public toggleFloatingActionButton($event) {
    $event.stopPropagation();
    this.floatingActionButton.nativeElement.expanded =
      !this.floatingActionButton.nativeElement.expanded;
  }

  private pauseEvent(e) {
    if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
    e.cancelBubble = true;
    e.returnValue = false;
    return false;
  }
}
