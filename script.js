const STORAGE_KEY = "task40_expenses";

const expenseForm = document.getElementById("expenseForm");
const expenseTitle = document.getElementById("expenseTitle");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const expenseDate = document.getElementById("expenseDate");
const expenseNotes = document.getElementById("expenseNotes");

const saveBtn = document.getElementById("saveBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const resetFormBtn = document.getElementById("resetFormBtn");
const formHeading = document.getElementById("formHeading");
const formMessage = document.getElementById("formMessage");

const expenseList = document.getElementById("expenseList");
const emptyState = document.getElementById("emptyState");
const tableWrapper = document.querySelector(".table-wrapper");
const listCount = document.getElementById("listCount");
const listTotal = document.getElementById("listTotal");

const totalSpent = document.getElementById("totalSpent");
const filteredSpent = document.getElementById("filteredSpent");
const expenseCount = document.getElementById("expenseCount");
const categorySummary = document.getElementById("categorySummary");

const searchExpense = document.getElementById("searchExpense");
const filterCategory = document.getElementById("filterCategory");
const filterFrom = document.getElementById("filterFrom");
const filterTo = document.getElementById("filterTo");
const sortBy = document.getElementById("sortBy");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");

const todayDate = document.getElementById("todayDate");
const filterMessage = document.getElementById("filterMessage");

let expenses = loadExpenses();
let editingId = null;

const categoryIcons = {
    Food: "🍔",
    Transport: "🚗",
    Shopping: "🛍️",
    Bills: "💡",
    Education: "📚",
    Health: "💊",
    Entertainment: "🎬",
    Other: "📦"
};

/* Date and currency helpers */

function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) {
        return "-";
    }

    const parts = dateString.split("-");

    if (parts.length !== 3) {
        return dateString;
    }

    const date = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

todayDate.textContent = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
});

/* LocalStorage */

function loadExpenses() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (!stored) {
            return [];
        }

        const parsed = JSON.parse(stored);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter((expense) => {
            return (
                expense &&
                typeof expense.id === "string" &&
                typeof expense.title === "string" &&
                typeof expense.category === "string" &&
                typeof expense.date === "string" &&
                Number.isFinite(Number(expense.amount)) &&
                Number(expense.amount) > 0
            );
        }).map((expense) => ({
            ...expense,
            amount: Number(expense.amount),
            notes: typeof expense.notes === "string"
                ? expense.notes
                : "",
            createdAt: Number(expense.createdAt) || 0,
            updatedAt: Number(expense.updatedAt) || 0
        }));
    } catch (error) {
        console.error("Could not load expenses:", error);
        return [];
    }
}

function saveExpenses() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(expenses)
        );

        return true;
    } catch (error) {
        console.error("Could not save expenses:", error);

        showMessage(
            "Unable to save data. Check your browser storage settings.",
            "error"
        );

        return false;
    }
}

function createId() {
    if (
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
    ) {
        return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/* Status messages */

function showMessage(message, type = "") {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
}

function showFilterMessage(message, type = "") {
    if (!filterMessage) {
        return;
    }

    filterMessage.textContent = message;
    filterMessage.className = `filter-message ${type}`;
}

/* Create and update expenses */

expenseForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = expenseTitle.value.trim();
    const amount = Number(expenseAmount.value);
    const category = expenseCategory.value;
    const date = expenseDate.value;
    const notes = expenseNotes.value.trim();

    if (!title || title.length > 100) {
        showMessage(
            "Enter an expense name under 100 characters.",
            "error"
        );
        expenseTitle.focus();
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        showMessage(
            "Enter an amount greater than zero.",
            "error"
        );
        expenseAmount.focus();
        return;
    }

    if (!categoryIcons[category]) {
        showMessage("Select a valid category.", "error");
        expenseCategory.focus();
        return;
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        showMessage("Please select a valid expense date.", "error");
        expenseDate.focus();
        return;
    }

    if (notes.length > 300) {
        showMessage(
            "Notes must be 300 characters or fewer.",
            "error"
        );
        expenseNotes.focus();
        return;
    }

    const timestamp = Date.now();
    const previousExpenses = expenses.map((item) => ({ ...item }));
    const wasEditing = editingId !== null;

    if (wasEditing) {
        const index = expenses.findIndex(
            (item) => item.id === editingId
        );

        if (index === -1) {
            showMessage("This expense could not be found.", "error");
            return;
        }

        expenses[index] = {
            ...expenses[index],
            title,
            amount,
            category,
            date,
            notes,
            updatedAt: timestamp
        };
    } else {
        expenses.push({
            id: createId(),
            title,
            amount,
            category,
            date,
            notes,
            createdAt: timestamp,
            updatedAt: timestamp
        });
    }

    if (!saveExpenses()) {
        expenses = previousExpenses;
        return;
    }

    resetForm();
    renderApp();

    showMessage(
        wasEditing
            ? "Expense updated successfully."
            : "Expense added successfully.",
        "success"
    );
});

