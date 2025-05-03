// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand(); // Развернуть приложение на всю высоту

// Данные пользователя и параметры заказа
let userData = {
    chatId: tg.initDataUnsafe?.user?.id || null,
    tariff: null,
    selectedDate: null,
    selectedTime: null
};

// Получение ссылок на экраны
const screens = {
    main: document.getElementById('main-menu'),
    tariff: document.getElementById('tariff-screen'),
    date: document.getElementById('date-screen'),
    time: document.getElementById('time-screen'),
    confirm: document.getElementById('confirm-screen'),
    myCleanings: document.getElementById('my-cleanings-screen')
};

// Инициализация темы
function initTheme() {
    // Получаем и применяем тему из Telegram
    const colorScheme = tg.colorScheme || 'light';
    document.documentElement.setAttribute('data-theme', colorScheme);
    
    // Отслеживаем изменение темы в Telegram
    tg.onEvent('themeChanged', () => {
        document.documentElement.setAttribute('data-theme', tg.colorScheme);
    });
}

// Показать индикатор загрузки
function showLoader() {
    // Создаем элемент лоадера, если его ещё нет
    if (!document.querySelector('.loading')) {
        const loader = document.createElement('div');
        loader.className = 'loading';
        loader.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(loader);
    } else {
        document.querySelector('.loading').style.display = 'flex';
    }
}

// Скрыть индикатор загрузки
function hideLoader() {
    const loader = document.querySelector('.loading');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
            loader.style.opacity = '1';
        }, 300);
    }
}

// Функция для переключения экранов с анимацией
function showScreen(screenId) {
    showLoader();
    
    // Скрываем все экраны с анимацией fadeOut
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Добавляем небольшую задержку перед показом нового экрана
    setTimeout(() => {
        // Показываем нужный экран
        screens[screenId].classList.add('active');
        
        // Анимируем появление элементов внутри экрана
        const elementsToAnimate = screens[screenId].querySelectorAll('h2, .primary-btn, .tariff-card, .time-slot, .confirm-details, .cleaning-item');
        elementsToAnimate.forEach((el, index) => {
            el.classList.add('slide-in-up');
            el.style.animationDelay = `${index * 0.05}s`;
            // Удаляем класс анимации после завершения
            el.addEventListener('animationend', () => {
                el.classList.remove('slide-in-up');
                el.style.animationDelay = '';
            }, { once: true });
        });
        
        hideLoader();
    }, 150);
}

