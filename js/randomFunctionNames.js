// Function to extract array from span content
const getItemsFromSpan = (spanId) => {
    const span = document.getElementById(spanId);
    if (span) {
        return span.textContent.split(',').map(item => item.trim());
    }
    return [];
};

// Load actions and objects from spans
let actions = [];
let objects = [];
let objectTools = [];

// Load after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    actions = getItemsFromSpan('actions');
    objects = getItemsFromSpan('objects');
    objectTools = getItemsFromSpan('object-tools');
});

// Function to get a random item from an array
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Function to generate random function names
const generateFunctionName = () => {
    const action = getRandomItem(actions);
    const firstObject = getRandomItem([...objects, ...objectTools]);

    // Randomly decide if a compound object name should be created
    const compound = Math.random() > 0.7;
    if (compound) {
        // Only use regular objects as the second object
        const secondObject = getRandomItem(objects);
        return `${action}-${firstObject}-${secondObject}`;
    }

    return `${action}-${firstObject}`;
};

// Generate a list of random function names
const generateFunctionNames = (count = 10) => {
    const names = [];
    for (let i = 0; i < count; i++) {
        names.push(generateFunctionName());
    }
    return names;
};

// Display the function names on the page
const displayFunctionNames = () => {
    const container = document.getElementById('function-names');
    container.innerHTML = generateFunctionNames().map(name => `<li>${name}</li>`).join('');
};

// Run on page load
document.addEventListener('DOMContentLoaded', displayFunctionNames);

// Add event listener to the button
document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('generate-function-names');
    if (button) {
        button.addEventListener('click', displayFunctionNames);
    }
});
