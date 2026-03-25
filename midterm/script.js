// 炫炮計算機 - JavaScript 功能實現
document.addEventListener('DOMContentLoaded', function() {
    // 計算器狀態
    const calculator = {
        display: '0',
        firstOperand: null,
        operator: null,
        waitingForSecondOperand: false,
        memory: 0,
        history: [],
        soundEnabled: true,
        isDarkMode: false
    };

    // DOM 元素
    const displayElement = document.getElementById('display');
    const displayTextElement = displayElement.querySelector('.display-text');
    const historyElement = document.getElementById('history');
    const operatorDisplayElement = document.getElementById('operatorDisplay');
    const historyListElement = document.getElementById('historyList');
    const resultAnimationElement = document.getElementById('resultAnimation');
    const particlesContainer = document.getElementById('particles');
    
    // 音效元素
    const clickSound = document.getElementById('clickSound');
    const equalsSound = document.getElementById('equalsSound');
    const clearSound = document.getElementById('clearSound');

    // 初始化
    init();
    createParticles();
    
    // 初始化函數
    function init() {
        setupEventListeners();
        updateDisplay();
        loadSettings();
    }
    
    // 設置事件監聽器
    function setupEventListeners() {
        // 數字按鈕
        document.querySelectorAll('.number-btn').forEach(button => {
            button.addEventListener('click', () => {
                playSound(clickSound);
                inputNumber(button.dataset.number);
                animateButton(button);
            });
        });
        
        // 運算符按鈕
        document.querySelectorAll('.operator-btn').forEach(button => {
            button.addEventListener('click', () => {
                playSound(clickSound);
                handleOperator(button.dataset.operator);
                animateButton(button);
            });
        });
        
        // 功能按鈕
        document.querySelectorAll('.function-btn').forEach(button => {
            button.addEventListener('click', () => {
                playSound(clickSound);
                handleFunction(button.dataset.action);
                animateButton(button);
            });
        });
        
        // 小數點按鈕
        document.querySelector('.decimal-btn').addEventListener('click', () => {
            playSound(clickSound);
            inputDecimal();
            animateButton(document.querySelector('.decimal-btn'));
        });
        
        // 等於按鈕
        document.getElementById('equals').addEventListener('click', () => {
            playSound(equalsSound);
            handleEquals();
            animateButton(document.getElementById('equals'), 'pop-animation');
        });
        
        // 額外功能按鈕
        document.getElementById('square').addEventListener('click', () => {
            playSound(clickSound);
            square();
            animateButton(document.getElementById('square'));
        });
        
        document.getElementById('sqrt').addEventListener('click', () => {
            playSound(clickSound);
            squareRoot();
            animateButton(document.getElementById('sqrt'));
        });
        
        document.getElementById('toggleSign').addEventListener('click', () => {
            playSound(clickSound);
            toggleSign();
            animateButton(document.getElementById('toggleSign'));
        });
        
        document.getElementById('memoryAdd').addEventListener('click', () => {
            playSound(clickSound);
            memoryAdd();
            animateButton(document.getElementById('memoryAdd'));
        });
        
        document.getElementById('memoryRecall').addEventListener('click', () => {
            playSound(clickSound);
            memoryRecall();
            animateButton(document.getElementById('memoryRecall'));
        });
        
        // 清除歷史按鈕
        document.getElementById('clearHistory').addEventListener('click', () => {
            playSound(clearSound);
            clearHistory();
            animateButton(document.getElementById('clearHistory'));
        });
        
        // 主題切換按鈕
        document.getElementById('themeToggle').addEventListener('click', () => {
            playSound(clickSound);
            toggleTheme();
            animateButton(document.getElementById('themeToggle'));
        });
        
        // 音效切換按鈕
        document.getElementById('soundToggle').addEventListener('click', () => {
            playSound(clickSound);
            toggleSound();
            animateButton(document.getElementById('soundToggle'));
        });
        
        // 鍵盤支持
        document.addEventListener('keydown', handleKeyboard);
    }
    
    // 處理鍵盤輸入
    function handleKeyboard(event) {
        const key = event.key;
        
        if (key >= '0' && key <= '9') {
            playSound(clickSound);
            inputNumber(key);
            animateButton(document.querySelector(`.number-btn[data-number="${key}"]`));
        } else if (key === '.') {
            playSound(clickSound);
            inputDecimal();
            animateButton(document.querySelector('.decimal-btn'));
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            playSound(clickSound);
            handleOperator(key);
            const operatorMap = {
                '+': '+',
                '-': '-',
                '*': '×',
                '/': '÷'
            };
            animateButton(document.querySelector(`.operator-btn[data-operator="${key}"]`));
        } else if (key === 'Enter' || key === '=') {
            playSound(equalsSound);
            handleEquals();
            animateButton(document.getElementById('equals'), 'pop-animation');
        } else if (key === 'Escape' || key === 'Delete') {
            playSound(clearSound);
            resetCalculator();
            animateButton(document.querySelector('.function-btn[data-action="clear"]'));
        } else if (key === 'Backspace') {
            playSound(clickSound);
            handleBackspace();
        } else if (key === '%') {
            playSound(clickSound);
            handleFunction('percentage');
            animateButton(document.querySelector('.function-btn[data-action="percentage"]'));
        }
    }
    
    // 輸入數字
    function inputNumber(number) {
        const { display, waitingForSecondOperand } = calculator;
        
        if (waitingForSecondOperand) {
            calculator.display = number;
            calculator.waitingForSecondOperand = false;
        } else {
            calculator.display = display === '0' ? number : display + number;
        }
        
        updateDisplay();
    }
    
    // 輸入小數點
    function inputDecimal() {
        if (calculator.waitingForSecondOperand) {
            calculator.display = '0.';
            calculator.waitingForSecondOperand = false;
            return;
        }
        
        if (!calculator.display.includes('.')) {
            calculator.display += '.';
        }
        
        updateDisplay();
    }
    
    // 處理運算符
    function handleOperator(nextOperator) {
        const { firstOperand, display, operator } = calculator;
        const inputValue = parseFloat(display);
        
        if (operator && calculator.waitingForSecondOperand) {
            calculator.operator = nextOperator;
            updateOperatorDisplay();
            return;
        }
        
        if (firstOperand === null) {
            calculator.firstOperand = inputValue;
        } else if (operator) {
            const result = performCalculation();
            
            calculator.display = `${parseFloat(result.toFixed(10))}`;
            calculator.firstOperand = parseFloat(result.toFixed(10));
            
            // 添加到歷史記錄
            addToHistory();
        }
        
        calculator.waitingForSecondOperand = true;
        calculator.operator = nextOperator;
        
        updateDisplay();
        updateOperatorDisplay();
    }
    
    // 處理等於運算
    function handleEquals() {
        const { firstOperand, display, operator } = calculator;
        const inputValue = parseFloat(display);
        
        if (firstOperand !== null && operator && !calculator.waitingForSecondOperand) {
            const result = performCalculation();
            
            calculator.display = `${parseFloat(result.toFixed(10))}`;
            calculator.firstOperand = null;
            calculator.operator = null;
            calculator.waitingForSecondOperand = true;
            
            // 添加到歷史記錄
            addToHistory();
            
            // 顯示結果動畫
            showResultAnimation(result);
        } else if (firstOperand === null && operator) {
            calculator.firstOperand = inputValue;
            const result = performCalculation();
            calculator.display = `${parseFloat(result.toFixed(10))}`;
            calculator.firstOperand = null;
            calculator.operator = null;
            calculator.waitingForSecondOperand = true;
            
            addToHistory();
            showResultAnimation(result);
        }
        
        updateDisplay();
        updateOperatorDisplay();
    }
    
    // 執行計算
    function performCalculation() {
        const { firstOperand, display, operator } = calculator;
        const inputValue = parseFloat(display);
        
        if (operator === '/' && inputValue === 0) {
            showErrorAnimation('無法除以零');
            return firstOperand;
        }
        
        switch (operator) {
            case '+':
                return firstOperand + inputValue;
            case '-':
                return firstOperand - inputValue;
            case '*':
                return firstOperand * inputValue;
            case '/':
                return firstOperand / inputValue;
            default:
                return inputValue;
        }
    }
    
    // 處理功能按鈕
    function handleFunction(action) {
        switch (action) {
            case 'clear':
                resetCalculator();
                break;
            case 'clear-entry':
                clearEntry();
                break;
            case 'percentage':
                calculatePercentage();
                break;
        }
        
        updateDisplay();
        updateOperatorDisplay();
    }
    
    // 重置計算器
    function resetCalculator() {
        calculator.display = '0';
        calculator.firstOperand = null;
        calculator.operator = null;
        calculator.waitingForSecondOperand = false;
        
        updateOperatorDisplay();
        historyElement.textContent = '';
    }
    
    // 清除當前輸入
    function clearEntry() {
        calculator.display = '0';
    }
    
    // 計算百分比
    function calculatePercentage() {
        const currentValue = parseFloat(calculator.display);
        calculator.display = (currentValue / 100).toString();
    }
    
    // 平方計算
    function square() {
        const currentValue = parseFloat(calculator.display);
        const result = currentValue * currentValue;
        calculator.display = `${parseFloat(result.toFixed(10))}`;
        addToHistory(`${currentValue}² = ${result}`);
        showResultAnimation(result);
    }
    
    // 平方根計算
    function squareRoot() {
        const currentValue = parseFloat(calculator.display);
        
        if (currentValue < 0) {
            showErrorAnimation('無效輸入');
            return;
        }
        
        const result = Math.sqrt(currentValue);
        calculator.display = `${parseFloat(result.toFixed(10))}`;
        addToHistory(`√${currentValue} = ${result}`);
        showResultAnimation(result);
    }
    
    // 切換正負號
    function toggleSign() {
        const currentValue = parseFloat(calculator.display);
        calculator.display = (-currentValue).toString();
    }
    
    // 記憶體加
    function memoryAdd() {
        calculator.memory += parseFloat(calculator.display);
        showNotification(`記憶體已更新: ${calculator.memory}`);
    }
    
    // 記憶體讀取
    function memoryRecall() {
        calculator.display = calculator.memory.toString();
        updateDisplay();
        showNotification(`讀取記憶體: ${calculator.memory}`);
    }
    
    // 處理退格鍵
    function handleBackspace() {
        if (calculator.display.length > 1) {
            calculator.display = calculator.display.slice(0, -1);
        } else {
            calculator.display = '0';
        }
        updateDisplay();
    }
    
    // 更新顯示
    function updateDisplay() {
        let displayValue = calculator.display;
        
        // 格式化顯示（添加千位分隔符）
        if (displayValue.includes('.')) {
            const parts = displayValue.split('.');
            displayValue = formatNumber(parts[0]) + '.' + parts[1];
        } else {
            displayValue = formatNumber(displayValue);
        }
        
        displayTextElement.textContent = displayValue;
    }
    
    // 格式化數字（添加千位分隔符）
    function formatNumber(number) {
        const num = parseFloat(number);
        if (isNaN(num)) return number;
        
        return num.toLocaleString('zh-TW', {
            maximumFractionDigits: 10
        });
    }
    
    // 更新運算符顯示
    function updateOperatorDisplay() {
        const operatorMap = {
            '+': '+',
            '-': '-',
            '*': '×',
            '/': '÷'
        };
        
        if (calculator.operator && calculator.firstOperand !== null) {
            operatorDisplayElement.textContent = operatorMap[calculator.operator] || calculator.operator;
            historyElement.textContent = `${calculator.firstOperand} ${operatorMap[calculator.operator] || calculator.operator}`;
        } else {
            operatorDisplayElement.textContent = '';
            historyElement.textContent = '';
        }
    }
    
    // 添加到歷史記錄
    function addToHistory(expression = null) {
        const { firstOperand, display, operator } = calculator;
        
        if (!expression) {
            if (firstOperand !== null && operator) {
                const operatorMap = {
                    '+': '+',
                    '-': '-',
                    '*': '×',
                    '/': '÷'
                };
                expression = `${firstOperand} ${operatorMap[operator] || operator} ${display}`;
            } else {
                return;
            }
        }
        
        const historyItem = {
            expression: expression,
            result: calculator.display,
            timestamp: new Date().toLocaleTimeString()
        };
        
        calculator.history.unshift(historyItem);
        
        // 只保留最近的10條記錄
        if (calculator.history.length > 10) {
            calculator.history.pop();
        }
        
        updateHistoryList();
        saveSettings();
    }
    
    // 更新歷史記錄列表
    function updateHistoryList() {
        historyListElement.innerHTML = '';
        
        calculator.history.forEach((item, index) => {
            const historyItemElement = document.createElement('div');
            historyItemElement.className = 'history-item fade-in';
            historyItemElement.style.animationDelay = `${index * 0.1}s`;
            historyItemElement.innerHTML = `
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">= ${item.result}</div>
                <div class="history-time">${item.timestamp}</div>
            `;
            historyListElement.appendChild(historyItemElement);
        });
    }
    
    // 清除歷史記錄
    function clearHistory() {
        calculator.history = [];
        updateHistoryList();
        showNotification('歷史記錄已清除');
        saveSettings();
    }
    
    // 顯示結果動畫
    function showResultAnimation(result) {
        resultAnimationElement.textContent = `= ${result}`;
        resultAnimationElement.className = 'result-animation result-celebration';
        
        setTimeout(() => {
            resultAnimationElement.className = 'result-animation';
        }, 1500);
        
        // 創建粒子效果
        createCelebrationParticles();
    }
    
    // 顯示錯誤動畫
    function showErrorAnimation(message) {
        resultAnimationElement.textContent = message;
        resultAnimationElement.style.color = '#ff416c';
        resultAnimationElement.className = 'result-animation result-celebration';
        
        setTimeout(() => {
            resultAnimationElement.className = 'result-animation';
            resultAnimationElement.style.color = '';
        }, 1500);
    }
    
    // 顯示通知
    function showNotification(message) {
        // 可以在未來版本中實現更完整的通知系統
        console.log(`通知: ${message}`);
    }
    
    // 按鈕動畫
    function animateButton(button, animationClass = 'pop-animation') {
        if (!button) return;
        
        button.classList.add(animationClass);
        setTimeout(() => {
            button.classList.remove(animationClass);
        }, 300);
    }
    
    // 播放音效
    function playSound(audioElement) {
        if (calculator.soundEnabled && audioElement) {
            audioElement.currentTime = 0;
            audioElement.play().catch(e => console.log('音效播放失敗:', e));
        }
    }
    
    // 切換主題
    function toggleTheme() {
        calculator.isDarkMode = !calculator.isDarkMode;
        
        if (calculator.isDarkMode) {
            document.body.classList.add('dark-mode');
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i> 切換主題';
        } else {
            document.body.classList.remove('dark-mode');
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i> 切換主題';
        }
        
        saveSettings();
        showNotification(calculator.isDarkMode ? '深色模式已啟用' : '淺色模式已啟用');
    }
    
    // 切換音效
    function toggleSound() {
        calculator.soundEnabled = !calculator.soundEnabled;
        
        if (calculator.soundEnabled) {
            document.getElementById('soundToggle').innerHTML = '<i class="fas fa-volume-up"></i> 音效';
            showNotification('音效已啟用');
        } else {
            document.getElementById('soundToggle').innerHTML = '<i class="fas fa-volume-mute"></i> 音效';
            showNotification('音效已禁用');
        }
        
        saveSettings();
    }
    
    // 創建背景粒子
    function createParticles() {
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            createParticle();
        }
    }
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 3 + 1;
        const x = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${x}%`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.opacity = Math.random() * 0.5 + 0.2;
        particle.style.setProperty('--x', Math.random() * 2 - 1);
        
        // 隨機顏色
        const colors = ['#6a11cb', '#2575fc', '#ff416c', '#00b09b', '#ff9966'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = color;
        
        particlesContainer.appendChild(particle);
        
        // 粒子動畫結束後重新創建
        setTimeout(() => {
            particle.remove();
            createParticle();
        }, duration * 1000);
    }
    
    // 創建慶祝粒子
    function createCelebrationParticles() {
        const celebrationCount = 20;
        
        for (let i = 0; i < celebrationCount; i++) {
            setTimeout(() => {
                createCelebrationParticle();
            }, i * 50);
        }
    }
    
    function createCelebrationParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 6 + 2;
        const x = 50 + (Math.random() * 40 - 20);
        const y = 50 + (Math.random() * 40 - 20);
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;
        particle.style.animationDuration = '2s';
        particle.style.animationName = 'float';
        particle.style.opacity = 0.8;
        particle.style.setProperty('--x', Math.random() * 2 - 1);
        
        // 隨機顏色
        const colors = ['#ff416c', '#ff9966', '#00b09b', '#2575fc', '#6a11cb'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = color;
        
        particlesContainer.appendChild(particle);
        
        // 移除粒子
        setTimeout(() => {
            particle.remove();
        }, 2000);
    }
    
    // 加載設置
    function loadSettings() {
        try {
            const savedSettings = localStorage.getItem('calculatorSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                
                calculator.soundEnabled = settings.soundEnabled !== undefined ? settings.soundEnabled : true;
                calculator.isDarkMode = settings.isDarkMode !== undefined ? settings.isDarkMode : false;
                calculator.history = settings.history || [];
                
                // 應用主題
                if (calculator.isDarkMode) {
                    document.body.classList.add('dark-mode');
                    document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i> 切換主題';
                }
                
                // 更新音效按鈕
                if (!calculator.soundEnabled) {
                    document.getElementById('soundToggle').innerHTML = '<i class="fas fa-volume-mute"></i> 音效';
                }
                
                updateHistoryList();
            }
        } catch (e) {
            console.log('加載設置失敗:', e);
        }
    }
    
    // 保存設置
    function saveSettings() {
        try {
            const settings = {
                soundEnabled: calculator.soundEnabled,
                isDarkMode: calculator.isDarkMode,
                history: calculator.history
            };
            
            localStorage.setItem('calculatorSettings', JSON.stringify(settings));
        } catch (e) {
            console.log('保存設置失敗:', e);
        }
    }
});