// Инициализация приложения
function initApp() {
    // Инициализация темы
    initTheme();
    
    // Показываем лоадер при старте
    showLoader();
    
    // Вешаем обработчики событий на кнопки главного меню
    document.getElementById('schedule-btn').addEventListener('click', () => showScreen('tariff'));
    document.getElementById('my-cleanings-btn').addEventListener('click', () => {
        loadMyCleanings();
        showScreen('myCleanings');
    });
    document.getElementById('reschedule-btn').addEventListener('click', () => {
        loadMyCleanings();
        showScreen('myCleanings');
    });
    document.getElementById('extend-btn').addEventListener('click', handleExtendSubscription);
    document.getElementById('support-btn').addEventListener('click', handleSupportRequest);
    
    // Кнопки "Назад" с тактильной обратной связью
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('light');
            }
            navigateBack();
        });
    });
    
    // Обработчики для выбора тарифа
    const tariffCards = document.querySelectorAll('.tariff-card');
    tariffCards.forEach(card => {
        // Обработчик для кнопки "Подробнее"
        card.querySelector('.details-btn').addEventListener('click', (e) => {
            if (tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('light');
            }
            const tariffId = card.getAttribute('data-tariff');
            showTariffDetails(tariffId);
            e.stopPropagation(); // Предотвращаем всплытие события
        });
        
        // Обработчик для всей карточки
        card.addEventListener('click', () => {
            if (tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('medium');
            }
            // Добавим анимацию выбора
            tariffCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            setTimeout(() => {
                const tariffId = card.getAttribute('data-tariff');
                selectTariff(tariffId);
            }, 300);
        });
    });
    
    // Инициализация календаря
    initCalendar();
    
    // Обработчики для выбора времени
    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            if (tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('medium');
            }
            
            // Снимаем выделение со всех слотов
            timeSlots.forEach(s => s.classList.remove('selected'));
            // Выделяем выбранный слот
            slot.classList.add('selected');
            // Сохраняем выбранное время
            userData.selectedTime = slot.textContent;
            
            // Небольшая задержка для анимации
            setTimeout(() => {
                // Переходим к экрану подтверждения
                updateConfirmationScreen();
                showScreen('confirm');
            }, 200);
        });
    });
    
    // Кнопка подтверждения заказа
    document.getElementById('confirm-btn').addEventListener('click', () => {
        if (tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
        }
        confirmCleaning();
    });
    
    // Кнопка редактирования
    document.getElementById('edit-btn').addEventListener('click', () => {
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
        showScreen('date');
    });
    
    // MainButton от Telegram
    tg.MainButton.setParams({
        text: 'Вернуться в бота',
        color: tg.themeParams.button_color || '#40a7e3',
        text_color: tg.themeParams.button_text_color || '#ffffff'
    });
    
    tg.MainButton.onClick(() => {
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('medium');
        }
        tg.close();
    });
    
    // Скрываем лоадер при завершении инициализации
    hideLoader();
}

// Функция для навигации назад
function navigateBack() {
    // Определяем текущий активный экран
    const activeScreen = document.querySelector('.screen.active');
    
    // Логика возврата в зависимости от текущего экрана
    if (activeScreen === screens.tariff) {
        showScreen('main');
    } else if (activeScreen === screens.date) {
        showScreen('tariff');
    } else if (activeScreen === screens.time) {
        showScreen('date');
    } else if (activeScreen === screens.confirm) {
        showScreen('time');
    } else if (activeScreen === screens.myCleanings) {
        showScreen('main');
    }
}

// Функция для отображения подробной информации о тарифе
function showTariffDetails(tariffId) {
    // Определяем содержимое модального окна в зависимости от тарифа
    let title, content;
    
    if (tariffId === '1') { // LIGHT
        title = '<i class="fas fa-tint"></i> Тариф LIGHT';
        content = `
            <p>Безлимитное количество уборок в месяц
            (по одному визиту в день, с возможностью переноса)</p>
            <h4>Что включено:</h4>
            <ul>
                <li><i class="fas fa-check"></i> Уборка пыли со всех доступных поверхностей</li>
                <li><i class="fas fa-check"></i> Мытье полов и плинтусов</li>
                <li><i class="fas fa-check"></i> Уборка ванной комнаты и туалета</li>
                <li><i class="fas fa-check"></i> Мытье кухонных поверхностей</li>
                <li><i class="fas fa-check"></i> Вынос мусора</li>
            </ul>
            <p>Базовая стоимость: <strong>3900 ₽/месяц</strong></p>
        `;
    } else if (tariffId === '2') { // STANDARD
        title = '<i class="fas fa-sparkles"></i> Тариф STANDARD';
        content = `
            <p>Безлимитное количество уборок в месяц
            (по одному визиту в день, с возможностью переноса)</p>
            <h4>Что включено:</h4>
            <ul>
                <li><i class="fas fa-check"></i> Всё из тарифа LIGHT</li>
                <li><i class="fas fa-check"></i> Протирка мебели снаружи</li>
                <li><i class="fas fa-check"></i> Смена постельного белья</li>
                <li><i class="fas fa-check"></i> Уборка техники снаружи</li>
                <li><i class="fas fa-gift"></i> Первая уборка в подарок</li>
            </ul>
            <p>Базовая стоимость: <strong>6900 ₽/месяц</strong></p>
        `;
    } else if (tariffId === '3') { // PREMIUM
        title = '<i class="fas fa-crown"></i> Тариф PREMIUM';
        content = `
            <p>Безлимитное количество уборок в месяц
            (по одному визиту в день, с возможностью переноса)</p>
            <h4>Что включено:</h4>
            <ul>
                <li><i class="fas fa-check"></i> Всё из тарифа STANDARD</li>
                <li><i class="fas fa-check"></i> Уборка внутри шкафов</li>
                <li><i class="fas fa-check"></i> Мытье окон (1 раз в месяц)</li>
                <li><i class="fas fa-check"></i> Чистка мягкой мебели</li>
                <li><i class="fas fa-gift"></i> Первые две уборки в подарок</li>
            </ul>
            <p>Базовая стоимость: <strong>9900 ₽/месяц</strong></p>
        `;
    }
    
    // Отображаем модальное окно (используя Telegram Mini App API)
    tg.showPopup({
        title: title,
        message: content,
        buttons: [
            {type: 'default', text: 'Выбрать этот тариф', id: `select_tariff_${tariffId}`},
            {type: 'cancel', text: 'Закрыть'}
        ]
    }, function(buttonId) {
        if (buttonId && buttonId.startsWith('select_tariff_')) {
            const selectedTariffId = buttonId.split('_')[2];
            selectTariff(selectedTariffId);
        }
    });
}

