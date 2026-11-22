const display = document.getElementById('display');
const expression = document.getElementById('expression');
const historyList = document.getElementById('historyList');
let current = '0';
let previous = '';
let operator = null;
let waitingForOperand = false;

function updateDisplay() {
  display.textContent = current;
  expression.textContent = previous && operator ? `${previous} ${symbol(operator)}` : '';
}
function symbol(op) { return ({ '*': '×', '/': '÷', '+': '+', '-': '−', '%': '%' })[op] || op; }
function inputDigit(digit) {
  if (waitingForOperand) { current = digit; waitingForOperand = false; }
  else current = current === '0' ? digit : current + digit;
  updateDisplay();
}
function inputDecimal() {
  if (waitingForOperand) { current = '0.'; waitingForOperand = false; }
  else if (!current.includes('.')) current += '.';
  updateDisplay();
}
function chooseOperator(nextOperator) {
  const value = Number(current);
  if (operator && !waitingForOperand) calculate();
  previous = current;
  operator = nextOperator;
  waitingForOperand = true;
  updateDisplay();
}
function calculate() {
  if (!operator || previous === '') return;
  const a = Number(previous), b = Number(current);
  let result;
  if (operator === '+') result = a + b;
  if (operator === '-') result = a - b;
  if (operator === '*') result = a * b;
  if (operator === '/') result = b === 0 ? NaN : a / b;
  if (operator === '%') result = b === 0 ? NaN : a % b;
  const equation = `${previous} ${symbol(operator)} ${current}`;
  if (!Number.isFinite(result)) current = 'Error';
  else {
    result = Number.parseFloat(result.toPrecision(12));
    current = String(result);
    saveHistory(equation, current);
  }
  previous = '';
  operator = null;
  waitingForOperand = true;
  updateDisplay();
}
function clearAll() { current = '0'; previous = ''; operator = null; waitingForOperand = false; updateDisplay(); }
function deleteLast() {
  if (waitingForOperand || current === 'Error') { current = '0'; waitingForOperand = false; }
  else current = current.length > 1 ? current.slice(0, -1) : '0';
  updateDisplay();
}
function changeSign() {
  if (current !== '0' && current !== 'Error') current = String(Number(current) * -1);
  updateDisplay();
}
function saveHistory(equation, result) {
  const entries = JSON.parse(localStorage.getItem('calculatorHistory') || '[]');
  entries.unshift({ equation, result });
  localStorage.setItem('calculatorHistory', JSON.stringify(entries.slice(0, 20)));
  renderHistory();
}
function renderHistory() {
  const entries = JSON.parse(localStorage.getItem('calculatorHistory') || '[]');
  historyList.innerHTML = '';
  if (!entries.length) {
    const li = document.createElement('li');
    li.className = 'empty'; li.textContent = 'No calculations yet.';
    historyList.appendChild(li); return;
  }
  entries.forEach(item => {
    const li = document.createElement('li');
    li.append(document.createTextNode(item.equation));
    const result = document.createElement('strong');
    result.textContent = `= ${item.result}`;
    li.appendChild(result);
    historyList.appendChild(li);
  });
}
document.querySelector('.keys').addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.value !== undefined) {
    const value = button.dataset.value;
    if ('0123456789'.includes(value)) inputDigit(value);
    else chooseOperator(value);
  } else {
    const action = button.dataset.action;
    if (action === 'clear') clearAll();
    if (action === 'delete') deleteLast();
    if (action === 'decimal') inputDecimal();
    if (action === 'sign') changeSign();
    if (action === 'calculate') calculate();
  }
});
document.getElementById('clearHistory').addEventListener('click', () => {
  localStorage.removeItem('calculatorHistory'); renderHistory();
});
document.addEventListener('keydown', event => {
  if (/^[0-9]$/.test(event.key)) inputDigit(event.key);
  else if (event.key === '.') inputDecimal();
  else if (['+', '-', '*', '/', '%'].includes(event.key)) chooseOperator(event.key);
  else if (event.key === 'Enter' || event.key === '=') { event.preventDefault(); calculate(); }
  else if (event.key === 'Backspace') deleteLast();
  else if (event.key === 'Escape') clearAll();
});
renderHistory();
updateDisplay();
