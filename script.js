const fields = ['liters', 'density', 'remainder', 'fob'];
const maxLengths = { liters: 5, density: 5, remainder: 4, fob: 5 };
let currentFieldIndex = 0;
let activeInput = document.getElementById(fields[0]);

function handleInput(value) {
    if (!activeInput) return;

    if (activeInput.id === 'density') {
        handleDensityInput(value);
    } else {
        activeInput.value += value;
        checkMaxLength();
    }
    validateInputs();
    activeInput.focus();
}

function handleDensityInput(value) {
    let current = activeInput.value.replace(/[^0-9]/g, '');

    if (value === '.') {
        if (!current.includes('.')) current += '.';
    } else {
        current += value;
    }

    if (current.length === 4 && !current.startsWith('0')) {
        current = '0.' + current;
    } else if (current.length === 5 && current.startsWith('0')) {
        current = current.slice(0,1) + '.' + current.slice(1,5);
    }

    activeInput.value = current.slice(0,6);
    checkMaxLength();
}

function checkMaxLength() {
    if (activeInput.value.length >= maxLengths[activeInput.id]) {
        if (activeInput.id !== 'fob') {
            switchField(1);
        }
    }
}

function switchField(direction) {
    currentFieldIndex = (currentFieldIndex + direction + fields.length) % fields.length;
    activeInput = document.getElementById(fields[currentFieldIndex]);
    activeInput.focus();
}

function clearField() {
    if (activeInput) {
        activeInput.value = '';
        validateInputs();
        activeInput.focus();
    }
}

function handleBackspace() {
    if (activeInput) {
        activeInput.value = activeInput.value.slice(0, -1);
        validateInputs();
        activeInput.focus();
    }
}

function showResetModal() {
    document.getElementById('resetModal').style.display = 'flex';
}

function hideResetModal() {
    document.getElementById('resetModal').style.display = 'none';
}

function resetAll() {
    fields.forEach(id => document.getElementById(id).value = '');
    currentFieldIndex = 0;
    activeInput = document.getElementById(fields[0]);
    hideResetModal();
    validateInputs();
    activeInput.focus();
}

function validateInputs() {
    // Получаем значения полей как строки с обрезкой пробелов
    const litersStr = document.getElementById('liters').value.trim();
    const densityStr = document.getElementById('density').value.trim();
    const remainderStr = document.getElementById('remainder').value.trim();
    const fobStr = document.getElementById('fob').value.trim();

    // Приводим числовые значения (если не указаны — 0)
    const liters = parseFloat(litersStr) || 0;
    const density = parseFloat(densityStr) || 0;
    const remainder = parseFloat(remainderStr) || 0;
    const fob = parseFloat(fobStr) || 0;

    const statusCard = document.getElementById('statusCard');

    // Если заполнены только "Заправка (л)" и "Плотность"
    if (litersStr !== "" && densityStr !== "" && (remainderStr === "" || fobStr === "")) {
        let fuelKg = 0;
        if (density >= 0.75 && density <= 0.86) {
            fuelKg = liters * density;
        }
        statusCard.innerHTML = `
            <div class="status-icon"><i class="fas fa-gas-pump"></i></div>
            <div class="status-content" id="statusContent">Заправка: ${fuelKg.toFixed(0)} кг</div>
        `;
        statusCard.style.background = 'var(--status-bg)';
        return;
    }

    // Если заполнены все 4 поля
    if (litersStr !== "" && densityStr !== "" && remainderStr !== "" && fobStr !== "") {
        let fuelKg = 0;
        if (density >= 0.75 && density <= 0.86) {
            fuelKg = liters * density;
        }
        const totalFuel = (fuelKg + remainder).toFixed(0);
        const diff = Math.abs(fob - (fuelKg + remainder));
        const isValid = diff <= 200;

        statusCard.innerHTML = `
            <div class="status-icon">${isValid ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}</div>
            <div class="status-content">
                <div class="calculation-line">
                    <i class="fas fa-gas-pump comparison-sign"></i>
                    <span class="fuel-value" id="totalCalc">${totalFuel}</span>
                     |
                    <i class="fas fa-plane comparison-sign"></i>
                    <span class="fuel-value" id="fobValue">${fob}</span>
                </div>
                <div class="deviation" id="deviationInfo">Разница: ${diff.toFixed(0)} кг</div>
            </div>
        `;
        statusCard.style.background = isValid ? 'var(--success)' : 'var(--error)';
        return;
    }

    // Если ни одно из условий не выполнено – отображаем начальное состояние
    statusCard.innerHTML = `
        <div class="status-icon"><i class="fa-solid fa-arrow-down-long"></i></div>
        <div class="status-content" id="statusContent">Введите значения</div>
    `;
    statusCard.style.background = 'var(--status-bg)';
}


// Инициализация
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', () => {
        activeInput = input;
        currentFieldIndex = fields.indexOf(input.id);
    });

    input.addEventListener('blur', () => {
        if (input.id === 'density') {
            let value = input.value.replace(/[^0-9.]/g, '');
            if (value.length === 4 && !value.includes('.')) {
                value = '0.' + value;
            }
            input.value = value.slice(0,5);
        }
    });

    activeInput.focus();
});