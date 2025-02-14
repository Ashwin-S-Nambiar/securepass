// index.js
// Character sets for password generation
const charSets = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "~`!@#$%^&*()_-+={[}]|:;<>.?/"
};

// DOM Elements
const lengthInput = document.getElementById("pwd-length");
const includeUppercase = document.getElementById("include-uppercase");
const includeLowercase = document.getElementById("include-lowercase");
const includeNumbers = document.getElementById("include-numbers");
const includeSymbols = document.getElementById("include-symbols");
const pwd1Btn = document.getElementById("pwd-1");
const pwd2Btn = document.getElementById("pwd-2");
const themeToggle = document.querySelector('.theme-toggle');
const toast = document.getElementById('toast');
const root = document.documentElement; // Get the root element for theme changes

// Set current year in footer
document.getElementById('current-year').textContent = new Date().getFullYear();

// Input validation
lengthInput.addEventListener('input', (e) => {
    let value = parseInt(e.target.value);
    if (value < 8) value = 8;
    if (value > 32) value = 32;
    e.target.value = value;
});

// Generate password function
function generatePwd() {
    // Validate at least one option is selected
    if (!includeUppercase.checked && !includeLowercase.checked &&
        !includeNumbers.checked && !includeSymbols.checked) {
        showToast('Please select at least one character type');
        return;
    }

    // Build character set based on selected options
    let availableChars = '';
    if (includeUppercase.checked) availableChars += charSets.uppercase;
    if (includeLowercase.checked) availableChars += charSets.lowercase;
    if (includeNumbers.checked) availableChars += charSets.numbers;
    if (includeSymbols.checked) availableChars += charSets.symbols;

    // Generate passwords
    const length = parseInt(lengthInput.value);
    const pwd1 = generateRandomPassword(length, availableChars);
    const pwd2 = generateRandomPassword(length, availableChars);

    // Update UI
    pwd1Btn.textContent = pwd1; // Use textContent to avoid HTML injection
    pwd2Btn.textContent = pwd2;

    // Add animation class
    [pwd1Btn, pwd2Btn].forEach(btn => {
        btn.style.animation = 'none';
        btn.offsetHeight; // Trigger reflow
        btn.style.animation = 'fadeIn 0.3s ease-in-out';
        btn.classList.remove('placeholder');
    });

    // Update strength indicator for both passwords
    updateStrengthIndicator(pwd1);
    updateStrengthIndicator(pwd2);
}


// Generate random password with required characters
function generateRandomPassword(length, chars) {
    let password = '';
    const charArray = chars.split('');

    // Ensure the password contains at least one character from each selected type
    const requirements = [];
    if (includeUppercase.checked) requirements.push(charSets.uppercase[Math.floor(Math.random() * charSets.uppercase.length)]);
    if (includeLowercase.checked) requirements.push(charSets.lowercase[Math.floor(Math.random() * charSets.lowercase.length)]);
    if (includeNumbers.checked) requirements.push(charSets.numbers[Math.floor(Math.random() * charSets.numbers.length)]);
    if (includeSymbols.checked) requirements.push(charSets.symbols[Math.floor(Math.random() * charSets.symbols.length)]);

    // Add required characters first
    password = requirements.join('');

    // Fill the rest with random characters
    for (let i = requirements.length; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }

    // Shuffle the password to make it more random
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Copy password to clipboard
async function copyTextToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Password copied to clipboard!');

        // Add visual feedback
        const btn = text === pwd1Btn.textContent ? pwd1Btn : pwd2Btn;
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 1000);
    } catch (error) {
        console.error("Failed to copy text: ", error);
        showToast('Failed to copy password');
    }
}

// Toast notification
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');

    // Remove any existing timeout
    if (toast.timeoutId) clearTimeout(toast.timeoutId);

    // Set new timeout
    toast.timeoutId = setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

function incrementLength(amount) {
    let currentValue = parseInt(lengthInput.value) || 16;
    let newValue = currentValue + amount;

    // Ensure value stays within bounds
    newValue = Math.max(8, Math.min(32, newValue));

    lengthInput.value = newValue;
    generatePwd(); // Regenerate passwords with new length
}

// Copy password on click
pwd1Btn.addEventListener('click', () => {
    if (pwd1Btn.textContent && !pwd1Btn.classList.contains('placeholder')) {
        copyTextToClipboard(pwd1Btn.textContent);
    }
});

pwd2Btn.addEventListener('click', () => {
    if (pwd2Btn.textContent && !pwd2Btn.classList.contains('placeholder')) {
        copyTextToClipboard(pwd2Btn.textContent);
    }
});

// Theme toggle
const savedTheme = localStorage.getItem('theme');
let isLightTheme = savedTheme === 'light';

setTheme(isLightTheme); // Set initial theme

themeToggle.addEventListener('click', () => {
    isLightTheme = !isLightTheme;
    setTheme(isLightTheme);
    localStorage.setItem('theme', isLightTheme ? 'light' : 'dark'); // Save the state!

    // Update theme toggle icon
    const icon = themeToggle.querySelector('svg');
    icon.innerHTML = isLightTheme
        ? '<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"></path>'
        : '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>';
});

function setTheme(isLight) {
    document.body.classList.toggle('light', isLight); // More concise way
}

window.addEventListener('load', () => {
    lengthInput.value = 16;
    generatePwd();
});

function checkPasswordStrength(password) {
    let score = 0;

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;

    // Character type checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    // Complexity checks
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{12,}$/.test(password)) score++;
    if (new Set(password).size >= 8) score++;

    // Calculate final score (max 5)
    return Math.min(5, Math.floor(score / 2));
}

function updateStrengthIndicator(password) {
    const strengthScore = checkPasswordStrength(password);
    const strengthBars = document.querySelectorAll('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    // Reset all bars
    strengthBars.forEach(bar => {
        bar.className = 'strength-bar';
    });

    // Define strength levels
    const strengthLevels = [
        { class: 'very-weak', text: 'Very Weak' },
        { class: 'weak', text: 'Weak' },
        { class: 'medium', text: 'Medium' },
        { class: 'strong', text: 'Strong' },
        { class: 'very-strong', text: 'Very Strong' }
    ];

    // Update bars and text
    for (let i = 0; i < strengthScore; i++) {
        strengthBars[i].classList.add(strengthLevels[strengthScore - 1].class);
    }

    strengthText.textContent = `Password Strength: ${strengthLevels[strengthScore - 1].text}`;
}

// Initialize
window.addEventListener('load', () => {
    lengthInput.value = 16;
    generatePwd();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        generatePwd();
    }
    if (e.key === 'Enter' && document.activeElement === lengthInput) {
        generatePwd();
    }
});

// Prevent form submission
document.addEventListener('submit', (e) => e.preventDefault());

// Handle mobile touch events
let touchStartY;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    if (!touchStartY) return;

    const touchY = e.touches[0].clientY;
    const diff = touchStartY - touchY;

    if (diff > 0 && window.scrollY >= document.documentElement.scrollHeight - window.innerHeight) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchend', () => {
    touchStartY = null;
}, { passive: true });