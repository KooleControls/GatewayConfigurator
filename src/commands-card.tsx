import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "./components/ui/textarea";
import { commandsStore, useCommandsStore } from "./store/commands-store";
import { matchesCommandQuery } from "@/lib/command-search";

function getLineFromPosition(text: string, position: number): number {
    return text.slice(0, position).split(/\r?\n/).length - 1;
}

type LineFlash = {
    id: number;
    line: number;
};

type OverlayMetrics = {
    top: number;
    height: number;
};

type TextareaLayout = {
    lineHeight: number;
    paddingTop: number;
    scrollTop: number;
};



function parseCommandKey(line: string) {
    const [, command = ""] = line.match(/^([A-Z]+)(.*)$/) ?? [];
    return command;
}

export function CommandsCard({ searchQuery = "" }: { searchQuery?: string })
{
    const { commandText, lastChange } = useCommandsStore();
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [lineFlash, setLineFlash] = useState<LineFlash | null>(null);
    const [overlayMetrics, setOverlayMetrics] = useState<OverlayMetrics | null>(null);
    const [textareaLayout, setTextareaLayout] = useState<TextareaLayout>({
        lineHeight: 20,
        paddingTop: 0,
        scrollTop: 0,
    });

    const unmatchedLineIndexes = useMemo(() => {
        const normalizedSearchQuery = searchQuery.trim();

        if (!normalizedSearchQuery) {
            return [];
        }

        return commandText
            .split(/\r?\n/)
            .map((line, index) => {
                const commandKey = parseCommandKey(line.trim());

                if (!commandKey || matchesCommandQuery(commandKey, normalizedSearchQuery)) {
                    return null;
                }

                return index;
            })
            .filter((index): index is number => index !== null);
    }, [commandText, searchQuery]);

    const updateTextareaLayout = () => {
        const textarea = textareaRef.current;

        if (!textarea) {
            return;
        }

        const style = window.getComputedStyle(textarea);
        const fontSize = Number.parseFloat(style.fontSize) || 14;
        const lineHeight = Number.parseFloat(style.lineHeight) || fontSize * 1.4;
        const paddingTop = Number.parseFloat(style.paddingTop) || 0;

        setTextareaLayout({
            lineHeight,
            paddingTop,
            scrollTop: textarea.scrollTop,
        });
    };

    const updateOverlayMetrics = (line: number) => {
        const textarea = textareaRef.current;

        if (!textarea) {
            return;
        }

        const style = window.getComputedStyle(textarea);
        const fontSize = Number.parseFloat(style.fontSize) || 14;
        const lineHeight = Number.parseFloat(style.lineHeight) || fontSize * 1.4;
        const paddingTop = Number.parseFloat(style.paddingTop) || 0;

        setOverlayMetrics({
            top: paddingTop + line * lineHeight - textarea.scrollTop,
            height: lineHeight,
        });

        setTextareaLayout({
            lineHeight,
            paddingTop,
            scrollTop: textarea.scrollTop,
        });
    };

    useEffect(() => {
        updateTextareaLayout();
    }, []);

    useEffect(() => {
        if (!lastChange || lastChange.textLine === null) {
            return;
        }

        setLineFlash({ id: lastChange.id, line: lastChange.textLine });
    }, [lastChange]);

    useEffect(() => {
        if (!lineFlash) {
            return;
        }

        const frame = window.requestAnimationFrame(() => {
            updateOverlayMetrics(lineFlash.line);
        });
        const timeout = window.setTimeout(() => {
            setLineFlash(null);
            setOverlayMetrics(null);
        }, 2000);

        return () => {
            window.cancelAnimationFrame(frame);
            window.clearTimeout(timeout);
        };
    }, [lineFlash]);


    return (
        <Card className="h-full min-h-[18rem]">
            <CardContent className="flex h-full min-h-0">
                <div className="relative h-full min-h-0 w-full overflow-hidden">
                    {lineFlash && overlayMetrics ? (
                        <div
                            className="command-line-flash pointer-events-none absolute inset-x-2 z-20 rounded-sm"
                            style={{
                                top: `${overlayMetrics.top}px`,
                                height: `${overlayMetrics.height}px`,
                            }}
                        />
                    ) : null}
                    {unmatchedLineIndexes.map((lineIndex) => (
                        <div
                            key={lineIndex}
                            className="pointer-events-none absolute inset-x-2 z-[15] rounded-sm bg-background/55"
                            style={{
                                top: `${textareaLayout.paddingTop + lineIndex * textareaLayout.lineHeight - textareaLayout.scrollTop}px`,
                                height: `${textareaLayout.lineHeight}px`,
                            }}
                        />
                    ))}
                <Textarea
                    ref={textareaRef}
                    value={commandText}
                    onChange={(event) => {
                        const cursor = event.target.selectionStart ?? event.target.value.length;
                        const editedLine = getLineFromPosition(event.target.value, cursor);

                        commandsStore.setCommandsFromText(event.target.value, editedLine);
                        updateTextareaLayout();
                    }}
                    onScroll={() => {
                        updateTextareaLayout();

                        if (!lineFlash) {
                            return;
                        }

                        updateOverlayMetrics(lineFlash.line);
                    }}
                    className="relative z-10 h-full min-h-0 overflow-auto"
                />
                </div>
            </CardContent>
        </Card>
    ); 
};


