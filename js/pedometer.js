document.addEventListener('DOMContentLoaded', () => {
    // Отримуємо елементи сторінки
    const targetTypeSelect = document.getElementById('target-type');
    const targetValueInput = document.getElementById('target-value');
    const btnStart = document.getElementById('btn-pedometer-start');
    const btnStop = document.getElementById('btn-pedometer-stop');

    const displaySteps = document.getElementById('workout-steps');
    const displayDistance = document.getElementById('workout-distance');
    const displayTime = document.getElementById('workout-time');
    const displayCalories = document.getElementById('workout-calories');
    
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');

    // Тимчасові лічильники активної сесії
    let workoutInterval = null;
    let timerInterval = null;
    
    let stepsDone = 0;
    let secondsElapsed = 0;
    let distanceDone = 0.00;
    let caloriesBurned = 0;

    // Зміна плейсхолдера під тип цілі
    if (targetTypeSelect && targetValueInput) {
        targetTypeSelect.addEventListener('change', () => {
            if (targetTypeSelect.value === 'time') {
                targetValueInput.placeholder = "Введіть час (хвилин)...";
            } else {
                targetValueInput.placeholder = "Введіть відстань (км)...";
            }
            targetValueInput.value = '';
        });
    }

    // ================= ЗАПУСК СИМУЛЯЦІЇ ДАТЧИКА =================
    if (btnStart) {
        btnStart.addEventListener('click', () => {
            const targetVal = parseFloat(targetValueInput.value);
            if (!targetVal || targetVal <= 0) {
                alert('Будь ласка, встановіть коректне значення цілі перед стартом.');
                return;
            }

            // Перемикаємо кнопки в режим запису
            btnStart.disabled = true;
            btnStart.style.opacity = '0.5';
            btnStop.disabled = false;
            btnStop.style.opacity = '1';
            targetTypeSelect.disabled = true;
            targetValueInput.disabled = true;

            // Змінюємо статус на "Активно" + неонова пульсація
            if (statusDot && statusText) {
                statusDot.style.backgroundColor = '#ccff00';
                statusDot.style.boxShadow = '0 0 12px #ccff00';
                statusText.textContent = 'Датчик активний';
                statusText.style.color = '#ccff00';
            }

            // 1. Секундомір тренування
            timerInterval = setInterval(() => {
                secondsElapsed++;
                
                const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
                const secs = (secondsElapsed % 60).toString().padStart(2, '0');
                if (displayTime) displayTime.textContent = `${mins}:${secs}`;

                // Якщо ціль — ЧАС, і його досягнуто
                if (targetTypeSelect.value === 'time' && secondsElapsed >= (targetVal * 60)) {
                    alert('Вітаємо! Ціль по часу виконана. Тренування автоматично завершується.');
                    btnStop.click();
                }
            }, 1000);

            // 2. Генератор кроків (імітує рух тіла людини кожні 600-900мс)
            function generateSteps() {
                if (btnStart.disabled === false) return; // якщо натиснуто стоп — зупиняємось

                // Симулюємо випадковий крок (від 1 до 3 кроків за імпульс)
                const stepBatch = Math.floor(Math.random() * 3) + 1;
                stepsDone += stepBatch;

                // Перераховуємо математичні показники
                distanceDone = parseFloat(((stepsDone * 0.75) / 1000).toFixed(2));
                caloriesBurned = Math.round(stepsDone * 0.04);

                // Оновлюємо цифри на моніторі
                if (displaySteps) displaySteps.textContent = stepsDone.toLocaleString();
                if (displayDistance) displayDistance.textContent = distanceDone.toFixed(2);
                if (displayCalories) displayCalories.textContent = caloriesBurned;

                // Якщо ціль — ВІДСТАНЬ, і її пройдено
                if (targetTypeSelect.value === 'distance' && distanceDone >= targetVal) {
                    alert('Чудова робота! Ціль по дистанції досягнута. Записуємо дані.');
                    btnStop.click();
                    return;
                }

                // Динамічний інтервал, щоб кроки рахувалися природно
                const randomDelay = Math.floor(Math.random() * 300) + 600;
                workoutInterval = setTimeout(generateSteps, randomDelay);
            }

            workoutInterval = setTimeout(generateSteps, 600);
        });
    }

    // ================= СТОП ТА ЗБЕРЕЖЕННЯ В ГОЛОВНЕ МЕНЮ =================
    if (btnStop) {
        btnStop.addEventListener('click', () => {
            // Гасимо таймери
            clearTimeout(workoutInterval);
            clearInterval(timerInterval);

            // Повертаємо кнопкам базовий стан
            btnStart.disabled = false;
            btnStart.style.opacity = '1';
            btnStop.disabled = true;
            btnStop.style.opacity = '0.5';
            targetTypeSelect.disabled = false;
            targetValueInput.disabled = false;

            if (statusDot && statusText) {
                statusDot.style.backgroundColor = '#ff3b30';
                statusDot.style.boxShadow = 'none';
                statusText.textContent = 'Очікування';
                statusText.style.color = '#8c8c8c';
            }

            // Зчитуємо те, що вже БУЛО набігано за день раніше
            let currentDaySteps = parseInt(localStorage.getItem('currentSteps')) || 0;
            let currentDayMinutes = parseInt(localStorage.getItem('activeMinutes')) || 0;

            // Додаємо нові результати сесії до загальних
            currentDaySteps += stepsDone;
            currentDayMinutes += Math.round(secondsElapsed / 60);

            // Записуємо назад у базу LocalStorage
            localStorage.setItem('currentSteps', currentDaySteps.toString());
            localStorage.setItem('activeMinutes', currentDayMinutes.toString());

            alert(`Тренування завершено й додано до суми дня!\nПройдено: +${stepsDone} кроків\nАктивність: +${Math.round(secondsElapsed / 60)} хв.`);

            // Очищуємо монітор тренажера для нової сесії
            stepsDone = 0;
            secondsElapsed = 0;
            distanceDone = 0.00;
            caloriesBurned = 0;

            if (displaySteps) displaySteps.textContent = '0';
            if (displayDistance) displayDistance.textContent = '0.00';
            if (displayTime) displayTime.textContent = '00:00';
            if (displayCalories) displayCalories.textContent = '0';
            if (targetValueInput) targetValueInput.value = '';

            // Автоматично повертаємо користувача на Головне Меню, де він побачить оновлені графіки
            window.location.href = 'dashboard.html';
        });
    }
});