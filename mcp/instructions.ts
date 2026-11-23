export const MCP_INSTRUCTIONS = `Bug Board is a local bug triage board. Use it to file, search, update, and prioritize bugs.

How to file a bug:
1. Search with list_bugs (or get_board_summary) first to avoid duplicates.
2. Set severity from the impact rubric, effort from the estimate rubric, and category from the fixed category list.
3. Use create_bug for one bug, create_bugs for a batch (up to 50).
4. Always pass effort. The board's effort x severity priority matrix depends on it.
5. Read the bugboard://guidelines resource for the full severity, effort, and category rubric before your first write.

Conventions:
- Severity is the gain axis: critical (4) > high (3) > medium (2) > low (1).
- Effort is 1 (trivial, <30 min) to 5 (epic, 1+ week). Low effort = 1-2.
- Quick wins = high/critical severity & effort 1-2. Prioritize these.
- Use get_next_bugs to recommend what to fix first.
- Use update_bug to change status or correct classifications. Set status "fixed" only when the user says it is resolved.
- delete_bug permanently removes data; only call it when the user explicitly asks.

Keep reports grounded in what the user shared. Do not invent reproduction steps; add them only when provided.`;
