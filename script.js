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
        switchField(1);
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
    }
}

function handleBackspace() {
    if (activeInput) {
        activeInput.value = activeInput.value.slice(0, -1);
        validateInputs();
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
}

function validateInputs() {
    const liters = parseFloat(document.getElementById('liters').value) || 0;
    const densityValue = document.getElementById('density').value;
    const density = parseFloat(densityValue);
    const remainder = parseFloat(document.getElementById('remainder').value);
    const fob = parseFloat(document.getElementById('fob').value);

    const statusCard = document.getElementById('statusCard');
    const statusIcon = statusCard.querySelector('.status-icon');
    const totalCalc = document.getElementById('totalCalc');
    const fobValue = document.getElementById('fobValue');
    const deviationInfo = document.getElementById('deviationInfo');

    // Получаем значения как строки (trim чтобы убрать лишние пробелы)
    const litersStr = document.getElementById('liters').value.trim();
    const densityStr = document.getElementById('density').value.trim();
    const remainderStr = document.getElementById('remainder').value.trim();
    const fobStr = document.getElementById('fob').value.trim();

    // Если заполнены только "Заправка (л)" и "Плотность", а остальные пусты:
    if (litersStr !== "" && densityStr !== "" && remainderStr === "" && fobStr === "") {
        const liters = parseFloat(litersStr);
        const density = parseFloat(densityStr);
        let fuelKg = 0;
        if (density >= 0.75 && density <= 0.86) {
            fuelKg = liters * density;
        }
        const statusCard = document.getElementById('statusCard');
        statusCard.style.background = 'var(--status-bg)';
        const statusIcon = statusCard.querySelector('.status-icon');
        statusIcon.innerHTML = '<i class="fas fa-gas-pump"></i>';
        // Отображаем текст с рассчитанным значением топлива в кг
        const totalCalc = document.getElementById('statusContent');
        totalCalc.textContent = `Заправка (кг): ${fuelKg.toFixed(0)}`;
        // Очищаем оставшиеся элементы статуса
        document.getElementById('fobValue').textContent = '';
        document.getElementById('deviationInfo').textContent = '';
        return; // завершаем выполнение функции, чтобы ниже не перезаписать
    }

    // Расчет топлива
    let fuelKg = 0;
    if (liters && density >= 0.75 && density <= 0.86) {
        fuelKg = liters * density;
        totalCalc.textContent = `${(fuelKg + (remainder || 0)).toFixed(0)}`;
    } else {
        totalCalc.textContent = '-';
    }

    // Обновление статуса
    if (!isNaN(fob) && !isNaN(remainder) && density >= 0.75 && density <= 0.86) {
        const total = fuelKg + remainder;
        const diff = Math.abs(fob - total);
        const isValid = diff <= 200;

        statusCard.style.background = isValid ? 'var(--success)' : 'var(--error)';
        statusIcon.innerHTML = isValid ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>';
        fobValue.textContent = `${fob}`;
        deviationInfo.innerHTML = `Разница: ${diff.toFixed(0)} кг`;
    } else {
        statusCard.style.background = 'var(--status-bg)';
        statusIcon.innerHTML = '';
        fobValue.textContent = '-';
        deviationInfo.textContent = '';
    }
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
});