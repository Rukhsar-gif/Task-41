# Interactive Expense Tracker Web Application

An interactive and responsive **Expense Tracker Web Application** developed as Task 40 of the Veda Technology Web Development Internship.

The application allows users to add, edit, delete, search, categorize, filter, and sort expenses. It automatically calculates spending totals and displays a category-wise breakdown. Expense records are stored in the browser using LocalStorage.

## Features

- Add new expenses
- Edit existing expenses
- Delete expenses with confirmation
- Categorize expenses
- Search by expense name, category, or notes
- Filter expenses by category
- Filter expenses by date range
- Sort by newest first
- Sort by oldest first
- Sort by highest amount
- Sort by lowest amount
- Sort by expense name (A–Z)
- Automatic total expense calculation
- Filtered spending summary
- Expense count
- Category-wise spending breakdown
- Automatic list updates without page reloads
- Persistent data using LocalStorage
- Input validation
- Responsive design for desktop, tablet, and mobile

## Technologies Used

- HTML5
- CSS3
- JavaScript
- DOM Manipulation
- LocalStorage
- JavaScript Array Methods
- Git and GitHub
- GitHub Pages

## Project Links

- **Live Website:** https://rukhsar-gif.github.io/Task-40/
- **GitHub Repository:** https://github.com/Rukhsar-gif/Task-40/

## Project Structure

```text
Task-40/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

## Application Features

### 1. Dashboard Summary

The dashboard displays three statistics:

- **Total Spent:** Combined amount of all saved expenses.
- **Filtered Spending:** Total amount of expenses matching the active filters.
- **Expenses Recorded:** Number of expenses matching the active filters.

### 2. Add Expense

Users can enter:

- Expense name
- Amount in Indian Rupees (INR)
- Category
- Expense date
- Optional notes

The application validates the entered information before saving an expense.

### 3. Expense Categories

Expenses can be assigned to the following categories:

- Food
- Transport
- Shopping
- Bills
- Education
- Health
- Entertainment
- Other

### 4. Edit and Delete Expenses

Users can edit an existing expense by loading its details into the form and saving the changes.

Expenses can also be deleted after confirming the deletion, which helps prevent accidental removal.

### 5. Search and Filtering

The application provides a search field for expense names, categories, and notes.

Users
