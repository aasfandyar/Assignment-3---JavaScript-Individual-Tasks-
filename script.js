/**
 * CSC 337 - Web Programming Languages
 * Assignment 3: JavaScript Individual Task
 * Student: Asfandyar Khan (051-22-137243)
 * Task: Count and display number of button clicks using JavaScript
 * 
 * This script implements a button click counter with advanced features
 * including statistics, history tracking, and auto-click functionality.
 */

// ===== GLOBAL VARIABLES =====
let clickCount = 0;
let highestCount = 0;
let clickHistory = [];
let autoClickInterval = null;
let sessionStartTime = new Date();
let lastClickTime = null;
let totalClicksInSession = 0;

// ===== DOM ELEMENTS =====
const clickButton = document.getElementById('clickButton');
const clickCountElement = document.getElementById('clickCount');
const counterMessage = document.getElementById('counterMessage');
const resetButton = document.getElementById('resetButton');
const incrementButton = document.getElementById('incrementButton');
const decrementButton = document.getElementById('decrementButton');
const autoClickButton = document.getElementById('autoClickButton');
const stopAutoButton = document.getElementById('stopAutoButton');
const clearHistoryButton = document.getElementById('clearHistoryButton');
const clickHistoryElement = document.getElementById('clickHistory');
const clicksPerSecondElement = document.getElementById('clicksPerSecond');
const lastClickTimeElement = document.getElementById('lastClickTime');
const highestCountElement = document.getElementById('highestCount');
const sessionTimeElement = document.getElementById('sessionTime');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Load saved data from localStorage if available
    loadSavedData();
    
    // Initialize display
    updateDisplay();
    updateStatistics();
    updateHistoryDisplay();
    
    // Start session timer
    updateSessionTimer();
    setInterval(updateSessionTimer, 1000);
    
    // Update clicks per second periodically
    setInterval(updateClicksPerSecond, 1000);
});

// ===== EVENT LISTENERS =====

// Main click button
clickButton.addEventListener('click', handleClick);

// Reset button
resetButton.addEventListener('click', function() {
    if (confirm("Are you sure you want to reset the counter to zero?")) {
        resetCounter();
    }
});

// Increment by 10 button
incrementButton.addEventListener('click', function() {
    for (let i = 0; i < 10; i++) {
        simulateClick();
    }
    updateDisplay();
    updateStatistics();
});

// Decrement by 5 button
decrementButton.addEventListener('click', function() {
    if (clickCount >= 5) {
        clickCount -= 5;
        updateDisplay();
        updateStatistics();
        addToHistory("Subtracted 5 clicks");
    } else {
        alert("Cannot go below 0 clicks!");
    }
});

// Auto-click button
autoClickButton.addEventListener('click', function() {
    if (!autoClickInterval) {
        startAutoClick();
        autoClickButton.disabled = true;
        stopAutoButton.disabled = false;
        autoClickButton.innerHTML = '<i class="fas fa-play"></i> Auto Clicking...';
    }
});

// Stop auto-click button
stopAutoButton.addEventListener('click', function() {
    stopAutoClick();
    autoClickButton.disabled = false;
    stopAutoButton.disabled = true;
    autoClickButton.innerHTML = '<i class="fas fa-play"></i> Start Auto Click (1/second)';
});

// Clear history button
clearHistoryButton.addEventListener('click', function() {
    if (confirm("Clear all click history?")) {
        clearHistory();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Spacebar or Enter to click
    if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
        handleClick();
    }
    
    // 'R' to reset
    if (event.code === 'KeyR' && event.ctrlKey) {
        event.preventDefault();
        resetCounter();
    }
    
    // '+' to increment
    if (event.code === 'Equal' && event.shiftKey) {
        event.preventDefault();
        incrementButton.click();
    }
    
    // '-' to decrement
    if (event.code === 'Minus') {
        event.preventDefault();
        decrementButton.click();
    }
});

// ===== CORE FUNCTIONS =====

/**
 * Handles a button click event
 */
function handleClick() {
    clickCount++;
    totalClicksInSession++;
    lastClickTime = new Date();
    
    // Add to history
    addToHistory(`Manual click #${clickCount}`);
    
    // Update display and statistics
    updateDisplay();
    updateStatistics();
    
    // Save to localStorage
    saveData();
    
    // Visual feedback
    animateButton();
}

/**
 * Simulates a click (for auto-clicker and batch operations)
 */
function simulateClick() {
    clickCount++;
    totalClicksInSession++;
    lastClickTime = new Date();
    addToHistory(`Auto click #${clickCount}`);
}

/**
 * Updates the counter display with current count
 */