/* Edit expense */

function editExpense(id) {
    const expense = expenses.find((item) => item.id === id);

    if (!expense) {
        return;
    }

    editingId = id;

    expenseTitle.value = expense.title;
    expenseAmount.value = expense.amount;
    expenseCategory.value = expense.category;
    expenseDate.value = expense.date;
    expenseNotes.value = expense.notes || "";

    formHeading.textContent = "Edit Expense";
    saveBtn.textContent = "Update Expense";
    cancelEditBtn.classList.remove("hidden");

    showMessage("Editing selected expense.");

    document.querySelector(".form-panel").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    expenseTitle.focus();
}

/* Delete expense */

function deleteExpense(id) {
    const expense = expenses.find((item) => item.id === id);

    if (!expense) {
        return;
    }

    const confirmed = confirm(
        `Delete "${expense.title}" (${formatCurrency(expense.amount)})?`
    );

    if (!confirmed) {
        return;
    }

    const previousExpenses = expenses.map((item) => ({ ...item }));

    expenses = expenses.filter((item) => item.id !== id);

    if (!saveExpenses()) {
        expenses = previousExpenses;
        return;
    }

    if (editingId === id) {
        resetForm();
    }

    renderApp();
    showMessage("Expense deleted successfully.", "success");
}

/* Reset expense form */

function resetForm() {
    expenseForm.reset();

    editingId = null;

    formHeading.textContent = "Add an Expense";
    saveBtn.textContent = "Add Expense";
    cancelEditBtn.classList.add("hidden");

    expenseDate.value = getLocalDateString();

    showMessage("");
}

resetFormBtn.addEventListener("click", resetForm);
cancelEditBtn.addEventListener("click", resetForm);

/* Filter and sort expenses */

function getFilteredExpenses() {
    const search = searchExpense.value.trim().toLowerCase();
    const category = filterCategory.value;
    const from = filterFrom.value;
    const to = filterTo.value;
    const sort = sortBy.value;

    if (from && to && from > to) {
        showFilterMessage(
            "The start date cannot be later than the end date.",
            "error"
        );

        return [];
    }

    showFilterMessage("");

    const filtered = expenses.filter((expense) => {
        const matchesSearch =
            expense.title.toLowerCase().includes(search) ||
            expense.category.toLowerCase().includes(search) ||
            expense.notes.toLowerCase().includes(search);

        const matchesCategory =
            category === "all" ||
            expense.category === category;

        const matchesFrom =
            !from || expense.date >= from;

        const matchesTo =
            !to || expense.date <= to;

        return (
            matchesSearch &&
            matchesCategory &&
            matchesFrom &&
            matchesTo
        );
    });

    filtered.sort((a, b) => {
        switch (sort) {
            case "oldest":
                return (
                    a.date.localeCompare(b.date) ||
                    a.createdAt - b.createdAt
                );

            case "highest":
                return (
                    b.amount - a.amount ||
                    b.date.localeCompare(a.date)
                );

            case "lowest":
                return (
                    a.amount - b.amount ||
                    b.date.localeCompare(a.date)
                );

            case "title":
                return (
                    a.title.localeCompare(
                        b.title,
                        undefined,
                        { sensitivity: "base" }
                    ) ||
                    b.date.localeCompare(a.date)
                );

            case "newest":
            default:
                return (
                    b.date.localeCompare(a.date) ||
                    b.createdAt - a.createdAt
                );
        }
    });

    return filtered;
}

/* Update the list when filters or sorting change */

[
    searchExpense,
    filterCategory,
    filterFrom,
    filterTo,
    sortBy
].forEach((control) => {
    control.addEventListener("input", renderApp);
    control.addEventListener("change", renderApp);
});

/* Clear all filters */