// Функция выбора тарифа
function selectTariff(tariffId) {
    // Запоминаем выбранный тариф
    const tariffNames = {
        '1': 'LIGHT',
        '2': 'STANDARD',
        '3': 'PREMIUM'
    };
    
    userData.tariff = {
        id: tariffId,
        name: tariffNames[tariffId]
    };
    
    // Переходим к выбору даты
    showScreen('date');
}

// Инициализация календаря
function initCalendar() {
    const calendarElement = document.getElementById('calendar');
    const today = new Date();
    
    // Определяем минимальную доступную дату
    const hour = today.getHours();
    const minDate = hour < 20 
        ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1) // завтра
        : new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2); // послезавтра
    
    // Создаем календарную сетку
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const weekdayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    
    // Заголовок месяца
    const monthTitle = document.createElement('div');
    monthTitle.className = 'month-title';
    monthTitle.innerHTML = `<i class="fas fa-calendar-alt"></i> ${monthNames[today.getMonth()]} ${today.getFullYear()}`;
    calendarElement.appendChild(monthTitle);
    
    // Названия дней недели
    const weekdayLabels = document.createElement('div');
    weekdayLabels.className = 'weekday-labels';
    weekdayNames.forEach(day => {
        const dayLabel = document.createElement('div');
        dayLabel.textContent = day;
        weekdayLabels.appendChild(dayLabel);
    });
    calendarElement.appendChild(weekdayLabels);
    
    // Сетка календаря
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'calendar-grid';
    
    // Получаем первый день месяца
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayWeekday = firstDay.getDay(); // 0 = Воскресенье, 1 = Понедельник, и т.д.
    
    // Получаем количество дней в месяце
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Добавляем пустые ячейки в начале месяца
    for (let i = 0; i < firstDayWeekday; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Добавляем дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(today.getFullYear(), today.getMonth(), day);
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        // Проверяем, доступна ли дата
        const isAvailable = date >= minDate;
        
        // Выделяем текущую дату
        if (date.getDate() === today.getDate() && 
            date.getMonth() === today.getMonth() && 
            date.getFullYear() === today.getFullYear()) {
            dayElement.classList.add('today');
        }
        
        if (!isAvailable) {
            dayElement.classList.add('disabled');
        } else {
            dayElement.addEventListener('click', () => {
                if (tg.HapticFeedback) {
                    tg.HapticFeedback.impactOccurred('medium');
                }
                
                // Снимаем выделение со всех дней
                document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
                // Выделяем выбранный день
                dayElement.classList.add('selected');
                // Сохраняем выбранную дату
                userData.selectedDate = date;
                
                // Добавляем небольшую задержку для лучшего UX
                setTimeout(() => {
                    // Переходим к выбору времени
                    showScreen('time');
                }, 200);
            });
        }
        
        calendarGrid.appendChild(dayElement);
    }
    
    calendarElement.appendChild(calendarGrid);
}

