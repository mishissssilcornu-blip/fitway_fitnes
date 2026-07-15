document.addEventListener('DOMContentLoaded', () => {
    // Елементи реєстрації
    const formStep1 = document.getElementById('form-step-1');
    const formStep2 = document.getElementById('form-step-2');
    const btnBack = document.getElementById('btn-back');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');

    // ================= ЗОНІШНІЙ ВИГЛЯД МЕНЮ (НІКНЕЙМ КОРИСТУВАЧА) =================
    // Цей блок працює на ВСІХ сторінках (Головна, Крокомір, Профіль тощо)
    // Він шукає блок користувача у верхньому кутку і вставляє туди твій реальний нікнейм
    const username = localStorage.getItem('username') || 'АНДРІЙ'; // 'АНДРІЙ' — дефолт для тесту, якщо не пройшли реєстрацію
    const userNameElement = document.querySelector('.user-info .name');
    if (userNameElement) {
        userNameElement.textContent = username.toUpperCase();
    }


    // ================= РЕЄСТРАЦІЯ: КРОК 1 (Нікнейм та Email) =================
    if (formStep1) {
        formStep1.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('username', document.getElementById('username').value);
            localStorage.setItem('email', document.getElementById('email').value);
            window.location.href = 'index2.html'; 
        });
    }

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
            togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
        });
    }


    // ================= РЕЄСТРАЦІЯ: КРОК 2 (Параметри тіла) =================
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    if (formStep2) {
        formStep2.addEventListener('submit', (e) => {
            e.preventDefault();

            const birthdate = document.getElementById('birthdate').value;
            const gender = document.getElementById('gender').value;
            const weight = parseFloat(document.getElementById('weight').value);
            const height = parseFloat(document.getElementById('height').value);

            // Розрахунок віку на основі дати народження
            const birthYear = new Date(birthdate).getFullYear();
            const currentYear = new Date().getFullYear();
            const age = currentYear - birthYear;

            // Формули денних норм
            const waterTarget = (weight * 0.035).toFixed(1); 
            let bmr = (10 * weight) + (6.25 * height) - (5 * age);
            bmr = gender === 'male' ? bmr + 5 : bmr - 161;
            const caloriesTarget = Math.round(bmr * 1.2); 

            // Зберігаємо всі введені фізичні дані в пам'ять
            localStorage.setItem('gender', gender);
            localStorage.setItem('birthdate', birthdate);
            localStorage.setItem('age', age.toString());
            localStorage.setItem('weight', weight.toString());
            localStorage.setItem('height', height.toString());
            localStorage.setItem('waterTarget', waterTarget);
            localStorage.setItem('caloriesTarget', caloriesTarget);
            
            // Скидаємо щоденний прогрес нового користувача на 0
            localStorage.setItem('currentSteps', '0');
            localStorage.setItem('currentWater', '0');
            localStorage.setItem('activeMinutes', '0');
            
            localStorage.setItem('isRegistered', 'true');
            window.location.href = 'dashboard.html'; 
        });
    }


    // ================= ГОЛОВНЕ МЕНЮ / ДАШБОРД (Рендеринг статистики) =================
    function renderDashboard() {
        const waterTarget = parseFloat(localStorage.getItem('waterTarget')) || 2.5; 
        const caloriesTarget = parseInt(localStorage.getItem('caloriesTarget')) || 2200;

        const currentSteps = parseInt(localStorage.getItem('currentSteps')) || 0;
        const currentWater = parseFloat(localStorage.getItem('currentWater')) || 0;
        const activeMinutes = parseInt(localStorage.getItem('activeMinutes')) || 0;

        const burnedCalories = Math.round(currentSteps * 0.04);
        const glassesTarget = Math.round(waterTarget / 0.25);
        const currentDistance = ((currentSteps * 0.75) / 1000).toFixed(2);

        // 1. Картка: Кроки
        const stepsCard = document.querySelectorAll('.stat-card')[0];
        if (stepsCard) {
            stepsCard.querySelector('.stat-value').textContent = currentSteps.toLocaleString();
            const progress = Math.min((currentSteps / 10000) * 100, 100);
            stepsCard.querySelector('.progress-fill').style.width = `${progress}%`;
        }

        // 2. Картка: Калорії
        const caloriesCard = document.querySelectorAll('.stat-card')[1];
        if (caloriesCard) {
            caloriesCard.querySelector('.stat-value').textContent = burnedCalories;
            caloriesCard.querySelector('.stat-target').textContent = `/ ${caloriesTarget} ккал`;
            const progress = Math.min((burnedCalories / caloriesTarget) * 100, 100);
            caloriesCard.querySelector('.progress-fill').style.width = `${progress}%`;
        }

        // 3. Картка: Вода
        const waterCard = document.querySelectorAll('.stat-card')[2];
        if (waterCard) {
            const currentGlasses = Math.round(currentWater / 0.25);
            waterCard.querySelector('.stat-value').textContent = currentWater.toFixed(2);
            waterCard.querySelector('.stat-target').textContent = `/ ${waterTarget} л (${currentGlasses}/${glassesTarget} скл.)`;
            const progress = Math.min((currentWater / waterTarget) * 100, 100);
            waterCard.querySelector('.progress-fill').style.width = `${progress}%`;
        }

        // 4. Картка: Дистанція
        const distanceCard = document.querySelectorAll('.stat-card')[3];
        if (distanceCard) {
            distanceCard.querySelector('.stat-value').textContent = currentDistance;
            const progress = Math.min((parseFloat(currentDistance) / 10) * 100, 100);
            distanceCard.querySelector('.progress-fill').style.width = `${progress}%`;
        }

        // Права таблиця загальної аналітики
        const detailedItems = document.querySelectorAll('.detailed-item span:last-child');
        if (detailedItems.length >= 5) {
            detailedItems[0].textContent = `${currentSteps} кроків`;
            detailedItems[1].textContent = `${burnedCalories} ккал`;
            detailedItems[2].textContent = `${currentWater.toFixed(2)} л / ${waterTarget} л`;
            detailedItems[3].textContent = `${currentDistance} км`;
            detailedItems[4].textContent = `${activeMinutes} хв`;
        }

        // Графік активності (стовпчики)
        const bars = document.querySelectorAll('.bar');
        bars.forEach((bar, index) => {
            if (currentSteps > 0) {
                let segmentRatio = (index + 1) * 8;
                let heightValue = Math.min((currentSteps / 10000) * segmentRatio, 100);
                bar.style.height = `${heightValue}%`;
            } else {
                bar.style.height = '5%';
            }
        });
    }

    // Логіка інтерактивного ПЛЮСИКА ВОДИ на Дашборді
    const addWaterBtn = document.getElementById('quick-add-water');
    if (addWaterBtn) {
        renderDashboard(); 

        addWaterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addWaterBtn.style.transform = 'scale(0.8)';
            setTimeout(() => addWaterBtn.style.transform = 'scale(1)', 100);

            let currentWater = parseFloat(localStorage.getItem('currentWater')) || 0;
            currentWater += 0.25; 
            localStorage.setItem('currentWater', currentWater.toString());
            
            renderDashboard(); 
        });
    }


    // ================= СТОРІНКА ПРОФІЛЮ (profile.html) =================
    // Перевіряємо, чи ми зараз перебуваємо на сторінці профілю
    const profileNameElement = document.getElementById('profile-name');
    if (profileNameElement) {
        
        // Зчитуємо абсолютно ВСІ зареєстровані дані з пам'яті браузера
        const email = localStorage.getItem('email') || 'не вказано';
        const rawGender = localStorage.getItem('gender');
        const genderText = rawGender === 'male' ? 'Чоловік' : (rawGender === 'female' ? 'Жінка' : 'Не вказано');
        const age = localStorage.getItem('age') || '-';
        const weight = localStorage.getItem('weight') || '-';
        const height = localStorage.getItem('height') || '-';
        const caloriesTarget = localStorage.getItem('caloriesTarget') || '2000';
        const waterTarget = localStorage.getItem('waterTarget') || '2.0';

        // Виводимо нікнейм у головний заголовок картки профілю
        profileNameElement.textContent = username.toUpperCase();

        // Заповнюємо інформаційні поля профілю реальними даними
        if (document.getElementById('profile-email')) {
            document.getElementById('profile-email').textContent = email;
        }
        if (document.getElementById('info-gender')) {
            document.getElementById('info-gender').textContent = genderText;
        }
        if (document.getElementById('info-age')) {
            document.getElementById('info-age').textContent = `${age} років`;
        }
        if (document.getElementById('info-weight')) {
            document.getElementById('info-weight').textContent = `${weight} кг`;
        }
        if (document.getElementById('info-height')) {
            document.getElementById('info-height').textContent = `${height} см`;
        }
        if (document.getElementById('info-calories')) {
            document.getElementById('info-calories').textContent = `${caloriesTarget} ккал`;
        }
        if (document.getElementById('info-water')) {
            document.getElementById('info-water').textContent = `${waterTarget} л`;
        }

        // Робоча кнопка "Вийти з акаунта"
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Ви дійсно хочете вийти? Усі дані покрокової активності за сьогодні буде скинуто.')) {
                    localStorage.clear(); // Повне очищення сховища
                    window.location.href = 'index.html'; // Повернення на початковий екран реєстрації
                }
            });
        }
    }
});