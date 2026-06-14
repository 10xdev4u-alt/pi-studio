import Database from "better-sqlite3";
import { runMigrations } from "./migrations.js";
import type { Run, RunStatus, RunSummary } from "@pi-studio/shared";

export interface PiStudioDatabase {
  insertRun(run: Run): void;
  updateRun(id: string, patch: Partial<Omit<Run, "id">>): void;
  getRun(id: string): Run | null;
  listRuns(filter?: { status?: RunStatus; limit?: number }): RunSummary[];
  close(): void;
}

export async function createDatabase(path: string): Promise<PiStudioDatabase> {
  const db = new Database(path);
  runMigrations(db);

  const insertStmt = db.prepare(`
    INSERT INTO runs (id, task, status, started_at, ended_at, cwd, total_input, total_output, total_cost, agent_count, error_message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const getStmt = db.prepare(`SELECT * FROM runs WHERE id = ?`);
  const listAllStmt = db.prepare(`
    SELECT id, task, status, started_at, total_cost, agent_count,
           COALESCE(ended_at, started_at) - started_at AS duration
    FROM runs
    ORDER BY started_at DESC
    LIMIT ?
  `);
  const listByStatusStmt = db.prepare(`
    SELECT id, task, status, started_at, total_cost, agent_count,
           COALESCE(ended_at, started_at) - started_at AS duration
    FROM runs WHERE status = ?
    ORDER BY started_at DESC
    LIMIT ?
  `);

  return {
    insertRun(run) {
      insertStmt.run(
        run.id,
        run.task,
        run.status,
        run.startedAt,
        run.endedAt ?? null,
        run.cwd ?? null,
        run.totalInput,
        run.totalOutput,
        run.totalCost,
        run.agentCount,
        run.errorMessage ?? null,
      );
    },
    updateRun(id, patch) {
      const entries = Object.entries(patch);
      if (entries.length === 0) return;
      const setClause = entries.map(([k]) => `${camelToSnake(k)} = ?`).join(", ");
      const values = entries.map(([, v]) => v);
      db.prepare(`UPDATE runs SET ${setClause} WHERE id = ?`).run(...values, id);
    },
    getRun(id) {
      const row = getStmt.get(id) as Record<string, unknown> | undefined;
      return row ? rowToRun(row) : null;
    },
    listRuns(filter) {
      const limit = filter?.limit ?? 100;
      const rows = filter?.status
        ? (listByStatusStmt.all(filter.status, limit) as Record<string, unknown>[])
        : (listAllStmt.all(limit) as Record<string, unknown>[]);
      return rows.map(rowToRunSummary);
    },
    close() {
      db.close();
    },
  };
}

function rowToRun(row: Record<string, unknown>): Run {
  return {
    id: row.id as string,
    task: row.task as string,
    status: row.status as RunStatus,
    startedAt: row.started_at as number,
    endedAt: (row.ended_at as number) ?? undefined,
    cwd: (row.cwd as string) ?? undefined,
    totalInput: row.total_input as number,
    totalOutput: row.total_output as number,
    totalCost: row.total_cost as number,
    agentCount: row.agent_count as number,
    errorMessage: (row.error_message as string) ?? undefined,
  };
}

function rowToRunSummary(row: Record<string, unknown>): RunSummary {
  return {
    id: row.id as string,
    task: row.task as string,
    status: row.status as RunStatus,
    duration: row.duration as number,
    cost: row.total_cost as number,
    agentCount: row.agent_count as number,
    startedAt: row.started_at as number,
  };
}

function camelToSnake(s: string): string {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}