// Обновление экрана подтверждения
function updateConfirmationScreen() {
    // Форматирование даты
    const options = { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' };
    const formattedDate = userData.selectedDate.toLocaleDateString('ru-RU', options);
    
    // Обновляем поля
    document.getElementById('selected-date').textContent = formattedDate;
    document.getElementById('selected-time').textContent = userData.selectedTime;
    document.getElementById('selected-tariff').textContent = userData.tariff.name;
}

// Подтверждение заказа уборки
function confirmCleaning() {
    showLoader();
    
    // Форматируем данные для отправки боту
    const cleaningData = {
        action: 'schedule_cleaning',
        date: userData.selectedDate.toISOString(),
        time: userData.selectedTime,
        tariff: userData.tariff.id
    };
    
    // Отправляем данные боту через Telegram Mini Apps API
    tg.sendData(JSON.stringify(cleaningData));
    
    setTimeout(() => {
        hideLoader();
        
        // Показываем уведомление об успешном заказе
        tg.showPopup({
            title: '<i class="fas fa-check-circle"></i> Уборка заказана!',
            message: `Мы придем к вам ${document.getElementById('selected-date').textContent} в ${userData.selectedTime}. 
                     Спасибо за заказ!`,
            buttons: [{type: 'ok', text: 'Отлично'}]
        }, function() {
            // После закрытия уведомления возвращаемся в главное меню
            showScreen('main');
        });
    }, 1000);
}

// Загрузка списка уборок
function loadMyCleanings() {
    showLoader();
    
    // В реальном приложении здесь будет запрос к API
    // Для демонстрации добавим несколько примеров
    
    const cleaningsContainer = document.getElementById('cleanings-list');
    cleaningsContainer.innerHTML = ''; // Очищаем список
    
    // Пример данных
    const cleanings = [
        { date: new Date(Date.now() + 86400000 * 3), status: 'запланирована' },
        { date: new Date(Date.now() + 86400000 * 8), status: 'запланирована' },
        { date: new Date(Date.now() - 86400000 * 2), status: 'выполнена' },
        { date: new Date(Date.now() - 86400000 * 7), status: 'отменена' }
    ];
    
    // Симулируем задержку загрузки
    setTimeout(() => {
        // Отображаем список уборок
        cleanings.forEach((cleaning, index) => {
            const options = { day: 'numeric', month: 'long', weekday: 'long' };
            const formattedDate = cleaning.date.toLocaleDateString('ru-RU', options);
            const formattedTime = `${cleaning.date.getHours()}:${cleaning.date.getMinutes().toString().padStart(2, '0')}`;
            
            const cleaningItem = document.createElement('div');
            cleaningItem.className = 'cleaning-item';
            cleaningItem.style.animationDelay = `${index * 0.1}s`;
            
            let statusClass = '';
            let statusIcon = '';
            
            if (cleaning.status === 'запланирована') {
                statusClass = 'status-scheduled';
                statusIcon = '<i class="fas fa-calendar-check"></i>';
            }
            else if (cleaning.status === 'выполнена') {
                statusClass = 'status-completed';
                statusIcon = '<i class="fas fa-check-circle"></i>';
            }
            else if (cleaning.status === 'отменена') {
                statusClass = 'status-cancelled';
                statusIcon = '<i class="fas fa-times-circle"></i>';
            }
            
            cleaningItem.innerHTML = `
                <div class="date-time">${formattedDate}, ${formattedTime}</div>
                <div class="status ${statusClass}">${statusIcon} ${cleaning.status}</div>
                ${cleaning.status === 'запланирована' ? 
                    `<div class="actions">
                        <button class="reschedule-btn"><i class="fas fa-calendar-alt"></i> Перенести</button>
                        <button class="cancel-btn"><i class="fas fa-times"></i> Отменить</button>
                    </div>` : ''}
            `;
            
            cleaningsContainer.appendChild(cleaningItem);
        });
        
        // Добавляем обработчики для кнопок
        document.querySelectorAll('.reschedule-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                if (tg.HapticFeedback) {
                    tg.HapticFeedback.impactOccurred('medium');
                }
                handleReschedule(index);
            });
        });
        
        document.querySelectorAll('.cancel-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                if (tg.HapticFeedback) {
                    tg.HapticFeedback.impactOccurred('medium');
                }
                handleCancel(index);
            });
        });
        
        hideLoader();
    }, 800);
}

