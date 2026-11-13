export const STORAGE_KEY = "fairshare-household-v1";
export const members = [
  {
    id: "alex",
    name: "Alex",
    color: "#d9e8d5",
    ink: "#38604b",
    skin: "#dbad86",
    hair: "#493a2e",
  },
  {
    id: "maya",
    name: "Maya",
    color: "#ece0f2",
    ink: "#795c8c",
    skin: "#bd805c",
    hair: "#342a29",
  },
  {
    id: "leo",
    name: "Leo",
    color: "#f6e2bf",
    ink: "#987338",
    skin: "#edc29e",
    hair: "#77614a",
  },
  {
    id: "nina",
    name: "Nina",
    color: "#dbe8f0",
    ink: "#53788b",
    skin: "#edc4a7",
    hair: "#4d302b",
  },
];

export const member = (id) => members.find((person) => person.id === id);
export const money = (cents) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
export function localDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function initialState() {
  return {
    version: 1,
    houseName: "The Maple House",
    tasks: [
      {
        id: "vacuum",
        title: "Vacuum the living room",
        room: "Living room",
        icon: "vacuum",
        points: 8,
        assignee: "alex",
        due: localDate(),
        repeat: "Weekly",
        done: false,
      },
      {
        id: "bathroom",
        title: "Give the bathroom a refresh",
        room: "Bathroom",
        icon: "sparkles",
        points: 6,
        assignee: "alex",
        due: localDate(),
        repeat: "Weekly",
        done: false,
      },
      {
        id: "groceries",
        title: "Do the weekly grocery run",
        room: "Kitchen",
        icon: "basket",
        points: 5,
        assignee: "maya",
        due: localDate(1),
        repeat: "Weekly",
        done: false,
      },
      {
        id: "trash",
        title: "Take out trash & recycling",
        room: "Whole house",
        icon: "recycle",
        points: 4,
        assignee: "leo",
        due: localDate(1),
        repeat: "Weekly",
        done: false,
      },
      {
        id: "plants",
        title: "Water our green friends",
        room: "Balcony",
        icon: "leaf",
        points: 5,
        assignee: "nina",
        due: localDate(2),
        repeat: "Weekly",
        done: false,
      },
      ...[
        ["kitchen-reset", "Give the shared kitchen a reset", "alex", 8],
        ["shared-laundry", "Fresh towels & shared laundry", "alex", 8],
        ["stovetop", "Scrub the stovetop", "alex", 6],
        ["fridge", "Deep clean the fridge", "maya", 9],
        ["mop", "Mop the shared spaces", "maya", 9],
        ["oven", "Give the oven a deep clean", "leo", 9],
        ["storage", "Sort the hallway & shared storage", "leo", 9],
        ["shower", "Deep clean the shower", "nina", 10],
      ].map(([id, title, assignee, points]) => ({
        id, title, assignee, points,
        room: "Whole house",
        icon: "sparkles",
        due: localDate(-1),
        repeat: "Weekly",
        done: true,
      })),
    ],
    expenses: [
      {
        id: "expense-grocery",
        title: "The weekly grocery haul",
        category: "Groceries",
        cents: 8640,
        paidBy: "alex",
        participants: members.map((p) => p.id),
        date: localDate(),
        icon: "basket",
      },
      {
        id: "expense-internet",
        title: "Internet, keeping us connected",
        category: "Utilities",
        cents: 6400,
        paidBy: "maya",
        participants: members.map((p) => p.id),
        date: localDate(-1),
        icon: "wifi",
      },
      {
        id: "expense-cleaning",
        title: "A few cleaning essentials",
        category: "Household",
        cents: 2480,
        paidBy: "leo",
        participants: members.map((p) => p.id),
        date: localDate(-2),
        icon: "spray",
      },
      {
        id: "expense-dinner",
        title: "Friday night pizza",
        category: "Food & drinks",
        cents: 4040,
        paidBy: "nina",
        participants: members.map((p) => p.id),
        date: localDate(-3),
        icon: "pizza",
      },
    ],
    transfers: [],
    requests: [
      {
        id: "oat-milk",
        title: "We’re almost out of oat milk",
        note: "Could someone grab a carton on their way home? Coffee depends on it.",
        author: "maya",
        category: "Shopping",
        status: "open",
        date: localDate(),
      },
      {
        id: "bookshelf",
        title: "An extra pair of hands?",
        note: "My new bookshelf has arrived. A little help getting it upstairs would be amazing.",
        author: "nina",
        category: "A little help",
        status: "open",
        date: localDate(-1),
      },
    ],
    activity: [
      {
        id: "a1",
        text: "Maya added the weekly grocery run.",
        time: Date.now() - 1800000,
        icon: "check",
      },
      {
        id: "a2",
        text: "You logged $86.40 for groceries.",
        time: Date.now() - 3600000,
        icon: "wallet",
      },
      {
        id: "a3",
        text: "Nina left a little household request.",
        time: Date.now() - 7200000,
        icon: "message",
      },
    ],
  };
}

export function loadState() {
  try {
    const state = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (
      state?.version === 1 &&
      Array.isArray(state.tasks) &&
      Array.isArray(state.expenses) &&
      Array.isArray(state.transfers) &&
      Array.isArray(state.requests) &&
      Array.isArray(state.activity)
    )
      return state;
  } catch {
    /* An unavailable or empty local store starts a fresh household. */
  }
  return initialState();
}

// Remainder cents go to participants in their saved order. Every cent is accounted for.
export function splitExpense(cents, participants) {
  if (
    !Number.isSafeInteger(cents) ||
    cents <= 0 ||
    !participants.length ||
    new Set(participants).size !== participants.length
  )
    throw new Error("Add a valid amount and at least one housemate.");
  const base = Math.floor(cents / participants.length);
  const remainder = cents % participants.length;
  return participants.map((id, index) => ({
    id,
    cents: base + (index < remainder ? 1 : 0),
  }));
}

export function balances(state) {
  const result = Object.fromEntries(members.map((person) => [person.id, 0]));
  for (const expense of state.expenses) {
    result[expense.paidBy] += expense.cents;
    for (const share of splitExpense(expense.cents, expense.participants))
      result[share.id] -= share.cents;
  }
  for (const transfer of state.transfers) {
    result[transfer.from] += transfer.cents;
    result[transfer.to] -= transfer.cents;
  }
  return result;
}

export function settlements(state) {
  const entries = Object.entries(balances(state));
  const debtors = entries
    .filter(([, cents]) => cents < 0)
    .map(([id, cents]) => ({ id, cents: -cents }));
  const creditors = entries
    .filter(([, cents]) => cents > 0)
    .map(([id, cents]) => ({ id, cents }));
  const result = [];
  for (const debtor of debtors) {
    for (const creditor of creditors) {
      const cents = Math.min(debtor.cents, creditor.cents);
      if (cents > 0) {
        result.push({ from: debtor.id, to: creditor.id, cents });
        debtor.cents -= cents;
        creditor.cents -= cents;
      }
    }
  }
  return result;
}

export function workload(state) {
  const people = members.map((person) => {
    const tasks = state.tasks.filter((task) => task.assignee === person.id);
    return {
      ...person,
      points: tasks.reduce((sum, task) => sum + task.points, 0),
    };
  });
  const total = people.reduce((sum, person) => sum + person.points, 0);
  const deviation = people.reduce(
    (sum, person) => sum + Math.abs(person.points / total - 1 / people.length),
    0,
  );
  return {
    people,
    total,
    score: Math.round(100 * (1 - deviation / (2 * (1 - 1 / people.length)))),
  };
}
