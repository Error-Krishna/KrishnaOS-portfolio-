import { useCallback, useEffect, useRef, useState } from 'react';

export type HotReloadPhase =
  | 'idle'
  | 'debouncing'
  | 'building'
  | 'stopping'
  | 'restarting'
  | 'running'
  | 'failed';

export interface HotReloadEvent {
  id: number;
  timestamp: string;
  message: string;
  kind: 'info' | 'success' | 'warning' | 'error';
}

const DEBOUNCE_MS = 700;
const BUILD_MS = 900;
const STOP_MS = 500;
const RESTART_MS = 500;

export function useHotReloadRuntime() {
  const [phase, setPhase] = useState<HotReloadPhase>('running');
  const [events, setEvents] = useState<HotReloadEvent[]>([]);
  const [changedFile, setChangedFile] = useState<string | null>(null);

  const eventId = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addTimer = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      timers.current = timers.current.filter((item) => item !== timer);
      callback();
    }, delay);

    timers.current.push(timer);
    return timer;
  }, []);

  const addEvent = useCallback(
    (
      message: string,
      kind: HotReloadEvent['kind'] = 'info',
    ) => {
      const id = ++eventId.current;

      setEvents((current) => [
        ...current.slice(-29),
        {
          id,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          message,
          kind,
        },
      ]);
    },
    [],
  );

  const restartProcess = useCallback(() => {
    setPhase('stopping');
    addEvent('Stopping running process…', 'warning');

    addTimer(() => {
      setPhase('restarting');
      addEvent('Starting process with rebuilt artifacts…');

      addTimer(() => {
        setPhase('running');
        addEvent('Process restarted successfully.', 'success');
      }, RESTART_MS);
    }, STOP_MS);
  }, [addEvent, addTimer]);

  const build = useCallback(
    (file: string) => {
      setPhase('building');
      addEvent(`Building after change in ${file}…`);

      addTimer(() => {
        addEvent('Build completed successfully.', 'success');
        restartProcess();
      }, BUILD_MS);
    },
    [addEvent, addTimer, restartProcess],
  );

  const changeFile = useCallback(
    (file: string) => {
      setChangedFile(file);
      addEvent(`Detected change: ${file}`);

      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
      }

      setPhase('debouncing');
      addEvent(`Debouncing filesystem events (${DEBOUNCE_MS}ms)…`);

      debounceTimer.current = window.setTimeout(() => {
        debounceTimer.current = null;
        build(file);
      }, DEBOUNCE_MS);
    },
    [addEvent, build],
  );

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }

      timers.current.forEach((timer) => {
        window.clearTimeout(timer);
      });

      timers.current = [];
    };
  }, []);

  return {
    phase,
    events,
    changedFile,
    changeFile,
    clearEvents,
  };
}
