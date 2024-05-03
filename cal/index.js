const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 9876;

const windowSize = 10;
let numbers = [];

async function fetchNumbers(numberType) {
    try {
        const response = await axios.get(`http://20.244.56.144/test/${numberType}`, { timeout: 500 });
        return response.data.numbers || [];
    } catch (error) {
        console.error('Error fetching numbers:', error.message);
        return [];
    }
}

function updateNumbers(newNumbers) {
    numbers = Array.from(new Set([...numbers, ...newNumbers])).slice(-windowSize);
}

function calculateAverage() {
    const currentWindow = numbers.slice(-windowSize);
    if (currentWindow.length > 0) {
        const sum = currentWindow.reduce((acc, num) => acc + num, 0);
        return sum / currentWindow.length;
    }
    return null;
}

app.get('/numbers/:numberid', async (req, res) => {
    const numberId = req.params.numberid;

    const newNumbers = await fetchNumbers(numberId);

    updateNumbers(newNumbers);

    const average = calculateAverage();

    const response = {
        windowPrevState: numbers.slice(0, -newNumbers.length),
        windowCurrState: numbers,
        average: average
    };

    res.json(response);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
