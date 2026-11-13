import "./style.css";
import {
  STORAGE_KEY,
  members,
  member,
  money,
  localDate,
  loadState,
  splitExpense,
  balances,
  settlements,
  workload,
} from "./model.js";
import { icon, logo, avatar, houseIllustration } from "./visuals.js";

let state = loadState();
let view = "overview";
let taskFilter = "all";
let expenseFilter = "all";
let notificationsOpen = false;
let lastFocus;
const app = document.querySelector("#app");
const overlay = document.querySelector("#overlay-root");
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const personName = (id) => (id === "alex" ? "You" : member(id).name);
const button = (label, action, kind = "primary", extra = "") =>
  `<button class="btn btn-${kind}" data-action="${action}" ${extra}>${label}</button>`;
const empty = (heading, text, symbol = "check") =>
  `<div class="empty-state"><span class="empty-icon">${icon(symbol)}</span><h3>${heading}</h3><p>${text}</p></div>`;

function dateLabel(date) {
  if (date === localDate()) return "Today";
  if (date === localDate(1)) return "Tomorrow";
  if (date === localDate(-1)) return "Yesterday";
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
function dueLabel(task) {
  if (task.done) return '<span class="due done-label">Completed</span>';
  const overdue = task.due < localDate();
  return `<span class="due ${overdue ? "overdue" : task.due === localDate() ? "today" : ""}">${overdue ? "Overdue · " : ""}${dateLabel(task.due)}</span>`;
}
function save(message) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    toast(
      "Storage is unavailable. Changes will last for this visit only.",
      true,
    );
  }
  render();
  if (message) toast(message);
}
function addActivity(text, type = "check") {
  state.activity.unshift({
    id: crypto.randomUUID(),
    text,
    time: Date.now(),
    icon: type,
  });
  state.activity = state.activity.slice(0, 30);
}
let toastTimer;
function toast(message, warning = false) {
  const root = document.querySelector("#toast-root");
  root.innerHTML = `<div class="toast ${warning ? "warning" : ""}">${icon(warning ? "info" : "check")}<span>${esc(message)}</span></div>`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    root.innerHTML = "";
  }, 4200);
}

function sidebar() {
  const openCount = state.tasks.filter((task) => !task.done).length;
  return `<aside class="sidebar">
    <a class="brand" href="#overview" aria-label="Fairshare home">${logo}<span>fairshare<span class="brand-dot">.</span></span></a>
    <div class="house-switch" role="group" aria-label="Current household">
      <span class="house-mini">${icon("home")}</span><div><strong>${esc(state.houseName)}</strong><span>Our little corner of the world</span></div>
    </div>
    <span class="nav-label">YOUR SHARED SPACE</span>
    <nav aria-label="Main navigation">
      ${[
        ["overview", "grid", "Overview"],
        ["chores", "chores", "Chores"],
        ["expenses", "wallet", "Expenses"],
        ["household", "people", "Our household"],
      ]
        .map(
          ([id, symbol, title]) =>
            `<a href="#${id}" class="nav-item ${view === id ? "active" : ""}" ${view === id ? 'aria-current="page"' : ""}>${icon(symbol)}<span>${title}</span>${id === "chores" ? `<span class="nav-count">${openCount}</span>` : ""}</a>`,
        )
        .join("")}
    </nav>
    <div class="sidebar-note"><div class="note-doodle">${icon("heart")}<span class="doodle-line"></span></div><h3>A home is a team sport.</h3><p>Little things add up.<br>Especially when we share them.</p><button class="text-link" data-action="fairness-info">The Fairshare way ${icon("arrow")}</button></div>
    <div class="sidebar-bottom"><button class="profile-button" data-action="house-settings">${avatar(member("alex"))}<span><strong>Alex Morgan</strong><small>Feeling right at home</small></span>${icon("down")}</button><span class="prototype-label">Made for your everyday together.</span></div>
  </aside>`;
}