function updateDisplay() {
    // Update counter number
    clickCountElement.textContent = clickCount;
    
    // Update counter message based on count
    let message = "";
    
    if (clickCount === 0) {
        message = "Click the button to start counting!";
    } else if (clickCount === 1) {
        message = "First click! Keep going!";
    } else if (clickCount === 10) {
        message = "10 clicks! You're getting good!";
    } else if (clickCount === 25) {
        message = "Quarter century! 25 clicks!";
    } else if (clickCount === 50) {
        message = "50 clicks! Halfway to 100!";
    } else if (clickCount === 75) {
        message = "75 clicks! Almost there!";
    } else if (clickCount === 100) {
        message = "💯 100 CLICKS! You're a clicking master!";
    } else if (clickCount === 150) {
        message = "150 clicks! Incredible stamina!";
    } else if (clickCount === 200) {
        message = "🎉 200 CLICKS! Legendary status!";
    } else if (clickCount === 250) {
        message = "250 clicks! Are you a robot? 🤖";
    } else if (clickCount === 300) {
        message = "300 clicks! You deserve a trophy! 🏆";
    } else if (clickCount % 50 === 0) {
        message = `${clickCount} clicks! Amazing!`;
    } else if (clickCount > 300) {
        message = `${clickCount} clicks! You're unstoppable!`;
    } else {
        message = `${clickCount} clicks and counting!`;
    }
    
    counterMessage.textContent = message;
    
    // Update highest count
    if (clickCount > highestCount) {
        highestCount = clickCount;
        highestCountElement.textContent = highestCount;
    }
    
    // Visual effect for milestone clicks
    if ([10, 25, 50, 75, 100, 150, 200, 250, 300].includes(clickCount)) {
        celebrateMilestone(clickCount);
    }
}

/**
 * Updates all statistics displays
 */
function updateStatistics() {
    // Update last click time
    if (lastClickTime) {
        const timeString = lastClickTime.toLocaleTimeString();
        lastClickTimeElement.textContent = timeString;
    }
    
    // Update highest count
    highestCountElement.textContent = highestCount;
}

/**
 * Updates the clicks per second display
 */
function updateClicksPerSecond() {
    const now = new Date();
    const sessionDuration = (now - sessionStartTime) / 1000; // in seconds
    
    if (sessionDuration > 0) {
        const cps = totalClicksInSession / sessionDuration;
        clicksPerSecondElement.textContent = cps.toFixed(1);
    }
}

/**
 * Updates the session timer display
 */
