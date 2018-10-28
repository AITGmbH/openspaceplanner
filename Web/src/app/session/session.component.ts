import {
    Component,
    OnInit,
    HostListener,
    ViewChild,
    ElementRef
} from "@angular/core";
import { SessionService } from "./session.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Topic } from "../models/topic";
import { OnDestroy } from "@angular/core/src/metadata/lifecycle_hooks";
import * as _ from "lodash";
import * as interact from "interactjs";

@Component({
    selector: "app-session",
    templateUrl: "./session.component.html",
    styleUrls: ["./session.component.css"]
})
export class SessionComponent implements OnInit, OnDestroy {
    public isLoading = true;
    public modalShown = {};

    @ViewChild("floatingActionButton") public floatingActionButton;

    public get session() {
        return this.sessionService.currentSession;
    }

    public get unassignedTopics() {
        return _(this.session.topics)
            .filter(t => t.roomId == null || t.slotId == null)
            .sortBy(t => t.attendees)
            .value()
            .reverse();
    }

    public get slots() {
        return _(this.session.slots)
            .sortBy(s => s.time)
            .value();
    }

    public get rooms() {
        return _(this.session.rooms)
            .orderBy(r => (r ? r.seats : 0), ["desc"])
            .value();
    }

    constructor(
        private sessionService: SessionService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    public async ngOnInit() {
        const id = +this.route.snapshot.paramMap.get("id");
        if (id == null) {
            this.router.navigate(["/"]);
        }

        const isMobile = window.matchMedia(
            "only screen and (max-width: 1024px)"
        ).matches;
        if (isMobile) {
            this.router.navigate(["/session", id, "overview"]);
        }

        await this.sessionService.get(id);
        this.isLoading = false;

        interact(".draggable").draggable({
            autoScroll: true,
            inertia: true,
            onstart: event => this.onTopicMoveStart(event),
            onmove: event => this.onTopicMove(event),
            onend: event => this.onTopicMoveEnd(event)
        });

        interact(".dropable").dropzone({
            accept: ".draggable",
            overlap: 0.5,
            ondrop: event => this.onTopicDrop(event),
            ondragenter: event => this.onDragEnter(event),
            ondragleave: event => this.onDragLeave(event)
        });
    }

    public ngOnDestroy() {
        (<any>interact(".draggable")).unset();
        (<any>interact(".dropable")).unset();
    }

    public navigateToOverview() {
        this.router.navigate([
            "session/",
            this.sessionService.currentSession.id,
            "overview"
        ]);
    }

    public showModal($event, name: string, parameter) {
        $event.stopPropagation();
        this.modalShown[name] = parameter;
    }

    public hideModal(name: string) {
        this.modalShown[name] = false;
    }

    public getOpenModal() {
        for (const key in this.modalShown) {
            if (this.modalShown[key] !== false) {
                return key;
            }
        }

        return null;
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

        if (element.parentElement == null) {
            return false;
        }

        return this.hasModalParent(element.parentElement);
    }

    private onTopicMoveStart(event) {
        event.target.style.width = "150px";
        event.target.style.height = "80px";

        this.pauseEvent(event);
    }

    private onTopicMoveEnd(event) {
        if (event.interaction.dropTarget == null) {
            this.updateTarget(
                document.querySelector(".topics-unassigned"),
                event.target
            );
        }
    }

    private onTopicMove(event) {
        const target = event.target,
            x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx,
            y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

        target.parentElement.style.zIndex = 9999;
        target.parentElement.style.position = "absolute";
        target.parentElement.style.width = "100%";
        target.parentElement.style.height = "100%";

        target.style.webkitTransform = target.style.transform =
            "translate(" + x + "px, " + y + "px)";

        target.setAttribute("data-x", x);
        target.setAttribute("data-y", y);

        this.pauseEvent(event);
    }

    private onTopicDrop(event) {
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
            this.updateTopicByElement(currentTopicElement);
            currentTopicElement.remove();
        }

        this.updateTarget(event.target, event.relatedTarget);
        event.target.classList.remove("drop-target");
    }

    private onDragEnter(event) {
        event.target.classList.add("drop-target");
    }

    private onDragLeave(event) {
        event.target.classList.remove("drop-target");
    }

    private updateTarget(container, target) {
        container.appendChild(target);
        this.updateTopicByElement(target);
        target.remove();

        this.resetTarget(target);
    }

    private resetTarget(target) {
        target.style.webkitTransform = target.style.transform = "";

        target.setAttribute("data-x", 0);
        target.setAttribute("data-y", 0);
    }

    private updateTopicByElement(element: Element) {
        const topic = this.getTopicByElement(element);
        topic.roomId = this.getElementRoom(element);
        topic.slotId = this.getElementSlot(element);

        this.sessionService.updateTopic(topic);
    }

    private getTopicByElement(element: Element): Topic {
        const id = element.getAttribute("id");
        return _.find(this.session.topics, { id });
    }

    private getElementSlot(element: Element) {
        try {
            const parent = element.parentElement.parentElement;
            return parent.getAttribute("id");
        } catch {
            return null;
        }
    }

    private getElementRoom(element: Element) {
        try {
            const parent = element.parentElement.parentElement;
            const index = _.indexOf(parent.children, element.parentElement);
            return document
                .querySelector(".session-table thead tr")
                .children[index].getAttribute("id");
        } catch {
            return null;
        }
    }

    public getTopics(slotId: string, roomId: string) {
        return _.filter(this.session.topics, { slotId, roomId });
    }

    public toggleFloatingActionButton($event) {
        $event.stopPropagation();
        this.floatingActionButton.nativeElement.expanded = !this
            .floatingActionButton.nativeElement.expanded;
    }

    private pauseEvent(e) {
        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();
        e.cancelBubble = true;
        e.returnValue = false;
        return false;
    }
}