// Обработка запроса на перенос уборки
function handleReschedule(index) {
    tg.showPopup({
        title: '<i class="fas fa-calendar-alt"></i> Перенос уборки',
        message: 'Чтобы перенести уборку, вернитесь в бота и выберите соответствующий пункт меню.',
        buttons: [{type: 'ok', text: 'Понятно'}]
    });
}

// Обработка запроса на отмену уборки
function handleCancel(index) {
    tg.showPopup({
        title: '<i class="fas fa-exclamation-triangle"></i> Отменить уборку?',
        message: 'Вы уверены, что хотите отменить эту уборку?',
        buttons: [
            {type: 'destructive', text: 'Отменить уборку', id: 'confirm_cancel'},
            {type: 'cancel', text: 'Назад'}
        ]
    }, function(buttonId) {
        if (buttonId === 'confirm_cancel') {
            showLoader();
            
            // Отправка данных в бота для отмены уборки
            tg.sendData(JSON.stringify({
                action: 'cancel_cleaning',
                cleaningIndex: index
            }));
            
            // Симулируем задержку обработки
            setTimeout(() => {
                hideLoader();
                
                // Показываем подтверждение
                tg.showPopup({
                    title: '<i class="fas fa-check-circle"></i> Уборка отменена',
                    message: 'Уборка успешно отменена. Вы можете запланировать новую в удобное для вас время.',
                    buttons: [{type: 'ok', text: 'Понятно'}]
                }, function() {
                    // Обновляем список
                    loadMyCleanings();
                });
            }, 800);
        }
    });
}

// Обработка продления подписки
function handleExtendSubscription() {
    tg.showPopup({
        title: '<i class="fas fa-sync-alt"></i> Продление подписки',
        message: 'Чтобы продлить подписку, вернитесь в бота и выберите пункт меню "Продлить подписку".',
        buttons: [{type: 'ok', text: 'Понятно'}]
    });
}

// Обработка запроса в поддержку
function handleSupportRequest() {
    tg.showPopup({
        title: '<i class="fas fa-headset"></i> Поддержка',
        message: `Если у вас есть вопросы или нужна помощь, вы можете:
        
        1. Написать нам в чат поддержки
        2. Позвонить по телефону +7 (800) 123-45-67
        3. Оставить заявку через бота`,
        buttons: [
            {type: 'default', text: 'Написать в чат', id: 'chat_support'},
            {type: 'default', text: 'Позвонить', id: 'call_support'},
            {type: 'cancel', text: 'Закрыть'}
        ]
    }, function(buttonId) {
        if (buttonId === 'chat_support') {
            tg.sendData(JSON.stringify({
                action: 'open_support_chat'
            }));
        } else if (buttonId === 'call_support') {
            // Открываем номер телефона
            window.open('tel:+78001234567');
        }
    });
}

// Запуск приложения при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Показываем лоадер
    showLoader();
    
    // Инициализируем приложение с небольшой задержкой, чтобы показать анимацию загрузки
    setTimeout(initApp, 500);
});