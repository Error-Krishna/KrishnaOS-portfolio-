import { useEffect, useMemo, useState } from "react";

interface Contribution {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ApiResponse {
  total: {
    lastYear?: number;
    [key: string]: number | undefined;
  };
  contributions: Contribution[];
}

interface GitHubContributionGraphProps {
  username: string;
}

const CELL_SIZE = 10;
const CELL_GAP = 3;

const LEVEL_CLASSES = [
  "bg-[color:var(--color-os-glass-border)]",
  "bg-emerald-950",
  "bg-emerald-700",
  "bg-emerald-500",
  "bg-emerald-400",
];

function parseDate(date: string) {
  return new Date(`${date}T00:00:00`);
}

function getSunday(date: Date) {
  const result = new Date(date);
  result.setDate(result.getDate() - result.getDay());
  return result;
}

function getSaturday(date: Date) {
  const result = new Date(date);
  result.setDate(result.getDate() + (6 - result.getDay()));
  return result;
}

function formatMonth(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
  });
}

export function GitHubContributionGraph({
  username,
}: GitHubContributionGraphProps) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(
            username,
          )}?y=last`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = (await response.json()) as ApiResponse;

        setContributions(result.contributions ?? []);
        setTotal(result.total?.lastYear ?? 0);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        console.error("GitHub contribution graph error:", err);
        setError(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => controller.abort();
  }, [username]);

  const { weeks, months } = useMemo(() => {
    if (!contributions.length) {
      return {
        weeks: [] as (Contribution | null)[][],
        months: [] as { label: string; column: number }[],
      };
    }

    const contributionMap = new Map(
      contributions.map((contribution) => [contribution.date, contribution]),
    );

    const firstDate = parseDate(contributions[0].date);
    const lastDate = parseDate(contributions[contributions.length - 1].date);

    const start = getSunday(firstDate);
    const end = getSaturday(lastDate);

    const result: (Contribution | null)[][] = [];

    const cursor = new Date(start);

    while (cursor <= end) {
      const week: (Contribution | null)[] = [];

      for (let day = 0; day < 7; day += 1) {
        const dateKey = cursor.toISOString().slice(0, 10);

        week.push(contributionMap.get(dateKey) ?? null);

        cursor.setDate(cursor.getDate() + 1);
      }

      result.push(week);
    }

    const monthLabels: { label: string; column: number }[] = [];
    let previousMonth = -1;

    result.forEach((week, column) => {
      const firstVisibleDay = week.find(Boolean);

      if (!firstVisibleDay) return;

      const date = parseDate(firstVisibleDay.date);
      const month = date.getMonth();

      if (month !== previousMonth) {
        monthLabels.push({
          label: formatMonth(date),
          column,
        });

        previousMonth = month;
      }
    });

    return {
      weeks: result,
      months: monthLabels,
    };
  }, [contributions]);

  if (loading) {
    return (
      <div className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] p-os-3">
        <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">
          Loading GitHub activity…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] p-os-3">
        <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">
          Unable to load GitHub activity.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] p-os-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-medium text-[color:var(--color-os-text-secondary)]">
          {total.toLocaleString()} contributions in the last year
        </span>

        <span className="text-[10px] text-[color:var(--color-os-text-secondary)]">
          GitHub
        </span>
      </div>

      <div className="overflow-x-auto pb-1">
        <div
          className="relative"
          style={{
            width: weeks.length * (CELL_SIZE + CELL_GAP) - CELL_GAP,
            minWidth: "100%",
            paddingTop: 18,
          }}
        >
          {/* Month labels */}
          <div
            className="absolute left-0 top-0 h-4"
            style={{
              width: weeks.length * (CELL_SIZE + CELL_GAP),
            }}
          >
            {months.map((month) => (
              <span
                key={`${month.label}-${month.column}`}
                className="absolute text-[9px] text-[color:var(--color-os-text-secondary)]"
                style={{
                  left: month.column * (CELL_SIZE + CELL_GAP),
                }}
              >
                {month.label}
              </span>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((day, dayIndex) => {
                  if (!day) {
                    return (
                      <div
                        key={`empty-${weekIndex}-${dayIndex}`}
                        className="h-[10px] w-[10px]"
                      />
                    );
                  }

                  return (
                    <div
                      key={day.date}
                      title={`${day.count} contribution${
                        day.count === 1 ? "" : "s"
                      } · ${day.date}`}
                      className={`h-[10px] w-[10px] rounded-[2px] ${
                        LEVEL_CLASSES[day.level]
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end gap-1">
        <span className="mr-1 text-[9px] text-[color:var(--color-os-text-secondary)]">
          Less
        </span>

        {LEVEL_CLASSES.map((className, index) => (
          <span
            key={index}
            className={`h-[9px] w-[9px] rounded-[2px] ${className}`}
          />
        ))}

        <span className="ml-1 text-[9px] text-[color:var(--color-os-text-secondary)]">
          More
        </span>
      </div>
    </div>
  );
}
