(function () {
  'use strict';

  let currentExpression = '0';
  let previousCalculation = '';
  let angleMode = 'DEG';
  let memoryValue = 0;
  let ansValue = 0;
  let isEvaluated = false;
  let hasError = false;
  let isModeMenuPrompt = false;

  const displayCurrentEl = document.getElementById('display-current');
  const displayExpressionEl = document.getElementById('display-expression');
  const indicatorDegEl = document.getElementById('indicator-deg');
  const indicatorRadEl = document.getElementById('indicator-rad');
  const indicatorMEl = document.getElementById('indicator-m');
  const btnDegEl = document.querySelector('[data-action="deg"]');
  const btnRadEl = document.querySelector('[data-action="rad"]');

  function updateDisplay() {
    if (hasError) {
      displayCurrentEl.textContent = 'Error';
      displayExpressionEl.textContent = previousCalculation;
      return;
    }

    displayCurrentEl.textContent = currentExpression || '0';
    displayExpressionEl.textContent = previousCalculation;

    displayCurrentEl.scrollLeft = displayCurrentEl.scrollWidth;
    displayExpressionEl.scrollLeft = displayExpressionEl.scrollWidth;
  }

  function updateModeIndicators() {
    const indDeg = document.getElementById('indicator-deg');
    const indRad = document.getElementById('indicator-rad');
    const btnDeg = document.querySelector('[data-action="deg"]');
    const btnRad = document.querySelector('[data-action="rad"]');

    if (angleMode === 'DEG') {
      if (indDeg) indDeg.classList.add('active');
      if (indRad) indRad.classList.remove('active');
      if (btnDeg) btnDeg.classList.add('active');
      if (btnRad) btnRad.classList.remove('active');
    } else {
      if (indDeg) indDeg.classList.remove('active');
      if (indRad) indRad.classList.add('active');
      if (btnDeg) btnDeg.classList.remove('active');
      if (btnRad) btnRad.classList.add('active');
    }
  }

  function updateMemoryIndicator() {
    const indM = document.getElementById('indicator-m');
    const btnMr = document.querySelector('[data-action="mr"]');
    if (indM) {
      if (memoryValue !== 0) {
        indM.classList.add('active');
      } else {
        indM.classList.remove('active');
      }
    }
    if (btnMr) {
      if (memoryValue !== 0) {
        btnMr.classList.add('has-memory');
      } else {
        btnMr.classList.remove('has-memory');
      }
    }
  }

  function flashButton(btn) {
    if (!btn) return;
    btn.classList.add('btn-flash');
    setTimeout(() => {
      btn.classList.remove('btn-flash');
    }, 160);
  }

  function appendNumber(num) {
    if (hasError) clearCalculator();

    if (isModeMenuPrompt && (num === '1' || num === '2')) {
      setAngleMode(num === '1' ? 'DEG' : 'RAD');
      return;
    }
    isModeMenuPrompt = false;

    if (isEvaluated) {
      currentExpression = (num === '.') ? '0.' : num;
      isEvaluated = false;
      updateDisplay();
      return;
    }

    if (num === '.') {
      const parts = currentExpression.split(/[\+\−\×\÷\%\^\(\)]/);
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes('.')) return;
      if (currentExpression === '0' || currentExpression === '') {
        currentExpression = '0.';
        updateDisplay();
        return;
      }
    } else {
      if (currentExpression === '0') {
        currentExpression = num;
        updateDisplay();
        return;
      }
    }

    currentExpression += num;
    updateDisplay();
  }

  function appendOperator(op) {
    if (hasError) clearCalculator();

    if (isEvaluated) {
      isEvaluated = false;
    }

    if (currentExpression === '0' || currentExpression === '') {
      if (op === '−' || op === '-') {
        currentExpression = '−';
        updateDisplay();
        return;
      }
      if (op !== '−') {
        currentExpression = '0' + op;
        updateDisplay();
        return;
      }
    }

    const lastChar = currentExpression.slice(-1);
    const operators = ['+', '−', '×', '÷', '%', '^'];

    if (operators.includes(lastChar)) {
      if ((op === '−' || op === '-') && lastChar !== '−') {
        currentExpression += '−';
        updateDisplay();
        return;
      }
      currentExpression = currentExpression.slice(0, -1) + op;
      updateDisplay();
      return;
    }

    currentExpression += op;
    updateDisplay();
  }

  function appendParenthesis(paren) {
    if (hasError) clearCalculator();

    if (isEvaluated) {
      if (paren === '(') {
        currentExpression = '(';
      } else {
        currentExpression += paren;
      }
      isEvaluated = false;
      updateDisplay();
      return;
    }

    if (currentExpression === '0' && paren === '(') {
      currentExpression = '(';
      updateDisplay();
      return;
    }

    currentExpression += paren;
    updateDisplay();
  }

  function toggleSign() {
    if (hasError) clearCalculator();

    if (currentExpression === '0' || currentExpression === '') {
      currentExpression = '−';
      updateDisplay();
      return;
    }

    const match = currentExpression.match(/([−\-]?\d*\.?\d+)$/);
    if (match) {
      const numStr = match[1];
      const startIdx = match.index;
      let toggled;
      if (numStr.startsWith('−') || numStr.startsWith('-')) {
        toggled = numStr.slice(1);
      } else {
        toggled = '−' + numStr;
      }
      currentExpression = currentExpression.substring(0, startIdx) + toggled;
    } else {
      currentExpression += '×(−1)';
    }

    isEvaluated = false;
    updateDisplay();
  }

  function deleteLast() {
    if (hasError) {
      clearCalculator();
      return;
    }

    if (isEvaluated) {
      currentExpression = '0';
      isEvaluated = false;
      updateDisplay();
      return;
    }

    const multiCharTokens = [
      'sin⁻¹(', 'cos⁻¹(', 'tan⁻¹(',
      'sin(', 'cos(', 'tan(',
      'log₂(', 'log(', 'ln(',
      '10^(', 'e^(', '√(', '∛(',
      'abs(', 'ANS'
    ];

    let deleted = false;
    for (const token of multiCharTokens) {
      if (currentExpression.endsWith(token)) {
        currentExpression = currentExpression.slice(0, -token.length);
        deleted = true;
        break;
      }
    }

    if (!deleted) {
      currentExpression = currentExpression.slice(0, -1);
    }

    if (currentExpression === '' || currentExpression === '-') {
      currentExpression = '0';
    }

    updateDisplay();
  }

  function clearCalculator() {
    currentExpression = '0';
    previousCalculation = '';
    hasError = false;
    isEvaluated = false;
    isModeMenuPrompt = false;
    updateDisplay();
  }

  function scientificFunction(func) {
    if (hasError) clearCalculator();

    if (currentExpression === '0' || isEvaluated) {
      switch (func) {
        case 'sin':
        case 'cos':
        case 'tan':
        case 'asin':
        case 'acos':
        case 'atan':
        case 'log':
        case 'ln':
        case 'log2':
        case 'sqrt':
        case 'cbrt':
        case 'abs':
          currentExpression = '';
          break;
        case 'pi':
          currentExpression = 'π';
          isEvaluated = false;
          updateDisplay();
          return;
        case 'e-const':
          currentExpression = 'e';
          isEvaluated = false;
          updateDisplay();
          return;
        case 'ans':
          currentExpression = 'ANS';
          isEvaluated = false;
          updateDisplay();
          return;
        case 'exp-e':
          currentExpression = 'e^(';
          isEvaluated = false;
          updateDisplay();
          return;
        case 'power-10':
          currentExpression = '10^(';
          isEvaluated = false;
          updateDisplay();
          return;
        case 'reciprocal':
          currentExpression = '1/(';
          isEvaluated = false;
          updateDisplay();
          return;
        default:
          break;
      }
      isEvaluated = false;
    }

    switch (func) {
      case 'sin':
        currentExpression += 'sin(';
        break;
      case 'cos':
        currentExpression += 'cos(';
        break;
      case 'tan':
        currentExpression += 'tan(';
        break;
      case 'asin':
        currentExpression += 'sin⁻¹(';
        break;
      case 'acos':
        currentExpression += 'cos⁻¹(';
        break;
      case 'atan':
        currentExpression += 'tan⁻¹(';
        break;
      case 'log':
        currentExpression += 'log(';
        break;
      case 'ln':
        currentExpression += 'ln(';
        break;
      case 'log2':
        currentExpression += 'log₂(';
        break;
      case 'square':
        currentExpression += '²';
        break;
      case 'cube':
        currentExpression += '³';
        break;
      case 'power':
        currentExpression += '^';
        break;
      case 'exp-e':
        currentExpression += 'e^(';
        break;
      case 'power-10':
        currentExpression += '10^(';
        break;
      case 'sqrt':
        currentExpression += '√(';
        break;
      case 'cbrt':
        currentExpression += '∛(';
        break;
      case 'reciprocal':
        currentExpression += '^(-1)';
        break;
      case 'abs':
        currentExpression += 'abs(';
        break;
      case 'pi':
        if (currentExpression === '0') currentExpression = '';
        currentExpression += 'π';
        break;
      case 'e-const':
        if (currentExpression === '0') currentExpression = '';
        currentExpression += 'e';
        break;
      case 'ans':
        if (currentExpression === '0') currentExpression = '';
        currentExpression += 'ANS';
        break;
      case 'exp-notation':
        currentExpression += 'E';
        break;
      default:
        break;
    }

    updateDisplay();
  }

  function factorial() {
    if (hasError) clearCalculator();
    if (isEvaluated) isEvaluated = false;
    currentExpression += '!';
    updateDisplay();
  }

  function toggleAngleMode() {
    angleMode = (angleMode === 'DEG') ? 'RAD' : 'DEG';
    isModeMenuPrompt = true;
    previousCalculation = `MODE: ${angleMode} (1:DEG, 2:RAD)`;
    updateModeIndicators();
    updateDisplay();
    flashButton(document.querySelector('[data-action="mode"]'));
  }

  function setAngleMode(mode) {
    if (mode === 'DEG' || mode === 'RAD') {
      angleMode = mode;
      isModeMenuPrompt = false;
      previousCalculation = `MODE: ${angleMode} (${mode === 'DEG' ? 'Degrees' : 'Radians'})`;
      updateModeIndicators();
      updateDisplay();
      flashButton(document.querySelector(`[data-action="${mode.toLowerCase()}"]`));
    }
  }

  function memoryAdd() {
    try {
      const val = evaluateRaw(currentExpression);
      if (isNaN(val) || !isFinite(val)) throw new Error('Invalid value');
      memoryValue += val;
      const cleanVal = cleanNumber(val);
      const cleanMem = cleanNumber(memoryValue);
      previousCalculation = `M+ (${cleanVal}) → M = ${cleanMem}`;
      currentExpression = cleanVal.toString();
      isEvaluated = true;
      hasError = false;
      updateMemoryIndicator();
      updateDisplay();
      flashButton(document.querySelector('[data-action="m-plus"]'));
    } catch {
      hasError = true;
      updateDisplay();
    }
  }

  function memorySubtract() {
    try {
      const val = evaluateRaw(currentExpression);
      if (isNaN(val) || !isFinite(val)) throw new Error('Invalid value');
      memoryValue -= val;
      const cleanVal = cleanNumber(val);
      const cleanMem = cleanNumber(memoryValue);
      previousCalculation = `M− (${cleanVal}) → M = ${cleanMem}`;
      currentExpression = cleanVal.toString();
      isEvaluated = true;
      hasError = false;
      updateMemoryIndicator();
      updateDisplay();
      flashButton(document.querySelector('[data-action="m-minus"]'));
    } catch {
      hasError = true;
      updateDisplay();
    }
  }

  function memoryRecall() {
    if (hasError) clearCalculator();
    const cleanMem = cleanNumber(memoryValue);
    const memStr = cleanMem.toString();
    previousCalculation = `MR (Recalled: ${cleanMem})`;
    currentExpression = memStr;
    isEvaluated = true;
    updateDisplay();
    flashButton(document.querySelector('[data-action="mr"]'));
  }

  function memoryClear() {
    memoryValue = 0;
    previousCalculation = 'MC (Memory Cleared: 0)';
    updateMemoryIndicator();
    updateDisplay();
    flashButton(document.querySelector('[data-action="mc"]'));
  }

  function computeFactorial(n) {
    if (n < 0 || !Number.isInteger(n)) {
      throw new Error('Factorial requires non-negative integer');
    }
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity;
    let res = 1;
    for (let i = 2; i <= n; i++) {
      res *= i;
    }
    return res;
  }

  function cleanNumber(num) {
    if (!isFinite(num)) return num;
    if (Math.abs(num) < 1e-14) return 0;
    
    const prec = parseFloat(num.toPrecision(12));
    if (Math.abs(prec - Math.round(prec)) < 1e-11) {
      return Math.round(prec);
    }
    return prec;
  }

  function tokenize(str) {
    let s = str
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/sin⁻¹/g, 'asin')
      .replace(/cos⁻¹/g, 'acos')
      .replace(/tan⁻¹/g, 'atan')
      .replace(/log₂/g, 'log2');

    const tokens = [];
    let i = 0;
    const len = s.length;

    while (i < len) {
      const char = s[i];

      if (/\s/.test(char)) {
        i++;
        continue;
      }

      if (/\d|\./.test(char)) {
        let numStr = '';
        while (i < len && /[\d\.]/.test(s[i])) {
          numStr += s[i];
          i++;
        }
        if (i < len && (s[i] === 'E' || s[i] === 'e')) {
          numStr += 'e';
          i++;
          if (i < len && (s[i] === '+' || s[i] === '-')) {
            numStr += s[i];
            i++;
          }
          while (i < len && /\d/.test(s[i])) {
            numStr += s[i];
            i++;
          }
        }
        tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
        continue;
      }

      if (char === 'π') {
        tokens.push({ type: 'NUMBER', value: Math.PI });
        i++;
        continue;
      }

      if (s.startsWith('ANS', i)) {
        tokens.push({ type: 'NUMBER', value: ansValue });
        i += 3;
        continue;
      }

      if (char === 'e' && !s.startsWith('exp', i) && (i + 1 >= len || !/[a-zA-Z]/.test(s[i + 1]))) {
        tokens.push({ type: 'NUMBER', value: Math.E });
        i++;
        continue;
      }

      const funcs = ['asin', 'acos', 'atan', 'sin', 'cos', 'tan', 'log2', 'log', 'ln', 'sqrt', 'cbrt', 'abs'];
      let matchedFunc = null;
      for (const fn of funcs) {
        if (s.startsWith(fn, i)) {
          matchedFunc = fn;
          break;
        }
      }
      if (matchedFunc) {
        tokens.push({ type: 'FUNCTION', value: matchedFunc });
        i += matchedFunc.length;
        continue;
      }

      if (char === '√') {
        tokens.push({ type: 'FUNCTION', value: 'sqrt' });
        i++;
        continue;
      }
      if (char === '∛') {
        tokens.push({ type: 'FUNCTION', value: 'cbrt' });
        i++;
        continue;
      }

      if (char === '²') {
        tokens.push({ type: 'OPERATOR', value: '^' });
        tokens.push({ type: 'NUMBER', value: 2 });
        i++;
        continue;
      }
      if (char === '³') {
        tokens.push({ type: 'OPERATOR', value: '^' });
        tokens.push({ type: 'NUMBER', value: 3 });
        i++;
        continue;
      }
      if (char === '!') {
        tokens.push({ type: 'POSTFIX', value: '!' });
        i++;
        continue;
      }

      if (char === '(' || char === ')') {
        tokens.push({ type: 'PAREN', value: char });
        i++;
        continue;
      }

      if (['+', '-', '*', '/', '%', '^'].includes(char)) {
        const prev = tokens[tokens.length - 1];
        const isUnary = !prev || prev.type === 'OPERATOR' || (prev.type === 'PAREN' && prev.value === '(');

        if (isUnary && (char === '-' || char === '+')) {
          tokens.push({ type: 'UNARY', value: char === '-' ? 'neg' : 'pos' });
        } else {
          tokens.push({ type: 'OPERATOR', value: char });
        }
        i++;
        continue;
      }

      throw new Error(`Unexpected character: ${char}`);
    }

    const expanded = [];
    for (let k = 0; k < tokens.length; k++) {
      const cur = tokens[k];
      expanded.push(cur);

      if (k < tokens.length - 1) {
        const next = tokens[k + 1];
        const isCurOperand = cur.type === 'NUMBER' || (cur.type === 'PAREN' && cur.value === ')') || cur.type === 'POSTFIX';
        const isNextOperand = next.type === 'NUMBER' || (next.type === 'PAREN' && next.value === '(') || next.type === 'FUNCTION';

        if (isCurOperand && isNextOperand) {
          expanded.push({ type: 'OPERATOR', value: '*' });
        }
      }
    }

    return expanded;
  }

  function toRPN(tokens) {
    const output = [];
    const opStack = [];

    const precedence = {
      '+': 1,
      '-': 1,
      '*': 2,
      '/': 2,
      '%': 2,
      '^': 4
    };

    const associativity = {
      '+': 'L',
      '-': 'L',
      '*': 'L',
      '/': 'L',
      '%': 'L',
      '^': 'R'
    };

    let openCount = 0;
    for (const t of tokens) {
      if (t.type === 'PAREN' && t.value === '(') openCount++;
      if (t.type === 'PAREN' && t.value === ')') openCount--;
    }
    while (openCount > 0) {
      tokens.push({ type: 'PAREN', value: ')' });
      openCount--;
    }

    for (const token of tokens) {
      if (token.type === 'NUMBER') {
        output.push(token);
      } else if (token.type === 'FUNCTION' || token.type === 'UNARY') {
        opStack.push(token);
      } else if (token.type === 'POSTFIX') {
        output.push(token);
      } else if (token.type === 'OPERATOR') {
        const o1 = token.value;
        while (opStack.length > 0) {
          const top = opStack[opStack.length - 1];
          if (top.type === 'UNARY' || top.type === 'FUNCTION') {
            output.push(opStack.pop());
            continue;
          }
          if (top.type === 'OPERATOR') {
            const o2 = top.value;
            const p1 = precedence[o1] || 0;
            const p2 = precedence[o2] || 0;
            if ((associativity[o1] === 'L' && p1 <= p2) || (associativity[o1] === 'R' && p1 < p2)) {
              output.push(opStack.pop());
              continue;
            }
          }
          break;
        }
        opStack.push(token);
      } else if (token.type === 'PAREN' && token.value === '(') {
        opStack.push(token);
      } else if (token.type === 'PAREN' && token.value === ')') {
        let found = false;
        while (opStack.length > 0) {
          const top = opStack.pop();
          if (top.type === 'PAREN' && top.value === '(') {
            found = true;
            break;
          }
          output.push(top);
        }
        if (!found) throw new Error('Mismatched parentheses');
        if (opStack.length > 0 && (opStack[opStack.length - 1].type === 'FUNCTION' || opStack[opStack.length - 1].type === 'UNARY')) {
          output.push(opStack.pop());
        }
      }
    }

    while (opStack.length > 0) {
      const top = opStack.pop();
      if (top.type === 'PAREN') throw new Error('Mismatched parentheses');
      output.push(top);
    }

    return output;
  }

  function evaluateRPN(rpn) {
    const stack = [];

    for (const token of rpn) {
      if (token.type === 'NUMBER') {
        stack.push(token.value);
      } else if (token.type === 'POSTFIX') {
        if (stack.length < 1) throw new Error('Invalid syntax');
        const a = stack.pop();
        if (token.value === '!') {
          stack.push(computeFactorial(a));
        }
      } else if (token.type === 'UNARY') {
        if (stack.length < 1) throw new Error('Invalid syntax');
        const a = stack.pop();
        stack.push(token.value === 'neg' ? -a : a);
      } else if (token.type === 'FUNCTION') {
        if (stack.length < 1) throw new Error('Invalid syntax');
        const a = stack.pop();
        let res;

        switch (token.value) {
          case 'sin':
            res = (angleMode === 'DEG') ? Math.sin((a * Math.PI) / 180) : Math.sin(a);
            break;
          case 'cos':
            res = (angleMode === 'DEG') ? Math.cos((a * Math.PI) / 180) : Math.cos(a);
            break;
          case 'tan':
            if (angleMode === 'DEG') {
              const normalized = ((a % 180) + 180) % 180;
              if (Math.abs(normalized - 90) < 1e-10) throw new Error('Undefined (tan 90°)');
              res = Math.tan((a * Math.PI) / 180);
            } else {
              res = Math.tan(a);
            }
            break;
          case 'asin':
            if (a < -1 || a > 1) throw new Error('Domain error: asin');
            res = Math.asin(a);
            if (angleMode === 'DEG') res = (res * 180) / Math.PI;
            break;
          case 'acos':
            if (a < -1 || a > 1) throw new Error('Domain error: acos');
            res = Math.acos(a);
            if (angleMode === 'DEG') res = (res * 180) / Math.PI;
            break;
          case 'atan':
            res = Math.atan(a);
            if (angleMode === 'DEG') res = (res * 180) / Math.PI;
            break;
          case 'log':
            if (a <= 0) throw new Error('Domain error: log(<=0)');
            res = Math.log10(a);
            break;
          case 'ln':
            if (a <= 0) throw new Error('Domain error: ln(<=0)');
            res = Math.log(a);
            break;
          case 'log2':
            if (a <= 0) throw new Error('Domain error: log2(<=0)');
            res = Math.log2(a);
            break;
          case 'sqrt':
            if (a < 0) throw new Error('Domain error: sqrt(<0)');
            res = Math.sqrt(a);
            break;
          case 'cbrt':
            res = Math.cbrt(a);
            break;
          case 'abs':
            res = Math.abs(a);
            break;
          default:
            throw new Error(`Unknown function: ${token.value}`);
        }
        stack.push(cleanNumber(res));
      } else if (token.type === 'OPERATOR') {
        if (stack.length < 2) throw new Error('Invalid syntax');
        const b = stack.pop();
        const a = stack.pop();
        let res;

        switch (token.value) {
          case '+':
            res = a + b;
            break;
          case '-':
            res = a - b;
            break;
          case '*':
            res = a * b;
            break;
          case '/':
            if (b === 0) throw new Error('Division by zero');
            res = a / b;
            break;
          case '%':
            if (b === 0) throw new Error('Division by zero');
            res = a % b;
            break;
          case '^':
            res = Math.pow(a, b);
            if (isNaN(res) || !isFinite(res)) throw new Error('Math error in exponent');
            break;
          default:
            throw new Error(`Unknown operator: ${token.value}`);
        }
        stack.push(cleanNumber(res));
      }
    }

    if (stack.length !== 1) throw new Error('Invalid syntax');
    return stack[0];
  }

  function evaluateRaw(expr) {
    const tokens = tokenize(expr);
    const rpn = toRPN(tokens);
    return evaluateRPN(rpn);
  }

  function calculate() {
    if (hasError) return;

    try {
      const expr = currentExpression;
      const rawResult = evaluateRaw(expr);

      if (isNaN(rawResult) || !isFinite(rawResult)) {
        throw new Error('Result is not a finite number');
      }

      const formattedResult = cleanNumber(rawResult);

      ansValue = formattedResult;

      previousCalculation = expr + ' =';
      currentExpression = formattedResult.toString();
      isEvaluated = true;
      hasError = false;

      updateDisplay();
    } catch (err) {
      previousCalculation = currentExpression + ' =';
      hasError = true;
      updateDisplay();
    }
  }

  function setupEventListeners() {
    const calculatorEl = document.querySelector('.calculator');
    if (!calculatorEl) return;

    calculatorEl.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn');
      if (!btn) return;

      flashButton(btn);

      const action = btn.dataset.action;
      const val = btn.dataset.val;

      if (val !== undefined) {
        appendNumber(val);
        return;
      }

      if (action) {
        switch (action) {
          case 'mode':
            toggleAngleMode();
            break;
          case 'deg':
            setAngleMode('DEG');
            break;
          case 'rad':
            setAngleMode('RAD');
            break;
          case 'mc':
            memoryClear();
            break;
          case 'mr':
            memoryRecall();
            break;
          case 'm-minus':
            memorySubtract();
            break;
          case 'm-plus':
            memoryAdd();
            break;
          case 'clear':
            clearCalculator();
            break;
          case 'delete':
            deleteLast();
            break;
          case 'calculate':
            calculate();
            break;
          case 'negate':
            toggleSign();
            break;
          case 'open-paren':
            appendParenthesis('(');
            break;
          case 'close-paren':
            appendParenthesis(')');
            break;
          case 'divide':
            appendOperator('÷');
            break;
          case 'multiply':
            appendOperator('×');
            break;
          case 'subtract':
            appendOperator('−');
            break;
          case 'add':
            appendOperator('+');
            break;
          case 'percent':
            appendOperator('%');
            break;
          case 'factorial':
            factorial();
            break;
          default:
            scientificFunction(action);
            break;
        }
      }
    });

    window.addEventListener('keydown', handleKeyboardInput);
  }

  function handleKeyboardInput(e) {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    const key = e.key;

    if (key >= '0' && key <= '9') {
      e.preventDefault();
      appendNumber(key);
      return;
    }

    switch (key) {
      case '.':
        e.preventDefault();
        appendNumber('.');
        break;
      case '+':
        e.preventDefault();
        appendOperator('+');
        break;
      case '-':
        e.preventDefault();
        appendOperator('−');
        break;
      case '*':
        e.preventDefault();
        appendOperator('×');
        break;
      case '/':
        e.preventDefault();
        appendOperator('÷');
        break;
      case '%':
        e.preventDefault();
        appendOperator('%');
        break;
      case '^':
        e.preventDefault();
        scientificFunction('power');
        break;
      case '!':
        e.preventDefault();
        factorial();
        break;
      case '(':
      case ')':
        e.preventDefault();
        appendParenthesis(key);
        break;
      case 'Enter':
      case '=':
        e.preventDefault();
        calculate();
        break;
      case 'Backspace':
        e.preventDefault();
        deleteLast();
        break;
      case 'Escape':
      case 'Delete':
        e.preventDefault();
        clearCalculator();
        break;
      default:
        break;
    }
  }

  window.Calculator = {
    appendNumber,
    appendOperator,
    appendParenthesis,
    calculate,
    clearCalculator,
    deleteLast,
    scientificFunction,
    factorial,
    toggleAngleMode,
    setAngleMode,
    memoryAdd,
    memorySubtract,
    memoryRecall,
    memoryClear,
    evaluateRaw,
    getState: () => ({
      currentExpression,
      previousCalculation,
      angleMode,
      memoryValue,
      ansValue,
      isEvaluated,
      hasError
    })
  };

  function init() {
    clearCalculator();
    updateModeIndicators();
    updateMemoryIndicator();
    setupEventListeners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

const menuToggle = document.querySelector("#menuToggle");
const navContent = document.querySelector("#navContent");

menuToggle.addEventListener("click", () => {
  const isOpen = navContent.classList.toggle("open");
  menuToggle.classList.toggle("active", isOpen);
  menuToggle.setAttribute("aria-expanded", isOpen);
});

document.querySelectorAll(".nav-link, .connect-btn").forEach(link => {
  link.addEventListener("click", () => {
    navContent.classList.remove("open");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});
document.querySelector("#footerYear").textContent = new Date().getFullYear();