function topbar() {
  const names = {
    overview: "Overview",
    chores: "Chores",
    expenses: "Expenses",
    household: "Our household",
  };
  return `<header class="topbar"><div class="breadcrumb">${icon("home")}<span>${esc(state.houseName)}</span><span class="slash">/</span><strong>${names[view]}</strong></div><div class="topbar-right"><span class="local-status"><i></i> A little more in sync</span><div class="notification-wrap"><button class="icon-btn notification-btn ${notificationsOpen ? "selected" : ""}" data-action="notifications" aria-label="Household activity" aria-expanded="${notificationsOpen}">${icon("bell")}<span class="notification-dot"></span></button>${notificationsOpen ? activityPopover() : ""}</div><button class="avatar-button" data-action="house-settings" aria-label="Your household profile">${avatar(member("alex"))}</button></div></header>`;
}
function activityPopover() {
  return `<section class="activity-popover" aria-label="Recent household activity"><div class="popover-heading"><h3>Around the house</h3><button class="icon-btn" data-action="notifications" aria-label="Close activity">${icon("close")}</button></div>${state.activity
    .slice(0, 5)
    .map(
      (item) =>
        `<div class="activity-item"><span class="activity-symbol">${icon(item.icon)}</span><div><p>${esc(item.text)}</p><small>${new Date(item.time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</small></div></div>`,
    )
    .join(
      "",
    )}<p class="popover-foot">Your household’s little wins, all in one place.</p></section>`;
}
function pageHeading(title, subtitle, actionLabel, action, symbol = "plus") {
  return `<div class="page-heading"><div><h1>${title}</h1><p>${subtitle}</p></div><div class="heading-actions">${view === "overview" ? `<span class="date-label">${icon("calendar")} ${new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>` : ""}${button(`${icon(symbol)} ${actionLabel}`, action)}</div></div>`;
}
function hero() {
  return `<section class="hero"><div class="hero-copy"><span class="eyebrow">${icon("sparkles")} LESS NAGGING. MORE LIVING.</span><h2>Less keeping score.<br>More feeling at home.</h2><p>Chores, costs, and all the little things.<br>Finally, on the same page.</p><div class="hero-housemates"><div class="avatar-stack">${members.map((p) => avatar(p, "sm")).join("")}</div><span>Four housemates. <strong>One happy place.</strong></span></div></div>${houseIllustration}<span class="hero-caption">A little effort, a lot of together.</span></section>`;
}
function metricCards() {
  const fair = workload(state);
  const completed = state.tasks.filter((task) => task.done).length;
  const total = state.tasks.length;
  const balance = balances(state).alex;
  return `<section class="metrics" aria-label="Household at a glance">
    <article class="metric-card"><div class="metric-heading"><span class="metric-icon sage">${icon("heart")}</span><h3>Household balance</h3><button class="info-btn" data-action="fairness-info" aria-label="How household balance is calculated">${icon("info")}</button></div><div class="metric-value">${fair.score}<span class="value-suffix">/ 100</span><span class="status-pill">${fair.score >= 80 ? "Looking good" : fair.score >= 60 ? "Getting there" : "Room to rebalance"} ${icon("sparkles")}</span></div><div class="balance-meter" aria-hidden="true">${Array.from({ length: 20 }, (_, i) => `<i class="${i < Math.round(fair.score / 5) ? "filled" : ""}"></i>`).join("")}</div><p>Fair shares make a happier home.</p></article>
    <article class="metric-card"><div class="metric-heading"><span class="metric-icon lilac">${icon("chores")}</span><h3>Chores this week</h3><span class="subtle-tag">Teamwork</span></div><div class="metric-value">${completed}<span class="value-suffix">/ ${total}</span><span class="metric-aside">done & dusted</span></div><div class="progress-track"><span style="width:${(completed / total) * 100}%"></span></div><p>${total - completed ? `Just ${total - completed} little things left. You’ve got this.` : "Everything’s done. Put your feet up."}</p></article>
    <article class="metric-card money-metric"><div class="metric-heading"><span class="metric-icon peach">${icon("wallet")}</span><h3>${balance >= 0 ? "You’re owed" : "Your share to settle"}</h3><span class="subtle-tag">All squared up?</span></div><div class="metric-value">${money(Math.abs(balance))}<button class="settle-link" data-action="settle">Settle up ${icon("arrow")}</button></div><div class="money-bottom"><span class="mini-people">${avatar(member("leo"), "xs")}${avatar(member("nina"), "xs")}</span><span>${balance === 0 ? "You’re all settled. Feels good, right?" : "A little less “I’ll get you back.”"}</span></div></article>
  </section>`;
}

function taskRow(task, full = false) {
  return `<div class="task-row ${task.done ? "is-done" : ""}" data-task-id="${task.id}"><button class="task-check ${task.done ? "checked" : ""}" data-action="toggle-task" data-id="${task.id}" aria-label="${task.done ? "Reopen" : "Complete"} ${esc(task.title)}" aria-pressed="${task.done}">${task.done ? icon("check") : ""}</button><div class="task-content"><span class="task-title">${esc(task.title)}</span><span class="task-meta">${icon(task.icon)} ${esc(task.room)}<span class="meta-dot">·</span>${esc(task.repeat)}${full ? `<span class="meta-dot">·</span>${task.points} effort pts` : ""}</span></div><div class="task-trailing">${dueLabel(task)}<label class="assignee-select" title="Assign ${esc(task.title)}">${avatar(member(task.assignee), "xs")}<select data-assign="${task.id}" aria-label="Assign ${esc(task.title)}">${members.map((person) => `<option value="${person.id}" ${task.assignee === person.id ? "selected" : ""}>${personName(person.id)}</option>`).join("")}</select>${icon("down")}</label>${full ? `<button class="icon-btn edit-task" data-action="edit-task" data-id="${task.id}" aria-label="Edit ${esc(task.title)}">${icon("chevron")}</button>` : ""}</div></div>`;
}
function taskTabs() {
  return `<div class="segmented" aria-label="Filter chores">${[
    ["all", "Everyone"],
    ["mine", "Assigned to me"],
    ["done", "Completed"],
  ]
    .map(
      ([id, label]) =>
        `<button class="${taskFilter === id ? "active" : ""}" data-action="task-filter" data-filter="${id}" aria-pressed="${taskFilter === id}">${label}</button>`,
    )
    .join("")}</div>`;
}
function filteredTasks() {
  return state.tasks.filter((task) =>
    taskFilter === "done"
      ? task.done
      : !task.done && (taskFilter !== "mine" || task.assignee === "alex"),
  );
}
function choresCard(full = false) {
  const tasks = filteredTasks();
  return `<section class="card chores-card"><div class="card-heading"><div><h2>${full ? "The shared to-do list" : "On the to-do"}</h2><p>Small things. Shared responsibility.</p></div><button class="text-link" data-action="add-chore">${icon("plus")} Add chore</button></div><div class="task-toolbar">${taskTabs()}<span class="tiny-label">${tasks.length} ${taskFilter === "done" ? "completed" : "to do"}</span></div><div class="task-list">${tasks.length ? (full ? tasks : tasks.slice(0, 4)).map((task) => taskRow(task, full)).join("") : empty(taskFilter === "done" ? "Your next little win is waiting." : "A well-earned breather.", taskFilter === "done" ? "Check off a chore and celebrate some teamwork." : "Nothing on this list. Enjoy a little more home time.")}</div>${!full ? `<a href="#chores" class="card-footer-link">View all chores ${icon("arrow")}</a>` : '<div class="card-note">' + icon("info") + " Effort points keep a 5-minute job from counting the same as a deep clean.</div>"}</section>`;
}
function fairnessCard(large = false) {
  const fair = workload(state);
  return `<section class="card fairness-card ${large ? "large" : ""}"><div class="card-heading"><div><span class="eyebrow">BETTER, TOGETHER</span><h2>Everyone’s pitching in.</h2><p>A clearer picture. A fairer share.</p></div><span class="fairness-bloom">${icon("sparkles")}</span></div><div class="share-stack" aria-label="Household effort shares">${fair.people.map((p) => `<span style="width:${(p.points / fair.total) * 100}%;background:${p.color}" title="${p.name}: ${p.points} points"></span>`).join("")}</div><div class="share-legend"><span>Weekly effort, fairly shared</span><span>${fair.total} pts</span></div><div class="member-shares">${fair.people.map((p) => `<div class="member-share">${avatar(p, "sm")}<span class="member-name">${p.name}${p.id === "alex" ? "<small> (you)</small>" : ""}</span><div class="member-track"><span style="width:${(p.points / Math.max(...fair.people.map((q) => q.points))) * 100}%;background:${p.ink}"></span></div><span class="member-points">${p.points}<small> pts</small></span></div>`).join("")}</div><div class="fairness-foot">${icon("heart")}<span>${fair.score >= 90 ? "That’s what a balanced team looks like." : "A little help makes a big difference."}</span><button class="info-btn" data-action="fairness-info" aria-label="Learn about effort points">${icon("info")}</button></div></section>`;
}

function expenseRow(expense, full = false) {
  const share = splitExpense(expense.cents, expense.participants).find(
    (p) => p.id === "alex",
  );
  return `<div class="expense-row"><span class="expense-category ${expense.category === "Utilities" ? "lilac" : expense.category === "Household" ? "blue" : "peach"}">${icon(expense.icon)}</span><div class="expense-content"><span class="expense-title">${esc(expense.title)}</span><span class="expense-meta">${personName(expense.paidBy)} paid<span class="meta-dot">·</span>${dateLabel(expense.date)}${full ? `<span class="meta-dot">·</span>${esc(expense.category)}` : ""}</span></div><div class="expense-amount"><strong>${money(expense.cents)}</strong><small>${full ? (share ? `${money(share.cents)} your share` : "Not in your split") : `Split ${expense.participants.length} ways`}</small></div>${full ? `<button class="icon-btn" data-action="expense-detail" data-id="${expense.id}" aria-label="View ${esc(expense.title)}">${icon("chevron")}</button>` : ""}</div>`;
}
function expensesCard(full = false) {
  const items =
    expenseFilter === "mine" && full
      ? state.expenses.filter((e) => e.paidBy === "alex")
      : state.expenses;
  return `<section class="card expenses-card"><div class="card-heading"><div><h2>${full ? "Every little shared cost" : "Recently chipped in"}</h2><p>No awkward reminders. Just the numbers.</p></div><button class="text-link" data-action="add-expense">${icon("plus")} Add expense</button></div>${full ? `<div class="task-toolbar"><div class="segmented"><button data-action="expense-filter" data-filter="all" class="${expenseFilter === "all" ? "active" : ""}">All expenses</button><button data-action="expense-filter" data-filter="mine" class="${expenseFilter === "mine" ? "active" : ""}">Paid by me</button></div><span class="tiny-label">${items.length} expenses</span></div>` : ""}<div class="expense-list">${items.length ? (full ? items : items.slice(0, 3)).map((e) => expenseRow(e, full)).join("") : empty("A clean slate.", "Your next shared expense will show up here.", "wallet")}</div>${!full ? `<a href="#expenses" class="card-footer-link">View shared expenses ${icon("arrow")}</a>` : ""}</section>`;
}
function requestCard() {
  const requests = state.requests.filter((r) => r.status !== "done");
  return `<section class="card requests-card"><div class="card-heading"><div><h2>A little ask</h2><p>Because asking should be easy.</p></div><button class="icon-btn add-request" data-action="add-request" aria-label="Add household request">${icon("plus")}</button></div><div class="requests-list">${
    requests.length
      ? requests
          .slice(0, view === "household" ? requests.length : 2)
          .map((request) => {
            const claimed = request.status === "claimed";
            const owner = claimed ? (request.claimedBy === "alex" ? "You’re" : `${personName(request.claimedBy)}’s`) : "";
            return `<article class="request-item"><div class="request-byline">${avatar(member(request.author), "xs")}<span>${personName(request.author)}<small> · ${dateLabel(request.date)}</small></span><span class="request-tag">${esc(request.category)}</span></div><h3>${esc(request.title)}</h3><p>${esc(request.note)}</p><button class="help-link ${claimed ? "claimed" : ""}" data-action="${claimed ? "finish-request" : "claim-request"}" data-id="${request.id}">${icon(claimed ? "check" : "heart")}${claimed ? `${owner} on it · Mark done` : "I can help with that"}</button></article>`;
          })
          .join("")
      : empty(
          "Nothing to ask, for now.",
          "Leave a note when your home could use a little help.",
          "message",
        )
  }</div></section>`;
}
function pageFoot() {
  return `<footer class="page-foot"><span>${icon("heart")} Not perfectly equal. Just a little more fair.</span><span>Made for life, together.</span></footer>`;
}
function overviewPage() {
  return `${pageHeading("Hey Alex, welcome home.", "A little teamwork goes a long way.", "Add something", "add-chore")}${hero()}${metricCards()}<div class="dashboard-grid"><div class="dashboard-column">${choresCard()}${expensesCard()}</div><div class="dashboard-column">${fairnessCard()}${requestCard()}</div></div>${pageFoot()}`;
}
function choresPage() {
  return `${pageHeading("A lighter load, together.", "Less “who’s doing that?” More getting it done.", "Add a chore", "add-chore")}<div class="section-intro sage"><span class="intro-icon">${icon("chores")}</span><div><strong>Many hands. A little less work.</strong><p>Assign chores, check off the little wins, and keep your household in balance.</p></div><span class="intro-stat">${state.tasks.filter((t) => !t.done).length}<small>left to share</small></span></div><div class="detail-grid"><div>${choresCard(true)}</div><div class="dashboard-column">${fairnessCard()}<div class="tip-card">${icon("sparkles")}<div><h3>Fair doesn’t mean identical.</h3><p>Some weeks are busy. Reassign a chore to someone with a little more room on their plate.</p></div></div></div></div>${pageFoot()}`;
}
function balanceCard() {
  const amounts = balances(state);
  return `<section class="card balances-card"><div class="card-heading"><div><h2>Who’s in the green?</h2><p>One clear balance for each housemate.</p></div>${icon("wallet")}</div>${members.map((p) => `<div class="balance-person">${avatar(p)}<span>${p.name}${p.id === "alex" ? "<small> (you)</small>" : ""}</span><div><strong class="${amounts[p.id] > 0 ? "positive" : amounts[p.id] < 0 ? "negative" : ""}">${amounts[p.id] === 0 ? money(0) : `${amounts[p.id] > 0 ? "+" : "−"}${money(Math.abs(amounts[p.id]))}`}</strong><small>${amounts[p.id] > 0 ? "is owed" : amounts[p.id] < 0 ? "to pay back" : "all settled"}</small></div></div>`).join("")}<div class="balance-card-bottom">${button("Let’s settle up " + icon("arrow"), "settle", "primary")}</div></section>`;
}
function expensesPage() {
  const total = state.expenses.reduce((sum, e) => sum + e.cents, 0);
  return `${pageHeading("Shared costs. Clear heads.", "The numbers, without the mental math.", "Log an expense", "add-expense")}<div class="expense-stats"><div><span>Shared expenses</span><strong>${money(total)}</strong><small>Across ${state.expenses.length} everyday moments</small></div><div><span>Your net balance</span><strong class="positive">${balances(state).alex >= 0 ? "+" : "−"}${money(Math.abs(balances(state).alex))}</strong><small>${balances(state).alex >= 0 ? "Coming back your way" : "Your part to pay back"}</small></div><div><span>Settled together</span><strong>${money(state.transfers.reduce((sum, t) => sum + t.cents, 0))}</strong><small>${state.transfers.length} recorded payments</small></div></div><div class="detail-grid"><div class="dashboard-column">${expensesCard(true)}${
    state.transfers.length
      ? `<section class="card"><div class="card-heading"><div><h2>All squared up</h2><p>Payments you’ve recorded together.</p></div></div>${[
          ...state.transfers,
        ]
          .reverse()
          .map(
            (t) =>
              `<div class="transfer-row"><span class="transfer-icon">${icon("check")}</span><div><strong>${personName(t.from)} paid ${personName(t.to).toLowerCase() === "you" ? "you" : member(t.to).name}</strong><small>${dateLabel(t.date)} · Recorded payment</small></div><b>${money(t.cents)}</b></div>`,
          )
          .join("")}</section>`
      : ""
  }</div><div class="dashboard-column">${balanceCard()}<div class="tip-card">${icon("info")}<div><h3>Good to know</h3><p>“Settle up” records a payment you’ve made outside Fairshare. No real money moves here.</p></div></div></div></div>${pageFoot()}`;
}
function householdPage() {
  const fair = workload(state);
  return `${pageHeading("Our kind of together.", `The people who make ${esc(state.houseName)} a home.`, "Leave a little ask", "add-request", "message")}<section class="household-banner"><div><span class="eyebrow">OUR SHARED SPACE</span><h2>${esc(state.houseName)}</h2><p>Different people. One place to belong.</p><button class="text-link" data-action="house-settings">Household details ${icon("arrow")}</button></div><div class="household-avatars">${members.map((p) => `<div>${avatar(p, "xl")}<strong>${p.name}</strong><small>${p.id === "alex" ? "That’s you" : "Housemate"}</small></div>`).join("")}</div></section><div class="detail-grid"><div class="dashboard-column">${fairnessCard(true)}<section class="card effort-explainer"><h2>A fair share, not a perfect score.</h2><p>Effort points reflect the size of a chore. Your weekly workload includes completed chores and the chores still assigned to you.</p><div class="effort-examples"><span>${icon("leaf")} Light lift <b>1–3 pts</b></span><span>${icon("basket")} Everyday effort <b>4–6 pts</b></span><span>${icon("sparkles")} Big energy <b>7–10 pts</b></span></div><p class="muted">${fair.total} effort points shared this week. An equal share would be ${Number((fair.total / members.length).toFixed(1))} points each — but fair can look different from week to week.</p></section></div><div>${requestCard()}</div></div>${pageFoot()}`;
}
function render() {
  const pages = {
    overview: overviewPage,
    chores: choresPage,
    expenses: expensesPage,
    household: householdPage,
  };
  app.innerHTML = `${sidebar()}<div class="main-shell">${topbar()}<main id="main-content">${pages[view]()}</main></div><nav class="mobile-nav" aria-label="Mobile navigation">${[
    ["overview", "grid", "Home"],
    ["chores", "chores", "Chores"],
    ["expenses", "wallet", "Expenses"],
    ["household", "people", "Household"],
  ]
    .map(
      ([id, symbol, name]) =>
        `<a href="#${id}" class="${view === id ? "active" : ""}" ${view === id ? 'aria-current="page"' : ""}>${icon(symbol)}<span>${name}</span></a>`,
    )
    .join("")}</nav>`;
}

function closeModal() {
  const dialog = overlay.querySelector("dialog");
  if (dialog) dialog.close();
  overlay.innerHTML = "";
  lastFocus?.focus();
}
function showModal(title, subtitle, content, type = "default") {
  lastFocus = document.activeElement;
  overlay.innerHTML = `<dialog class="modal modal-${type}" aria-labelledby="modal-title"><div class="modal-header"><div><span class="modal-eyebrow">A LITTLE MORE IN SYNC</span><h2 id="modal-title">${title}</h2><p>${subtitle}</p></div><button class="icon-btn" data-action="close-modal" aria-label="Close dialog">${icon("close")}</button></div>${content}</dialog>`;
  const dialog = overlay.querySelector("dialog");
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        closeModal();
    }
  });
  dialog.addEventListener("cancel", () => {
    overlay.innerHTML = "";
    lastFocus?.focus();
  });
  dialog.showModal();
}
function typeTabs(active) {
  return `<div class="modal-type-tabs">${[
    ["chore", "chores", "Chore"],
    ["expense", "wallet", "Expense"],
    ["request", "message", "Little ask"],
  ]
    .map(
      ([id, symbol, label]) =>
        `<button class="${id === active ? "active" : ""}" type="button" data-action="add-${id}">${icon(symbol)}${label}</button>`,
    )
    .join("")}</div>`;
}
const formError = '<div class="form-error" role="alert" hidden></div>';
function formFooter(label) {
  return `<div class="modal-footer"><button type="button" class="btn btn-secondary" data-action="close-modal">Not now</button><button type="submit" class="btn btn-primary">${label} ${icon("arrow")}</button></div>`;
}
function memberOptions(selected = "alex") {
  return members
    .map(
      (p) =>
        `<option value="${p.id}" ${selected === p.id ? "selected" : ""}>${p.name}${p.id === "alex" ? " (you)" : ""}</option>`,
    )
    .join("");
}
function openChore(id) {
  const task = state.tasks.find((t) => t.id === id);
  showModal(
    task ? "A little chore update." : "One less thing to remember.",
    task
      ? "Keep the plan working for everyone."
      : "Put it on the list. Share the load.",
    `<form id="chore-form" data-id="${task?.id || ""}">${!task ? typeTabs("chore") : ""}<div class="modal-body"><label class="field">What needs doing?<input name="title" placeholder="e.g. Give the kitchen a fresh start" required maxlength="90" value="${esc(task?.title || "")}" autofocus /></label><div class="form-row"><label class="field">Who’s on it?<select name="assignee">${memberOptions(task?.assignee)}</select></label><label class="field">When’s it due?<input type="date" name="due" value="${task?.due || localDate()}" required /></label></div><div class="form-row"><label class="field">Around the house<select name="room">${["Kitchen", "Living room", "Bathroom", "Balcony", "Whole house", "Other"].map((room) => `<option ${task?.room === room ? "selected" : ""}>${room}</option>`).join("")}</select></label><label class="field">How often?<select name="repeat">${["Just once", "Daily", "Weekly", "Monthly"].map((repeat) => `<option ${task?.repeat === repeat ? "selected" : ""}>${repeat}</option>`).join("")}</select></label></div><label class="field">Effort points <span class="field-hint">A light lift or a deeper clean?</span><div class="effort-picker">${[
      [2, "Light lift", "1–3 points"],
      [5, "Everyday", "4–6 points"],
      [8, "Big energy", "7–10 points"],
    ]
      .map(
        ([pts, label, hint]) =>
          `<label><input type="radio" name="points" value="${pts}" ${task ? (pts === (task.points <= 3 ? 2 : task.points <= 6 ? 5 : 8) ? "checked" : "") : pts === 5 ? "checked" : ""} /><span><strong>${label}</strong><small>${hint}</small></span></label>`,
      )
      .join(
        "",
      )}</div></label>${formError}</div>${formFooter(task ? "Save changes" : "Add to our to-do")}</form>`,
  );
}
function openExpense() {
  showModal(
    "A little cost, fairly shared.",
    "You cover it. We’ll handle the mental math.",
    `<form id="expense-form">${typeTabs("expense")}<div class="modal-body"><label class="field">What was it for?<input name="title" placeholder="e.g. The weekly grocery haul" maxlength="90" required autofocus /></label><div class="form-row"><label class="field">How much?<div class="money-input"><span>$</span><input name="amount" type="number" min="0.01" max="1000000" step="0.01" placeholder="0.00" required /></div></label><label class="field">Who paid?<select name="paidBy">${memberOptions()}</select></label></div><div class="form-row"><label class="field">Category<select name="category"><option>Groceries</option><option>Utilities</option><option>Household</option><option>Food & drinks</option><option>Other</option></select></label><label class="field">Date<input type="date" name="date" value="${localDate()}" required /></label></div><fieldset class="split-field"><legend>Split equally between</legend><div class="split-people">${members.map((p) => `<label><input type="checkbox" name="participants" value="${p.id}" checked /><span>${avatar(p)}<strong>${personName(p.id)}</strong><span class="person-check">${icon("check")}</span></span></label>`).join("")}</div><div class="split-preview" aria-live="polite">${icon("people")}<span>Four housemates. One fair split.</span></div></fieldset>${formError}</div>${formFooter("Log shared expense")}</form>`,
  );
}
function openRequest() {
  showModal(
    "A little ask goes a long way.",
    "There’s room for the small stuff, too.",
    `<form id="request-form">${typeTabs("request")}<div class="modal-body"><label class="field">What’s on your mind?<input name="title" placeholder="e.g. A hand with the new bookshelf?" maxlength="90" required autofocus /></label><label class="field">A little context<textarea name="note" rows="3" placeholder="Let your housemates know how they can help." maxlength="300" required></textarea></label><div class="form-row"><label class="field">What kind of ask?<select name="category"><option>A little help</option><option>Shopping</option><option>A house thing</option><option>A friendly reminder</option></select></label><label class="field">From<select name="author">${memberOptions()}</select></label></div><div class="form-info">${icon("heart")}<span>Small asks are welcome. That’s what housemates are for.</span></div>${formError}</div>${formFooter("Share with the house")}</form>`,
  );
}
function openSettlement() {
  const payments = settlements(state);
  showModal(
    "A clean slate feels good.",
    "Simple payments. One less thing on your mind.",
    `<div class="modal-body settlement-body"><div class="form-info">${icon("info")}<span>Record a payment made outside Fairshare. This prototype doesn’t transfer real money.</span></div>${payments.length ? `<div class="settlement-list">${payments.map((p) => `<div class="settlement-row"><div class="settlement-people">${avatar(member(p.from))}<span><strong>${personName(p.from)}</strong><small>pays ${personName(p.to).toLowerCase() === "you" ? "you" : member(p.to).name}</small></span></div><strong class="settlement-amount">${money(p.cents)}</strong><button class="btn btn-primary btn-small" data-action="record-payment" data-from="${p.from}" data-to="${p.to}" data-cents="${p.cents}">${icon("check")} Record paid</button></div>`).join("")}</div><p class="settlement-note">Only record a payment once it’s actually happened. Balances update for everyone.</p>` : empty("All square. All good.", "Everyone’s settled up. One less thing to think about.", "heart")}</div><div class="modal-footer"><span class="modal-local">${icon("home")} ${esc(state.houseName)}</span><button class="btn btn-secondary" data-action="close-modal">${payments.length ? "Done for now" : "Feels good"}</button></div>`,
    "settle",
  );
}
function openFairnessInfo() {
  const fair = workload(state);
  showModal(
    "Fair isn’t always fifty-fifty.",
    "It’s knowing the little things are being shared.",
    `<div class="modal-body fairness-explanation"><div class="explanation-score"><span>${fair.score}<small>/100</small></span><div><strong>Your household balance</strong><p>${fair.total} weekly effort points across ${members.length} housemates.</p></div></div><h3>Time and effort, made visible.</h3><p>A quick bin run isn’t the same as a deep clean. Chores get effort points, and everyone’s completed and assigned chores contribute to their weekly share.</p><h3>A score you can actually understand.</h3><p>100 means everyone has an equal share of the workload. The score falls as the shares become less even, reaching 0 if one person carries everything. Reassigning a chore changes the score right away.</p><div class="form-info">${icon("heart")}<span>Money stays separate. Covering the internet bill doesn’t cancel out doing the dishes.</span></div><p class="muted">This demo begins with 8 completed chores worth 68 effort points — find them in Chores → Completed. New chores join the current workload. Recurring labels are reminders, not automatic scheduling. All changes stay in this browser.</p></div><div class="modal-footer"><span class="modal-local">Not a competition. A conversation.</span><button class="btn btn-primary" data-action="close-modal">Makes sense ${icon("check")}</button></div>`,
  );
}
function openHouseSettings() {
  showModal(
    "The place we call home.",
    "A shared space, with your own little name.",
    `<form id="house-form"><div class="modal-body"><label class="field">Household name<input name="name" value="${esc(state.houseName)}" maxlength="40" required autofocus /></label><div class="house-member-list">${members.map((p) => `<div>${avatar(p)}<span><strong>${p.name}${p.id === "alex" ? " Morgan" : ""}</strong><small>${p.id === "alex" ? "You · Household member" : "Household member"}</small></span></div>`).join("")}</div><div class="form-info">${icon("info")}<span>An interactive local prototype. Changes are saved in this browser, not synced with real housemates.</span></div>${formError}</div>${formFooter("Save our space")}</form>`,
  );
}
function openExpenseDetail(id) {
  const expense = state.expenses.find((e) => e.id === id);
  if (!expense) return;
  showModal(
    esc(expense.title),
    `${personName(expense.paidBy)} paid ${money(expense.cents)} · ${dateLabel(expense.date)}`,
    `<div class="modal-body"><div class="expense-detail-total"><span class="expense-category peach">${icon(expense.icon)}</span><strong>${money(expense.cents)}</strong><span>${esc(expense.category)}</span></div><h3 class="split-heading">Everyone’s little share</h3>${splitExpense(
      expense.cents,
      expense.participants,
    )
      .map(
        (share) =>
          `<div class="split-detail-row">${avatar(member(share.id), "sm")}<span>${personName(share.id)}</span><strong>${money(share.cents)}</strong></div>`,
      )
      .join(
        "",
      )}<p class="settlement-note">Split equally. Any remainder cents go to the first housemates listed, so every cent is accounted for.</p></div><div class="modal-footer"><span class="modal-local">Clear numbers. Happier housemates.</span><button class="btn btn-primary" data-action="close-modal">Got it ${icon("check")}</button></div>`,
  );
}

