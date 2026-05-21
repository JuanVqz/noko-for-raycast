# Feature Ideas

Ordered from most to least useful.

---

## 1. Confirmation modal for discard and reset -- [PR #95](https://github.com/JuanVqz/noko-for-raycast/pull/95)

Destructive actions (discard timer, reset timer) should ask for confirmation before proceeding. Use Raycast's `confirmAlert` -- no custom UI needed.

**Why:** easy to fat-finger, time is lost with no undo.

---

## 2. Show approved / locked by in entry list -- [PR #93](https://github.com/JuanVqz/noko-for-raycast/pull/93)

`entry.approved_by` and `entry.approved_at` are already in the type. Show "Approved by X" and a lock icon on the entry item. Makes it clear which entries can still be edited.

---

## 3. Daily breakdown below the week total -- [PR #97](https://github.com/JuanVqz/noko-for-raycast/pull/97)

Entries summary already shows the week total. Add a row per day (Mon--Sun) showing hours logged that day. Cross-reference `useWeekEntries` data which is already fetched.

---

## 4. Discard timer then create entry on a different project (log timer flow) -- :white_check_mark: Done ([PR #91](https://github.com/JuanVqz/noko-for-raycast/pull/91))

Already implemented. When the user changes the project dropdown before logging a timer, the timer on the original project is discarded and the entry is created on the selected project via `POST /entries`.

---

## 5. Project list filter toggle -- [PR #98](https://github.com/JuanVqz/noko-for-raycast/pull/98)

Add a dropdown to the project/timer list to filter by: Active / Archived / All. Maps directly to the `enabled=true/false` API param already in use. Same pattern as the date filter in entries.

---

## 6. Sort projects by latest used -- [PR #101](https://github.com/JuanVqz/noko-for-raycast/pull/101)

Noko API has no "last used" field. Derive it by scanning recent entries from `GET /current_user/entries` and sorting projects by their most recent entry date. Adds one extra fetch but gives a much more relevant project order for frequent users.

---

## 7. Billable indicator on project list -- [PR #94](https://github.com/JuanVqz/noko-for-raycast/pull/94)

Show a `$` badge on projects that are billable. The `billing_increment` field is already in `ProjectType`. Could also show the billing increment value in the detail view.

---

## 8. Detail view on project list -- [PR #100](https://github.com/JuanVqz/noko-for-raycast/pull/100)

Expand project list items to show: billing increment, color swatch, enabled status, time logged this week (cross-referenced from week entries).

---

## 9. Duplicate entry action -- [PR #96](https://github.com/JuanVqz/noko-for-raycast/pull/96)

Add a "Duplicate" action (cmd+D) on saved entries. Copies project, description, and tags to a new entry form with today's date pre-filled. Useful for repeating daily tasks.

---

## 10. Quick-copy entry description -- [PR #92](https://github.com/JuanVqz/noko-for-raycast/pull/92)

Add a "Copy Description" action (cmd+C) on entry list items. One keystroke to grab the description for use elsewhere.

---

## 11. Timer elapsed time auto-refresh -- :white_check_mark: Done

The elapsed time display goes stale if the user leaves the timers view open. Already implemented via `useElapsedTime` hook with a 1s `setInterval` for running timers.

---

## 12. Weekly time goal indicator -- [PR #99](https://github.com/JuanVqz/noko-for-raycast/pull/99)

Show progress toward a configurable weekly hour target (e.g. 40h) in the entries summary. Stored in Raycast preferences as `weeklyGoalHours`.
