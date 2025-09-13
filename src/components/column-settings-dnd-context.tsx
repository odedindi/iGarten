"use client";

import { type FC, type PropsWithChildren, useRef } from "react";

import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    type ScreenReaderInstructions,
    TouchSensor,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragCancelEvent,
} from "@dnd-kit/core";

import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

const screenReaderInstructions: ScreenReaderInstructions = {
    draggable: `
    To pick up a sortable item, press the space bar.
    While sorting, use the arrow keys to move the item.
    Press space again to drop the item in its new position, or press escape to cancel.
  `,
};

interface ColumnSettingsDndContextProps {
    onDragCancel: (event: DragCancelEvent) => void;
    onDragEnd: (dragEndEvent: DragEndEvent) => void;
    onDragStart: (event: DragStartEvent) => void;
}

export const ColumnSettingsDndContext: FC<
    PropsWithChildren<ColumnSettingsDndContextProps>
> = ({ children, onDragCancel, onDragEnd, onDragStart }) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { delay: 200, tolerance: 5 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 200, tolerance: 5 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const isFirstAnnouncement = useRef(true);

    return (
        <DndContext
            accessibility={{
                announcements: {
                    onDragStart({ active: { id, data } }) {
                        const item = data.current
                            ? data.current.sortable.items[
                                  data.current.sortable.index
                              ]
                            : "unknown";
                        return `Picked up sortable item ${String(id)}. Sortable item ${item} [id:${id}]`;
                    },
                    onDragOver({ active, over }) {
                        // In this specific use-case, the picked up item's `id` is always the same as the first `over` id.
                        // The first `onDragOver` event therefore doesn't need to be announced, because it is called
                        // immediately after the `onDragStart` announcement and is redundant.
                        if (isFirstAnnouncement.current === true) {
                            isFirstAnnouncement.current = false;
                            return;
                        }

                        if (over) {
                            const item = active.data.current
                                ? active.data.current.sortable.items[
                                      active.data.current.sortable.index
                                  ]
                                : "unknown";
                            return `Sortable item ${item} [id: ${active.id}] was moved into position id [${over.id}]`;
                        }

                        return;
                    },
                    onDragEnd({ active, over }) {
                        if (over) {
                            const item = active.data.current
                                ? active.data.current.sortable.items[
                                      active.data.current.sortable.index
                                  ]
                                : "unknown";
                            return `Sortable item ${item} [id: ${active.id}] was dropped at position id [${over.id}]`;
                        }

                        return;
                    },
                    onDragCancel() {
                        return "Sorting was cancelled.";
                    },
                },
                screenReaderInstructions,
            }}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragCancel={onDragCancel}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            modifiers={[restrictToVerticalAxis]}
        >
            {children}
        </DndContext>
    );
};
