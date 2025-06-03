document.addEventListener('DOMContentLoaded', function() {

    // === Анимация букв заголовка ===
    document.querySelectorAll('.header-content h1').forEach(e => {
        e.innerHTML = e.textContent.replace(/(\S*)/g, m => {
            return m.replace(/\S/g, '<span class="letter">$&</span>');
        });
        e.querySelectorAll('.letter').forEach((l, i) => {
            l.style.cssText = `z-index: -${i}; transition-duration: ${i / 4.4 + 1}s`;
        });
    });

    // === Основной вертикальный свайпер ===
    const verticalSwiper = new Swiper('.slider', {
        direction: 'vertical',
        speed: 1700,
        parallax: true,
        resistanceRatio: 0.5,
        touchReleaseOnEdges: true,
        keyboard: {
            enabled: true,
            onlyInViewport: false,
        },
        mousewheel: {
            eventsTarget: '.slider',
            releaseOnEdges: true,
            thresholdDelta: 15,
            thresholdTime: 300,
        },
        noSwipingSelector: '.horizontal-swiper, .slide-content, .swiper-pagination, .swiper-button-next, .swiper-button-prev',
    });

    let horizontalSwiper = null;
    let isMouseOverHorizontal = false;
    let horizontalScrollLock = false;

    // === АВТОРИЗАЦИЯ ===
    const authModal = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const closeModal = document.querySelector('.close-modal');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');

    // Проверяем, существуют ли элементы перед работой с ними
    if (!authModal || !loginBtn || !registerBtn || !logoutBtn || !closeModal || 
        !loginForm || !registerForm || !userProfile || !userName) {
        console.error('One or more authentication elements are missing in the DOM');
        return;
    }

    // Проверяем авторизацию при загрузке
    checkAuthStatus();

    // Функции для работы с модальным окном
    function openAuthModal(activeTab = 'login') {
        authModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        switchTab(activeTab);
    }

    function closeAuthModal() {
        authModal.style.display = 'none';
        document.body.style.overflow = '';
        clearFormMessages();
    }

    function switchTab(tabName) {
        authTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        authForms.forEach(form => {
            form.classList.toggle('active', form.id === `${tabName}Form`);
        });
    }

    function clearFormMessages() {
        document.querySelectorAll('.auth-message').forEach(msg => {
            if (msg) {
                msg.style.display = 'none';
                msg.textContent = '';
            }
        });
    }

    // Обработчики событий
    loginBtn.addEventListener('click', () => openAuthModal('login'));
    registerBtn.addEventListener('click', () => openAuthModal('register'));
    closeModal.addEventListener('click', closeAuthModal);
    
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
    });

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Обработчик формы входа
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        const message = document.getElementById('loginMessage');

        if (!emailInput || !passwordInput || !message) {
            console.error('Login form elements are missing');
            return;
        }

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/auth/token/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('authToken', data.auth_token);
                
                // Получаем данные пользователя
                const userResponse = await fetch('http://127.0.0.1:8000/api/auth/users/me/', {
                    headers: { 'Authorization': `Token ${data.auth_token}` }
                });
                
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    updateUIAfterAuth(userData);
                }
                
                closeAuthModal();
                showMessage(message, 'Успешный вход!', 'success');
            } else {
                const errorMsg = data.non_field_errors?.[0] || 'Неверный email или пароль';
                showMessage(message, errorMsg, 'error');
            }
        } catch (error) {
            showMessage(message, 'Ошибка соединения с сервером', 'error');
        }
    });

    // Обработчик формы регистрации
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Получаем элементы формы с проверкой
        const getElement = (id) => {
            const el = document.getElementById(id);
            if (!el) console.error(`Element with ID ${id} not found`);
            return el;
        };

        const emailInput = getElement('registerEmail');
        const firstNameInput = getElement('firstName');
        const lastNameInput = getElement('lastName');
        const usernameInput = getElement('username');
        const passwordInput = getElement('registerPassword');
        const confirmPasswordInput = getElement('confirmPassword');
        const message = getElement('registerMessage');

        if (!emailInput || !firstNameInput || !lastNameInput || !usernameInput || 
            !passwordInput || !confirmPasswordInput || !message) {
            return;
        }

        const formData = {
            email: emailInput.value,
            first_name: firstNameInput.value,
            last_name: lastNameInput.value,
            username: usernameInput.value,
            password: passwordInput.value
        };
        const confirmPassword = confirmPasswordInput.value;

        // Валидация
        if (formData.password !== confirmPassword) {
            return showMessage(message, 'Пароли не совпадают', 'error');
        }
        
        if (!formData.first_name || !formData.last_name || !formData.username) {
            return showMessage(message, 'Все поля обязательны для заполнения', 'error');
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/auth/users/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(message, 'Регистрация успешна! Теперь войдите.', 'success');
                switchTab('login');
                // Автозаполнение email
                if (emailInput) emailInput.value = formData.email;
                if (passwordInput) passwordInput.value = '';
            } else {
                const errorFields = Object.keys(data);
                const errorMsg = errorFields.length > 0 
                    ? `${errorFields[0]}: ${data[errorFields[0]][0]}`
                    : 'Ошибка регистрации';
                showMessage(message, errorMsg, 'error');
            }
        } catch (error) {
            showMessage(message, 'Ошибка соединения с сервером', 'error');
        }
    });

    // Обработчик выхода
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        updateUIAfterLogout();
    });

    // Функции управления UI
    function updateUIAfterAuth(userData) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';
        
        const displayName = userData.username || 
                          `${userData.first_name} ${userData.last_name}` || 
                          userData.email?.split('@')[0] || 'Пользователь';
        if (userName) userName.textContent = displayName;
        
        localStorage.setItem('userData', JSON.stringify(userData));
    }

    function updateUIAfterLogout() {
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        if (userProfile) userProfile.style.display = 'none';
    }

    async function checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        if (!token) return updateUIAfterLogout();

        try {
            const response = await fetch('http://127.0.0.1:8000/api/auth/users/me/', {
                headers: { 'Authorization': `Token ${token}` }
            });

            if (response.ok) {
                const userData = await response.json();
                updateUIAfterAuth(userData);
            } else {
                updateUIAfterLogout();
            }
        } catch (error) {
            console.error('Auth check error:', error);
            updateUIAfterLogout();
        }
    }

    function showMessage(element, text, type) {
        if (!element) {
            console.error('Message element not found');
            return;
        }
        
        element.textContent = text;
        element.className = `auth-message ${type}`;
        element.style.display = 'block';

        if (type === 'success') {
            setTimeout(() => {
                if (element) element.style.display = 'none';
            }, 5000);
        }
    }

    // === Горизонтальный свайпер (для секции "Практики") ===
    function initHorizontalSwiper() {
        horizontalSwiper = new Swiper('.horizontal-swiper', {
            direction: 'horizontal',
            slidesPerView: 1,
            centeredSlides: true,
            spaceBetween: 30,
            grabCursor: true,
            slideToClickedSlide: true,
            preventInteractionOnTransition: true,
            keyboard: {
                enabled: true,
                onlyInViewport: true,
            },
            mousewheel: {
                forceToAxis: true,
                invert: false,
                eventsTarget: '.horizontal-swiper',
                thresholdDelta: 5,
                thresholdTime: 100,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
                dynamicBullets: true,
                dynamicMainBullets: 3,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });

        const horizontalEl = document.querySelector('.horizontal-swiper');

        if (!horizontalEl) return;

        // Отключаем вертикальный свайп при наведении
        horizontalEl.addEventListener('mouseenter', () => {
            isMouseOverHorizontal = true;
            verticalSwiper.mousewheel.disable();
        });

        horizontalEl.addEventListener('mouseleave', () => {
            isMouseOverHorizontal = false;
            verticalSwiper.mousewheel.enable();
        });

        // Колёсико мыши внутри горизонтального свайпера
        horizontalEl.addEventListener('wheel', function(e) {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.preventDefault();
                e.deltaX > 0 ? horizontalSwiper.slideNext() : horizontalSwiper.slidePrev();
            } else if (isMouseOverHorizontal) {
                e.preventDefault();

                if (horizontalScrollLock) return;
                horizontalScrollLock = true;

                setTimeout(() => {
                    horizontalScrollLock = false;
                }, 300);

                e.deltaY > 0 ? horizontalSwiper.slideNext() : horizontalSwiper.slidePrev();
            }
        }, { passive: false });

        // Управление стрелками клавиатуры
        document.addEventListener('keydown', function(e) {
            if (!horizontalSwiper) return;

            if (e.key === 'ArrowLeft') {
                horizontalSwiper.slidePrev();
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                horizontalSwiper.slideNext();
                e.preventDefault();
            }
        });
    }

    document.querySelector('.logo').addEventListener('click', function(e) {
        e.preventDefault();
        verticalSwiper.slideTo(0);
    });

    // === Навигация по меню ===
    const menuLinks = document.querySelectorAll('.main-menu a:not(.external-link)');
    const menuItems = document.querySelectorAll('.main-menu li');

    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            menuItems.forEach(item => item.classList.remove('active'));
            this.parentElement.classList.add('active');

            const linkText = this.textContent.trim();
            let slideIndex = 0;

            if (linkText === 'О нас') slideIndex = 1;
            else if (linkText === 'Практики') slideIndex = 2;
            else if (linkText === 'Контакты') slideIndex = 3;

            verticalSwiper.slideTo(slideIndex);
        });
    });

    // === Универсальный обработчик смены слайдов ===
    verticalSwiper.on('slideChange', function() {
        const activeIndex = verticalSwiper.activeIndex;

        // Активация заголовков слайдов
        document.querySelectorAll('.header-content__slide').forEach((e, i) => {
            e.classList.toggle('active', activeIndex === i);
        });

        // Обновление активного пункта меню
        menuItems.forEach(item => item.classList.remove('active'));
        if (activeIndex === 1 && menuItems[0]) menuItems[0].classList.add('active');
        else if (activeIndex === 2 && menuItems[1]) menuItems[1].classList.add('active');
        else if (activeIndex === 3 && menuItems[2]) menuItems[2].classList.add('active');

        // Удаляем старый горизонтальный свайпер
        if (horizontalSwiper) {
            horizontalSwiper.destroy(true, true);
            horizontalSwiper = null;
            isMouseOverHorizontal = false;
            verticalSwiper.mousewheel.enable();
        }

        // Инициализация горизонтального свайпера при заходе в 3-й слайд
        if (activeIndex === 2) {
            initHorizontalSwiper();
        }
    });

    // === Инициализация горизонтального свайпера при загрузке, если на 3-м слайде ===
    if (verticalSwiper.activeIndex === 2) {
        initHorizontalSwiper();
    }
});