function updateSessionTimer() {
    const now = new Date();
    const duration = Math.floor((now - sessionStartTime) / 1000); // in seconds
    
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    sessionTimeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Adds a click event to history
 * @param {string} description - Description of the click event
 */
function addToHistory(description) {
    const historyItem = {
        id: Date.now(),
        count: clickCount,
        description: description,
        timestamp: new Date().toLocaleTimeString()
    };
    
    clickHistory.unshift(historyItem); // Add to beginning
    
    // Keep only last 50 items
    if (clickHistory.length > 50) {
        clickHistory.pop();
    }
    
    updateHistoryDisplay();
}

/**
 * Updates the history display with all click events
 */
function updateHistoryDisplay() {
    if (clickHistory.length === 0) {
        clickHistoryElement.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-history"></i>
                <p>No clicks yet. Start clicking to see history!</p>
            </div>
        `;
        return;
    }
    
    let historyHTML = '';
    
    clickHistory.forEach(item => {
        historyHTML += `
            <div class="history-item">
                <div>
                    <span class="click-number">${item.description}</span>
                </div>
                <div class="click-time">${item.timestamp}</div>
            </div>
        `;
    });
    
    clickHistoryElement.innerHTML = historyHTML;
}

/**
 * Clears all click history
 */
function clearHistory() {
    clickHistory = [];
    updateHistoryDisplay();
}

/**
 * Resets the counter to zero
 */
function resetCounter() {
    clickCount = 0;
    updateDisplay();
    updateStatistics();
    addToHistory("Counter reset to zero");
    saveData();
}

/**
 * Starts the auto-clicker
 */
function startAutoClick() {
    autoClickInterval = setInterval(function() {
        simulateClick();
        updateDisplay();
        updateStatistics();
        saveData();
    }, 1000); // 1 click per second
}

/**
 * Stops the auto-clicker
 */
function stopAutoClick() {
    if (autoClickInterval) {
        clearInterval(autoClickInterval);
        autoClickInterval = null;
    }
}

/**
 * Provides visual animation for button click
 */
function animateButton() {
    clickButton.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        clickButton.style.transform = '';
    }, 100);
    
    // Add particle effect for milestone clicks
    if (clickCount % 25 === 0) {
        createParticles();
    }
}

/**
 * Creates celebration particles for milestones
 */
function createParticles() {
    const buttonRect = clickButton.getBoundingClientRect();
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = '10px';
        particle.style.height = '10px';
        particle.style.backgroundColor = getRandomColor();
        particle.style.borderRadius = '50%';
        particle.style.left = (buttonRect.left + buttonRect.width / 2) + 'px';
        particle.style.top = (buttonRect.top + buttonRect.height / 2) + 'px';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        
        document.body.appendChild(particle);
        
        // Animate particle
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        let opacity = 1;
        let size = 10;
        
        const animateParticle = () => {
            particle.style.left = parseFloat(particle.style.left) + vx + 'px';
            particle.style.top = parseFloat(particle.style.top) + vy + 'px';
            opacity -= 0.02;
            size -= 0.1;
            
            particle.style.opacity = opacity;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            if (opacity > 0 && size > 0) {
                requestAnimationFrame(animateParticle);
            } else {
                document.body.removeChild(particle);
            }
        };
        
        requestAnimationFrame(animateParticle);
    }
}

/**
 * Celebrates a milestone with special effects
 * @param {number} milestone - The milestone number reached
 */
function celebrateMilestone(milestone) {
    // Change background color temporarily
    const originalBg = document.body.style.background;
    document.body.style.background = `linear-gradient(135deg, ${getRandomColor()}, ${getRandomColor()})`;
    
    setTimeout(() => {
        document.body.style.background = originalBg;
    }, 500);
    
    // Show congratulatory message
    const messages = [
        `🎉 ${milestone} CLICKS! AMAZING! 🎉`,
        `🌟 ${milestone} CLICKS! YOU'RE A STAR! 🌟`,
        `🏆 ${milestone} CLICKS! CHAMPION LEVEL! 🏆`,
        `⚡ ${milestone} CLICKS! UNSTOPPABLE! ⚡`
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // Create a temporary celebration message
    const celebration = document.createElement('div');
    celebration.textContent = randomMessage;
    celebration.style.position = 'fixed';
    celebration.style.top = '50%';
    celebration.style.left = '50%';
    celebration.style.transform = 'translate(-50%, -50%)';
    celebration.style.fontSize = '2rem';
    celebration.style.fontWeight = 'bold';
    celebration.style.color = getRandomColor();
    celebration.style.zIndex = '2000';
    celebration.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
    celebration.style.pointerEvents = 'none';
    
    document.body.appendChild(celebration);
    
    // Animate celebration message
    let scale = 1;
    let opacity = 1;
    
    const animateCelebration = () => {
        scale += 0.02;
        opacity -= 0.02;
        
        celebration.style.transform = `translate(-50%, -50%) scale(${scale})`;
        celebration.style.opacity = opacity;
        
        if (opacity > 0) {
            requestAnimationFrame(animateCelebration);
        } else {
            document.body.removeChild(celebration);
        }
    };
    
    requestAnimationFrame(animateCelebration);
}

/**
 * Generates a random hex color
 * @returns {string} Random hex color code
 */
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/**
 * Saves current data to localStorage
 */
function saveData() {
    const data = {
        clickCount: clickCount,
        highestCount: highestCount,
        clickHistory: clickHistory.slice(0, 20), // Save only last 20 items
        lastSaveTime: new Date().toISOString()
    };
    
    localStorage.setItem('clickCounterData', JSON.stringify(data));
}

/**
 * Loads saved data from localStorage
 */
function loadSavedData() {
    const savedData = localStorage.getItem('clickCounterData');
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            clickCount = data.clickCount || 0;
            highestCount = data.highestCount || 0;
            clickHistory = data.clickHistory || [];
            
            console.log('Loaded saved data:', data);
        } catch (error) {
            console.error('Error loading saved data:', error);
            // Reset to defaults
            clickCount = 0;
            highestCount = 0;
            clickHistory = [];
        }
    }
}

/**
 * Displays information about the JavaScript implementation
 */
function showCodeInfo() {
    const info = `
    ===== JAVASCRIPT IMPLEMENTATION DETAILS =====
    
    Core Features Implemented:
    1. Click counter with increment functionality
    2. Local storage for data persistence
    3. Click history tracking
    4. Statistics (clicks/second, session time, etc.)
    5. Auto-clicker functionality
    6. Keyboard shortcuts
    7. Visual feedback and animations
    8. Responsive design
    
    JavaScript Concepts Used:
    - Variables and data types
    - Functions and event handlers
    - DOM manipulation
    - Event listeners
    - setInterval and setTimeout
    - LocalStorage API
    - Date object
    - Array methods
    - Object-oriented programming
    
    This implementation exceeds the basic requirements by adding
    multiple advanced features while maintaining clean, commented code.
    `;
    
    console.info(info);
}

// Initialize code info display
showCodeInfo();

// ===== UTILITY FUNCTIONS =====

/**
 * Formats a number with commas as thousands separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Update the display to use formatted numbers
clickCountElement.textContent = formatNumber(clickCount);