clearFiltersBtn.addEventListener("click", () => {
    searchExpense.value = "";
    filterCategory.value = "all";
    filterFrom.value = "";
    filterTo.value = "";
    sortBy.value = "newest";

    renderApp();
});

/* Render expense list */

function renderExpenseList(filtered) {
    expenseList.replaceChildren();

    const hasExpenses = filtered.length > 0;

    emptyState.classList.toggle("visible", !hasExpenses);

    tableWrapper.style.display = hasExpenses ? "block" : "none";

    filtered.forEach((expense) => {
        const row = document.createElement("tr");

        const titleCell = document.createElement("td");

        const title = document.createElement("div");
        title.className = "expense-title";
        title.textContent = expense.title;

        titleCell.appendChild(title);

        if (expense.notes) {
            const notes = document.createElement("div");
            notes.className = "expense-notes";
            notes.textContent = expense.notes;
            titleCell.appendChild(notes);
        }

        const categoryCell = document.createElement("td");
        const categoryBadge = document.createElement("span");

        categoryBadge.className = "category-pill";
        categoryBadge.textContent =
            `${categoryIcons[expense.category] || "📦"} ${expense.category}`;

        categoryCell.appendChild(categoryBadge);

        const dateCell = document.createElement("td");
        dateCell.textContent = formatDate(expense.date);

        const amountCell = document.createElement("td");
        amountCell.className = "amount-cell";
        amountCell.textContent = formatCurrency(expense.amount);

        const actionsCell = document.createElement("td");
        const actions = document.createElement("div");
        actions.className = "action-buttons";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "action-btn edit-btn";
        editButton.textContent = "Edit";
        editButton.setAttribute(
            "aria-label",
            `Edit ${expense.title}`
        );
        editButton.addEventListener("click", () => {
            editExpense(expense.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "action-btn delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute(
            "aria-label",
            `Delete ${expense.title}`
        );
        deleteButton.addEventListener("click", () => {
            deleteExpense(expense.id);
        });

        actions.append(editButton, deleteButton);
        actionsCell.appendChild(actions);

        row.append(
            titleCell,
            categoryCell,
            dateCell,
            amountCell,
            actionsCell
        );

        expenseList.appendChild(row);
    });

    listCount.textContent =
        `Showing ${filtered.length} ${
            filtered.length === 1 ? "expense" : "expenses"
        }`;

    const filteredTotal = filtered.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );

    listTotal.textContent = formatCurrency(filteredTotal);
}

/* Category-wise spending summary */

function renderCategorySummary() {
    categorySummary.replaceChildren();

    if (expenses.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent =
            "Your category summary will appear here.";

        categorySummary.appendChild(message);
        return;
    }

    const totals = {};

    expenses.forEach((expense) => {
        totals[expense.category] =
            (totals[expense.category] || 0) + expense.amount;
    });

    const overallTotal = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );

    const maximum = Math.max(...Object.values(totals), 1);

    Object.entries(totals)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, amount]) => {
            const row = document.createElement("div");
            row.className = "category-row";

            const top = document.createElement("div");
            top.className = "category-row-top";

            const name = document.createElement("span");
            name.className = "category-name";
            name.textContent =
                `${categoryIcons[category] || "📦"} ${category}`;

            const value = document.createElement("span");
            value.className = "category-amount";
            value.textContent = formatCurrency(amount);

            top.append(name, value);

            const track = document.createElement("div");
            track.className = "progress-track";

            const fill = document.createElement("div");
            fill.className = "progress-fill";
            fill.style.width = `${(amount / maximum) * 100}%`;

            track.appendChild(fill);

            const detail = document.createElement("p");
            detail.className = "category-detail";
            detail.textContent =
                `${((amount / overallTotal) * 100).toFixed(1)}% of total spending`;

            row.append(top, track, detail);
            categorySummary.appendChild(row);
        });
}

/* Dashboard totals */

function renderSummary(filtered) {
    const total = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );

    const selectedTotal = filtered.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );

    totalSpent.textContent = formatCurrency(total);
    filteredSpent.textContent = formatCurrency(selectedTotal);
    expenseCount.textContent = filtered.length;
}

/* Render application */

function renderApp() {
    const filtered = getFilteredExpenses();

    renderSummary(filtered);
    renderExpenseList(filtered);
    renderCategorySummary();
}

/* Initialize */

expenseDate.value = getLocalDateString();

if (sortBy) {
    sortBy.value = "newest";
}

renderApp();