function handleAction(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const { action, id, filter } = target.dataset;
  if (action === "close-modal") return closeModal();
  if (action === "add-chore") return openChore();
  if (action === "add-expense") return openExpense();
  if (action === "add-request") return openRequest();
  if (action === "edit-task") return openChore(id);
  if (action === "settle") return openSettlement();
  if (action === "fairness-info") return openFairnessInfo();
  if (action === "house-settings") return openHouseSettings();
  if (action === "expense-detail") return openExpenseDetail(id);
  if (action === "notifications") {
    notificationsOpen = !notificationsOpen;
    return render();
  }
  if (action === "task-filter") {
    taskFilter = filter;
    return render();
  }
  if (action === "expense-filter") {
    expenseFilter = filter;
    return render();
  }
  if (action === "toggle-task") {
    const task = state.tasks.find((t) => t.id === id);
    task.done = !task.done;
    if (task.requestId) {
      const request = state.requests.find((r) => r.id === task.requestId);
      if (request) request.status = task.done ? "done" : "claimed";
    }
    addActivity(
      `${personName(task.assignee)} ${task.done ? "completed" : "reopened"} “${task.title}”.`,
    );
    save(
      task.done
        ? "One less thing. A little more harmony."
        : "Back on the list. Life happens.",
    );
    document
      .querySelector(`[data-action="toggle-task"][data-id="${id}"]`)
      ?.focus();
    return;
  }
  if (action === "claim-request") {
    const request = state.requests.find((r) => r.id === id);
    if (request.status !== "open") return;
    request.status = "claimed";
    request.claimedBy = "alex";
    state.tasks.unshift({
      id: crypto.randomUUID(),
      title: request.title,
      room: "Whole house",
      icon: "heart",
      points: 3,
      assignee: "alex",
      due: localDate(),
      repeat: "Just once",
      done: false,
      requestId: request.id,
    });
    addActivity(`You offered to help with “${request.title}”.`, "heart");
    return save("You’re on it. Added to your to-do list.");
  }
  if (action === "finish-request") {
    const request = state.requests.find((r) => r.id === id);
    request.status = "done";
    const task = state.tasks.find((t) => t.requestId === id);
    if (task) task.done = true;
    addActivity(`${personName(request.claimedBy)} helped with “${request.title}”.`, "heart");
    return save("A little help. A big difference.");
  }
  if (action === "record-payment") {
    const current = settlements(state).find(
      (p) =>
        p.from === target.dataset.from &&
        p.to === target.dataset.to &&
        p.cents === Number(target.dataset.cents),
    );
    if (!current) {
      toast("That balance has changed. Here’s the latest.");
      return openSettlement();
    }
    state.transfers.push({
      ...current,
      id: crypto.randomUUID(),
      date: localDate(),
    });
    addActivity(
      `${personName(current.from)} paid ${personName(current.to)} ${money(current.cents)}.`,
      "wallet",
    );
    save("Payment recorded. A little more squared up.");
    return openSettlement();
  }
}
app.addEventListener("click", handleAction);
overlay.addEventListener("click", handleAction);
app.addEventListener("change", (event) => {
  const id = event.target.dataset.assign;
  if (!id) return;
  const task = state.tasks.find((t) => t.id === id);
  const assignee = event.target.value;
  if (!member(assignee)) return;
  task.assignee = assignee;
  if (task.requestId) {
    const request = state.requests.find((r) => r.id === task.requestId);
    if (request) request.claimedBy = assignee;
  }
  addActivity(`“${task.title}” is now on ${member(assignee).name}’s list.`);
  save(
    `${personName(assignee)}’${assignee === "alex" ? "re" : "s"} on it. Workload updated.`,
  );
});
overlay.addEventListener("input", (event) => {
  if (!event.target.closest("#expense-form")) return;
  const form = overlay.querySelector("#expense-form");
  const data = new FormData(form);
  const cents = Math.round(Number(data.get("amount")) * 100);
  const people = data.getAll("participants");
  const preview = form.querySelector(".split-preview span");
  if (!people.length) {
    preview.textContent = "Choose at least one housemate to share with.";
    return;
  }
  if (cents > 0 && Number.isSafeInteger(cents)) {
    const shares = splitExpense(cents, people);
    const low = Math.min(...shares.map((p) => p.cents));
    const high = Math.max(...shares.map((p) => p.cents));
    preview.textContent = `${money(low)}${high !== low ? `–${money(high)}` : ""} each · ${people.length} ${people.length === 1 ? "housemate" : "housemates"}`;
  } else
    preview.textContent = `Sharing between ${people.length} ${people.length === 1 ? "housemate" : "housemates"}.`;
});
function showFormError(form, message) {
  const error = form.querySelector(".form-error");
  error.hidden = false;
  error.textContent = message;
}
overlay.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);
  if (form.id === "chore-form") {
    const title = data.get("title").trim();
    if (!title) return showFormError(form, "Give this little chore a name.");
    const existing = state.tasks.find((t) => t.id === form.dataset.id);
    const room = data.get("room");
    const selectedPoints = Number(data.get("points"));
    const points =
      existing &&
      selectedPoints ===
        (existing.points <= 3 ? 2 : existing.points <= 6 ? 5 : 8)
        ? existing.points
        : selectedPoints;
    const task = {
      title,
      assignee: data.get("assignee"),
      due: data.get("due"),
      room,
      repeat: data.get("repeat"),
      points,
      icon:
        {
          Kitchen: "basket",
          "Living room": "vacuum",
          Bathroom: "sparkles",
          Balcony: "leaf",
        }[room] || "chores",
    };
    if (existing) {
      Object.assign(existing, task);
      if (existing.requestId) {
        const request = state.requests.find((r) => r.id === existing.requestId);
        if (request) request.claimedBy = task.assignee;
      }
    } else
      state.tasks.unshift({ ...task, id: crypto.randomUUID(), done: false });
    addActivity(
      `${existing ? "Updated" : "Added"} “${title}” to ${member(task.assignee).name}’s list.`,
    );
    closeModal();
    save(
      existing
        ? "A fresh plan. Workload updated."
        : "On the list. Off your mind.",
    );
  }
  if (form.id === "expense-form") {
    const title = data.get("title").trim();
    const cents = Math.round(Number(data.get("amount")) * 100);
    const participants = data.getAll("participants");
    if (!title)
      return showFormError(
        form,
        "Tell your housemates what this expense was for.",
      );
    try {
      splitExpense(cents, participants);
    } catch (error) {
      return showFormError(form, error.message);
    }
    const category = data.get("category");
    state.expenses.unshift({
      id: crypto.randomUUID(),
      title,
      cents,
      participants,
      paidBy: data.get("paidBy"),
      category,
      date: data.get("date"),
      icon:
        {
          Groceries: "basket",
          Utilities: "wifi",
          Household: "spray",
          "Food & drinks": "pizza",
        }[category] || "wallet",
    });
    addActivity(
      `${personName(data.get("paidBy"))} logged ${money(cents)} for “${title}”.`,
      "wallet",
    );
    closeModal();
    save("Logged, split, and off your mind.");
  }
  if (form.id === "request-form") {
    const title = data.get("title").trim();
    const note = data.get("note").trim();
    if (!title || !note)
      return showFormError(
        form,
        "Add a little title and context for your housemates.",
      );
    state.requests.unshift({
      id: crypto.randomUUID(),
      title,
      note,
      author: data.get("author"),
      category: data.get("category"),
      date: localDate(),
      status: "open",
    });
    addActivity(
      `${personName(data.get("author"))} left a little ask: “${title}”.`,
      "message",
    );
    closeModal();
    save("A little ask, shared with the house.");
  }
  if (form.id === "house-form") {
    const name = data.get("name").trim();
    if (!name) return showFormError(form, "Give your shared space a name.");
    state.houseName = name;
    closeModal();
    save("That’s got a nice ring to it.");
  }
});
window.addEventListener("hashchange", () => {
  const nextView = location.hash.slice(1);
  view = ["overview", "chores", "expenses", "household"].includes(nextView)
    ? nextView
    : "overview";
  notificationsOpen = false;
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
});
window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY) {
    state = loadState();
    render();
  }
});
view = ["overview", "chores", "expenses", "household"].includes(
  location.hash.slice(1),
)
  ? location.hash.slice(1)
  : "overview";
render();
