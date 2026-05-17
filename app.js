// Data Model
let transactions = [];
let currentFilter = 'all';

// DOM Elements
const descInput = document.getElementById('desc');
const amountInput = document.getElementById('amount');
const typeSelect = document.getElementById('type');
const addBtn = document.getElementById('addBtn');
const transactionList = document.getElementById('transactionList');
const filterButtons = document.querySelectorAll('.filter-btn');
const totalBalanceSpan = document.getElementById('totalBalance');
const netAmountSpan = document.getElementById('netAmount');
const fabBtn = document.getElementById('fabBtn');

// Initialize from localStorage
function loadTransactions() {
  const saved = localStorage.getItem('moneytrail_transactions');
  if (saved) {
    transactions = JSON.parse(saved);
  }
}

// Save to localStorage
function saveTransactions() {
  localStorage.setItem('moneytrail_transactions', JSON.stringify(transactions));
}

// Add transaction
function addTransaction() {
  const desc = descInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeSelect.value;

  if (!desc || !amount || amount <= 0) {
    alert('Please enter a valid description and amount.');
    return;
  }

  const transaction = {
    id: Date.now(),
    desc,
    amount,
    type,
    date: new Date().toLocaleDateString()
  };

  transactions.unshift(transaction);
  saveTransactions();
  descInput.value = '';
  amountInput.value = '';
  typeSelect.value = 'expense';
  render();
}

// Delete transaction
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveTransactions();
  render();
}

// Calculate balance
function getBalance() {
  return transactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount;
  }, 0);
}

// Filter transactions
function getFilteredTransactions() {
  if (currentFilter === 'all') return transactions;
  return transactions.filter(t => t.type === currentFilter);
}

// Render transactions
function render() {
  const filtered = getFilteredTransactions();
  const balance = getBalance();
  totalBalanceSpan.textContent = balance.toFixed(2);
  netAmountSpan.textContent = balance.toFixed(2);
  netAmountSpan.className = balance >= 0 ? 'income-text' : 'expense-text';

  if (filtered.length === 0) {
    transactionList.innerHTML = '<div class="text-center text-gray-500 py-6 text-sm">No transactions to display.</div>';
    return;
  }

  transactionList.innerHTML = filtered
    .map(t => `
      <div class="fade-in bg-gray-800 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
        <div class="flex-1">
          <p class="text-gray-200 text-sm font-medium">${t.desc}</p>
          <p class="text-gray-500 text-xs">${t.date}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="${t.type === 'income' ? 'income-text' : 'expense-text'}">${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}</span>
          <button onclick="deleteTransaction(${t.id})" class="text-red-500 hover:text-red-700 text-xs p-1">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `)
    .join('');
}

// Filter button handlers
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('bg-green-600', 'text-white'));
    filterButtons.forEach(b => b.classList.add('bg-gray-700', 'text-gray-300'));
    btn.classList.remove('bg-gray-700', 'text-gray-300');
    btn.classList.add('bg-green-600', 'text-white');
    currentFilter = btn.id.replace('filter', '').toLowerCase();
    render();
  });
});

// Event listeners
addBtn.addEventListener('click', addTransaction);
fabBtn.addEventListener('click', () => descInput.focus());

descInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTransaction();
});

amountInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTransaction();
});

// Initialize
loadTransactions();
render();