import { describe, it, expect } from "vitest";
import { TASK_CONFIG, type AiTask } from "./models";

describe("TASK_CONFIG", () => {
  const tasks: AiTask[] = ["email", "clauses", "contract", "analysis"];

  it("defines every task", () => {
    for (const t of tasks) expect(TASK_CONFIG[t]).toBeDefined();
  });

  it("assigns positive credits and tokens to every task", () => {
    for (const t of tasks) {
      expect(TASK_CONFIG[t].credits).toBeGreaterThan(0);
      expect(TASK_CONFIG[t].maxTokens).toBeGreaterThan(0);
    }
  });

  it("prices analysis as the most expensive action (the costly operation)", () => {
    expect(TASK_CONFIG.analysis.credits).toBeGreaterThan(TASK_CONFIG.email.credits);
    expect(TASK_CONFIG.analysis.credits).toBeGreaterThanOrEqual(TASK_CONFIG.contract.credits);
  });
});
