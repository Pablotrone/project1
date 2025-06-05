document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Argus Law application...');

    // === LETTER ANIMATION ===
    try {
        // === Анимация букв заголовка ===
        const headerElements = document.querySelectorAll('.header-content h1');
        if (headerElements.length === 0) {
            console.warn('No header elements found for animation');
        }
        
        headerElements.forEach(e => {
            if (!e || !e.textContent) return;
            
            e.innerHTML = e.textContent.replace(/(\S*)/g, m => {
                return m.replace(/\S/g, '<span class="letter">$&</span>');
            });
            
            const letters = e.querySelectorAll('.letter');
            letters.forEach((l, i) => {
                if (l) {
                    l.style.cssText = `z-index: -${i}; transition-duration: ${i / 4.4 + 1}s`;
                }
            });
        });
    } catch (error) {
        console.error('Error in header animation:', error);
    }

    // === SWIPER INITIALIZATION ===
    let verticalSwiper = null;
    let horizontalSwiper = null;
    let isMouseOverHorizontal = false;
    let horizontalScrollLock = false;

    // Check if Swiper is available
    if (typeof Swiper === 'undefined') {
        console.error('Swiper library is not loaded. Please include Swiper.js');
        return;
    }

    const sliderElement = document.querySelector('.slider');
    if (!sliderElement) {
        console.error('Slider element not found. Please check your HTML structure');
        return;
    }

    try {
        verticalSwiper = new Swiper('.slider', {
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
            on: {
                init: function() {
                    console.log('Vertical swiper initialized successfully');
                    triggerSectionAnimations(0);
                },
                slideChange: function() {
                    handleSlideChange(this.activeIndex);
                    triggerSectionAnimations(this.activeIndex);
                }
            }
        });
    } catch (error) {
        console.error('Error initializing vertical swiper:', error);
        return;
    }

    // === ENHANCED AUTHENTICATION SYSTEM ===
    const authElements = {
        modal: document.getElementById('authModal'),
        loginBtn: document.getElementById('loginBtn'),
        registerBtn: document.getElementById('registerBtn'),
        logoutBtn: document.getElementById('logoutBtn'),
        closeModal: document.querySelector('.close-modal'),
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        userProfile: document.getElementById('userProfile'),
        userName: document.getElementById('userName')
    };

    // Check if auth elements exist
    const missingElements = Object.entries(authElements).filter(([key, el]) => !el);
    if (missingElements.length > 0) {
        console.warn('Missing authentication elements:', missingElements.map(([key]) => key));
    } else {
        initializeAuthentication();
    }

    function initializeAuthentication() {
        try {
            checkAuthStatus();
            setupAuthEventListeners();
        } catch (error) {
            console.error('Error initializing authentication:', error);
        }
    }

    function setupAuthEventListeners() {
        const { modal, loginBtn, registerBtn, logoutBtn, closeModal, loginForm, registerForm } = authElements;

        // Safe event listener attachment
        const safeAddEventListener = (element, event, handler) => {
            if (element) {
                element.addEventListener(event, handler);
            }
        };

        safeAddEventListener(loginBtn, 'click', () => openAuthModal('login'));
        safeAddEventListener(registerBtn, 'click', () => openAuthModal('register'));
        safeAddEventListener(closeModal, 'click', closeAuthModal);
        safeAddEventListener(logoutBtn, 'click', handleLogout);

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeAuthModal();
            });
        }

        // Tab switching with enhanced animations
        const authTabs = document.querySelectorAll('.auth-tab');
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                if (tabName) switchTab(tabName);
            });
        });

        // Form submissions
        safeAddEventListener(loginForm, 'submit', handleLogin);
        safeAddEventListener(registerForm, 'submit', handleRegister);

        // Enhanced form interactions
        setupFormEnhancements();
    }

    function setupFormEnhancements() {
        // Add floating label effects
        const inputs = document.querySelectorAll('.form-group input');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                if (!this.value) {
                    this.parentElement.classList.remove('focused');
                }
            });

            // Check if input has value on load
            if (input.value) {
                input.parentElement.classList.add('focused');
            }
        });
    }

    // === AUTH MODAL FUNCTIONS ===
    function openAuthModal(activeTab = 'login') {
        const { modal } = authElements;
        if (!modal) return;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        switchTab(activeTab);

        // Add entrance animation
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
        });
    }

    function closeAuthModal() {
        const { modal } = authElements;
        if (!modal) return;

        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
        clearFormMessages();
    }

    function switchTab(tabName) {
        const authTabs = document.querySelectorAll('.auth-tab');
        const authForms = document.querySelectorAll('.auth-form');
        
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

    // === AUTH API FUNCTIONS ===
    async function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail')?.value;
        const password = document.getElementById('loginPassword')?.value;
        const messageEl = document.getElementById('loginMessage');

        if (!email || !password) {
            showMessage(messageEl, 'Пожалуйста, заполните все поля', 'error');
            return;
        }

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Вход...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/auth/token/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.auth_token) {
                localStorage.setItem('authToken', data.auth_token);
                
                // Get user data
                const userResponse = await fetch('http://127.0.0.1:8000/api/auth/users/me/', {
                    headers: { 'Authorization': `Token ${data.auth_token}` }
                });
                
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    updateUIAfterAuth(userData);
                    closeAuthModal();
                    showMessage(messageEl, 'Успешный вход!', 'success');
                } else {
                    throw new Error('Failed to fetch user data');
                }
            } else {
                const errorMsg = data.non_field_errors?.[0] || 'Неверный email или пароль';
                showMessage(messageEl, errorMsg, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage(messageEl, 'Ошибка соединения с сервером', 'error');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        
        const formData = {
            email: document.getElementById('registerEmail')?.value,
            first_name: document.getElementById('firstName')?.value,
            last_name: document.getElementById('lastName')?.value,
            username: document.getElementById('username')?.value,
            password: document.getElementById('registerPassword')?.value
        };
        
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        const messageEl = document.getElementById('registerMessage');

        // Enhanced validation
        if (!Object.values(formData).every(val => val && val.trim())) {
            showMessage(messageEl, 'Все поля обязательны для заполнения', 'error');
            return;
        }

        if (formData.password !== confirmPassword) {
            showMessage(messageEl, 'Пароли не совпадают', 'error');
            return;
        }

        if (formData.password.length < 8) {
            showMessage(messageEl, 'Пароль должен содержать минимум 8 символов', 'error');
            return;
        }

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Регистрация...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/auth/users/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(messageEl, 'Регистрация успешна! Теперь войдите.', 'success');
                switchTab('login');
                
                // Auto-fill email in login form
                const loginEmailEl = document.getElementById('loginEmail');
                if (loginEmailEl) loginEmailEl.value = formData.email;
            } else {
                const errorFields = Object.keys(data);
                const errorMsg = errorFields.length > 0 
                    ? `${errorFields[0]}: ${data[errorFields[0]][0]}`
                    : 'Ошибка регистрации';
                showMessage(messageEl, errorMsg, 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showMessage(messageEl, 'Ошибка соединения с сервером', 'error');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    function handleLogout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        updateUIAfterLogout();
        
        // Add visual feedback
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            const originalText = logoutBtn.textContent;
            logoutBtn.textContent = 'Выход...';
            setTimeout(() => {
                logoutBtn.textContent = originalText;
            }, 1000);
        }
    }

    // === UI UPDATE FUNCTIONS ===
    function updateUIAfterAuth(userData) {
        const { loginBtn, registerBtn, userProfile, userName } = authElements;
        
        if (loginBtn) {
            loginBtn.style.display = 'none';
            loginBtn.style.opacity = '0';
        }
        if (registerBtn) {
            registerBtn.style.display = 'none';
            registerBtn.style.opacity = '0';
        }
        if (userProfile) {
            userProfile.style.display = 'flex';
            setTimeout(() => {
                userProfile.style.opacity = '1';
            }, 100);
        }
        
        const displayName = userData.username || 
                          `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 
                          userData.email?.split('@')[0] || 'Пользователь';
        
        if (userName) userName.textContent = displayName;
        
        localStorage.setItem('userData', JSON.stringify(userData));
    }

    function updateUIAfterLogout() {
        const { loginBtn, registerBtn, userProfile } = authElements;
        
        if (userProfile) {
            userProfile.style.opacity = '0';
            setTimeout(() => {
                userProfile.style.display = 'none';
            }, 300);
        }
        
        setTimeout(() => {
            if (loginBtn) {
                loginBtn.style.display = 'block';
                loginBtn.style.opacity = '1';
            }
            if (registerBtn) {
                registerBtn.style.display = 'block';
                registerBtn.style.opacity = '1';
            }
        }, 300);
    }

    async function checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            updateUIAfterLogout();
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/auth/users/me/', {
                headers: { 'Authorization': `Token ${token}` }
            });

            if (response.ok) {
                const userData = await response.json();
                updateUIAfterAuth(userData);
            } else {
                localStorage.removeItem('authToken');
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
                if (element) {
                    element.style.opacity = '0';
                    setTimeout(() => {
                        element.style.display = 'none';
                        element.style.opacity = '1';
                    }, 300);
                }
            }, 3000);
        }
    }

    // === ENHANCED HORIZONTAL SWIPER ===
    function initHorizontalSwiper() {
        const horizontalEl = document.querySelector('.horizontal-swiper');
        if (!horizontalEl) {
            console.warn('Horizontal swiper element not found');
            return;
        }

        try {
            horizontalSwiper = new Swiper('.horizontal-swiper', {
                direction: 'horizontal',
                slidesPerView: 1,
                centeredSlides: true,
                spaceBetween: 30,
                grabCursor: true,
                slideToClickedSlide: true,
                preventInteractionOnTransition: true,
                loop: true,
                autoplay: {
                    delay: 4000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                },
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
                on: {
                    init: function() {
                        console.log('Horizontal swiper initialized with enhanced effects');
                    },
                    slideChange: function() {
                        // Add ripple effect to active slide
                        const activeSlide = this.slides[this.activeIndex];
                        if (activeSlide) {
                            createSlideRipple(activeSlide);
                        }
                    }
                }
            });

            setupHorizontalSwiperEvents(horizontalEl);
        } catch (error) {
            console.error('Error initializing horizontal swiper:', error);
        }
    }

    function createSlideRipple(slide) {
        const ripple = document.createElement('div');
        ripple.className = 'slide-ripple';
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: slideRipple 1s ease-out forwards;
            pointer-events: none;
            z-index: 1;
        `;

        // Add keyframes if not already added
        if (!document.querySelector('#slideRippleStyles')) {
            const style = document.createElement('style');
            style.id = 'slideRippleStyles';
            style.textContent = `
                @keyframes slideRipple {
                    to {
                        width: 200px;
                        height: 200px;
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        slide.appendChild(ripple);

        setTimeout(() => {
            if (ripple && ripple.parentNode) {
                ripple.remove();
            }
        }, 1000);
    }

    function setupHorizontalSwiperEvents(horizontalEl) {
        if (!horizontalEl || !verticalSwiper) return;

        horizontalEl.addEventListener('mouseenter', () => {
            isMouseOverHorizontal = true;
            verticalSwiper.mousewheel.disable();
            if (horizontalSwiper && horizontalSwiper.autoplay) {
                horizontalSwiper.autoplay.stop();
            }
        });

        horizontalEl.addEventListener('mouseleave', () => {
            isMouseOverHorizontal = false;
            verticalSwiper.mousewheel.enable();
            if (horizontalSwiper && horizontalSwiper.autoplay) {
                horizontalSwiper.autoplay.start();
            }
        });

        horizontalEl.addEventListener('wheel', function(e) {
            if (!horizontalSwiper) return;

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
    }

    // === ENHANCED NAVIGATION ===
    function setupNavigation() {
        const logo = document.querySelector('.logo');
        if (logo && verticalSwiper) {
            logo.addEventListener('click', function(e) {
                e.preventDefault();
                verticalSwiper.slideTo(0);
                addNavigationFeedback(this);
            });
        }

        const menuLinks = document.querySelectorAll('.main-menu a:not(.external-link)');
        const menuItems = document.querySelectorAll('.main-menu li');

        menuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();

                menuItems.forEach(item => item.classList.remove('active'));
                this.parentElement.classList.add('active');

                const linkText = this.textContent.trim();
                let slideIndex = 0;

                switch (linkText) {
                    case 'О нас': slideIndex = 1; break;
                    case 'Практики': slideIndex = 2; break;
                    case 'Контакты': slideIndex = 3; break;
                    default: slideIndex = 0;
                }

                if (verticalSwiper) {
                    verticalSwiper.slideTo(slideIndex);
                }

                addNavigationFeedback(this);
            });

            // Add hover effect
            link.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
            });

            link.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }

    function addNavigationFeedback(element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 150);
    }

    // === ENHANCED SLIDE CHANGE HANDLER ===
    function handleSlideChange(activeIndex) {
        try {
            // Update header slides
            document.querySelectorAll('.header-content__slide').forEach((e, i) => {
                e.classList.toggle('active', activeIndex === i);
            });

            // Header visibility control - only show on home section
            const headerUI = document.querySelector('.slider-ui.home-only');
            const floatingHeader = document.getElementById('floatingHeader');
            
            if (headerUI && floatingHeader) {
                if (activeIndex === 0) {
                    headerUI.classList.remove('hidden');
                    floatingHeader.classList.remove('visible');
                } else {
                    headerUI.classList.add('hidden');
                    floatingHeader.classList.add('visible');
                }
            }

            // Update menu items with animation
            const menuItems = document.querySelectorAll('.main-menu li');
            menuItems.forEach((item, index) => {
                item.classList.remove('active');
                if (activeIndex >= 1 && activeIndex <= 3 && index === activeIndex - 1) {
                    setTimeout(() => {
                        item.classList.add('active');
                    }, 200);
                }
            });

            // Destroy previous horizontal swiper
            if (horizontalSwiper) {
                horizontalSwiper.destroy(true, true);
                horizontalSwiper = null;
                isMouseOverHorizontal = false;
                if (verticalSwiper) verticalSwiper.mousewheel.enable();
            }

            // Initialize horizontal swiper for practices section
            if (activeIndex === 2) {
                setTimeout(() => initHorizontalSwiper(), 200);
            }

            // Add section-specific effects
            applySlideEffects(activeIndex);

        } catch (error) {
            console.error('Error in slide change handler:', error);
        }
    }

    // === FLOATING HEADER FUNCTIONALITY ===
    function setupFloatingHeader() {
        const floatingLogoLink = document.getElementById('floatingLogoLink');
        const floatingBurger = document.getElementById('floatingBurger');
        const floatingMenu = document.getElementById('floatingMenu');

        // Floating logo click handler
        if (floatingLogoLink && verticalSwiper) {
            floatingLogoLink.addEventListener('click', function(e) {
                e.preventDefault();
                verticalSwiper.slideTo(0);
                addNavigationFeedback(this);
            });
        }

        // Floating burger menu toggle
        if (floatingBurger && floatingMenu) {
            floatingBurger.addEventListener('click', function() {
                this.classList.toggle('active');
                floatingMenu.classList.toggle('show');
            });

            // Close floating menu when clicking on menu items
            const floatingMenuLinks = document.querySelectorAll('.floating-menu a');
            floatingMenuLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    floatingBurger.classList.remove('active');
                    floatingMenu.classList.remove('show');

                    // Navigate to section
                    const href = this.getAttribute('href').substring(1);
                    const slideMap = {
                        'home': 0,
                        'about': 1,
                        'practices': 2,
                        'contacts': 3
                    };
                    
                    if (slideMap.hasOwnProperty(href) && verticalSwiper) {
                        verticalSwiper.slideTo(slideMap[href]);
                    }
                });
            });

            // Close floating menu when clicking outside
            document.addEventListener('click', function(e) {
                if (!floatingBurger.contains(e.target) && !floatingMenu.contains(e.target)) {
                    floatingBurger.classList.remove('active');
                    floatingMenu.classList.remove('show');
                }
            });
        }
    }

    function applySlideEffects(activeIndex) {
        const slides = document.querySelectorAll('.slider__item');
        slides.forEach((slide, index) => {
            if (index === activeIndex) {
                slide.classList.add('slide-active');
                // Add parallax effect
                const layer = slide.querySelector('.slider__layer');
                if (layer) {
                    layer.style.transform = 'scale(1.1)';
                }
            } else {
                slide.classList.remove('slide-active');
                const layer = slide.querySelector('.slider__layer');
                if (layer) {
                    layer.style.transform = 'scale(1)';
                }
            }
        });
    }

    // === ENHANCED SECTION ANIMATIONS ===
    function triggerSectionAnimations(sectionIndex) {
        const sections = [
            '.header-content',
            '.about-section',
            '.practices-section', 
            '.contacts-section'
        ];

        const currentSection = document.querySelector(sections[sectionIndex]);
        if (!currentSection) return;

        // Reset all animations first
        const allAnimatedElements = document.querySelectorAll('.animate-fade-up, .animate-slide-left, .animate-scale-up, .animate-contact');
        allAnimatedElements.forEach(el => el.classList.remove('animate'));

        // Trigger animations for current section
        const animatedElements = currentSection.querySelectorAll('.animate-fade-up, .animate-slide-left, .animate-scale-up, .animate-contact');
        
        animatedElements.forEach((el, index) => {
            const delay = parseInt(el.dataset.delay) || (index * 100);
            setTimeout(() => {
                el.classList.add('animate');
                
                // Add extra wow effect for specific elements
                if (el.classList.contains('principle-card')) {
                    setTimeout(() => {
                        el.style.transform += ' scale(1.02)';
                        setTimeout(() => {
                            el.style.transform = el.style.transform.replace(' scale(1.02)', '');
                        }, 200);
                    }, 300);
                }
            }, delay);
        });

        // Section-specific animations
        switch (sectionIndex) {
            case 1: // About section
                setTimeout(() => {
                    triggerAboutEnhancements();
                }, 500);
                break;
            case 3: // Contacts section
                setTimeout(() => {
                    triggerContactEnhancements();
                }, 300);
                break;
        }
    }

    function triggerAboutEnhancements() {
        // Enhanced floating orbs animation
        const orbs = document.querySelectorAll('.floating-orb');
        orbs.forEach((orb, index) => {
            setTimeout(() => {
                orb.style.opacity = '0.6';
                orb.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    orb.style.transform = 'scale(1)';
                }, 500);
            }, index * 200);
        });

        // Enhanced principle card interactions
        const principleCards = document.querySelectorAll('.principle-card');
        principleCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.boxShadow = '0 15px 35px rgba(212, 175, 55, 0.2)';
                setTimeout(() => {
                    card.style.boxShadow = '';
                }, 1000);
            }, index * 300);
        });
    }

    function triggerContactEnhancements() {
        // Enhanced contact item animations
        const contactItems = document.querySelectorAll('.contact-item');
        contactItems.forEach((item, index) => {
            setTimeout(() => {
                const icon = item.querySelector('.contact-icon-wrapper');
                if (icon) {
                    icon.style.transform = 'scale(1.2) rotate(360deg)';
                    icon.style.background = 'var(--green-color)';
                    setTimeout(() => {
                        icon.style.transform = 'scale(1) rotate(0deg)';
                        icon.style.background = '';
                    }, 800);
                }
            }, index * 400);
        });
    }

    // === ADVANCED INTERACTION HANDLERS ===
    function setupAdvancedInteractions() {
        // Enhanced principle card interactions
        const principleCards = document.querySelectorAll('.principle-card');
        principleCards.forEach(card => {
            let isAnimating = false;

            card.addEventListener('mouseenter', function() {
                if (isAnimating) return;
                isAnimating = true;

                this.style.transform = 'translateY(-10px) rotateX(5deg) rotateY(5deg) scale(1.02)';
                
                // Add particle effect
                createParticleEffect(this);

                setTimeout(() => {
                    isAnimating = false;
                }, 500);
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) rotateX(0) rotateY(0) scale(1)';
            });

            card.addEventListener('click', function(e) {
                createRippleEffect(e, this);
            });
        });

        // Enhanced contact item interactions
        const contactItems = document.querySelectorAll('.contact-item');
        contactItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                const ripple = this.querySelector('.icon-ripple');
                if (ripple) {
                    ripple.style.width = '80px';
                    ripple.style.height = '80px';
                }
            });

            item.addEventListener('mouseleave', function() {
                const ripple = this.querySelector('.icon-ripple');
                if (ripple) {
                    ripple.style.width = '0';
                    ripple.style.height = '0';
                }
            });
        });
    }

    function createParticleEffect(element) {
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: var(--green-color);
                border-radius: 50%;
                pointer-events: none;
                animation: particleFloat${i} 2s ease-out forwards;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 1000;
            `;

            // Create unique animation for each particle
            const style = document.createElement('style');
            style.textContent = `
                @keyframes particleFloat${i} {
                    to {
                        transform: translate(${(Math.random() - 0.5) * 200}px, ${(Math.random() - 0.5) * 200}px) scale(0);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);

            element.appendChild(particle);

            setTimeout(() => {
                if (particle && particle.parentNode) {
                    particle.remove();
                }
            }, 2000);
        }
    }

    function createRippleEffect(event, element) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(212, 175, 55, 0.4);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            z-index: 1000;
        `;

        // Add ripple keyframes if not already added
        if (!document.querySelector('#rippleStyles')) {
            const style = document.createElement('style');
            style.id = 'rippleStyles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        element.style.position = 'relative';
        element.appendChild(ripple);

        setTimeout(() => {
            if (ripple && ripple.parentNode) {
                ripple.remove();
            }
        }, 600);
    }

    // === ENHANCED KEYBOARD NAVIGATION ===
    function setupKeyboardNavigation() {
        document.addEventListener('keydown', function(e) {
            // Prevent default behavior if we're handling the key
            let handled = false;

            // Main navigation keys
            if (!isMouseOverHorizontal) {
                switch (e.key) {
                    case 'ArrowUp':
                    case 'PageUp':
                        verticalSwiper?.slidePrev();
                        handled = true;
                        break;
                    case 'ArrowDown':
                    case 'PageDown':
                        verticalSwiper?.slideNext();
                        handled = true;
                        break;
                    case 'Home':
                        verticalSwiper?.slideTo(0);
                        handled = true;
                        break;
                    case 'End':
                        verticalSwiper?.slideTo(3);
                        handled = true;
                        break;
                }
            }

            // Horizontal swiper navigation
            if (isMouseOverHorizontal && horizontalSwiper) {
                switch (e.key) {
                    case 'ArrowLeft':
                        horizontalSwiper.slidePrev();
                        handled = true;
                        break;
                    case 'ArrowRight':
                        horizontalSwiper.slideNext();
                        handled = true;
                        break;
                }
            }

            // Modal controls
            if (e.key === 'Escape') {
                closeAuthModal();
                handled = true;
            }

            if (handled) {
                e.preventDefault();
            }
        });
    }

    // === PERFORMANCE OPTIMIZATIONS ===
    function setupPerformanceOptimizations() {
        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, observerOptions);

        // Observe all animation elements
        document.querySelectorAll('.animate-fade-up, .animate-slide-left, .animate-scale-up, .animate-contact').forEach(el => {
            observer.observe(el);
        });

        // Preload images
        const preloadImages = () => {
            const imageUrls = [
                'img/bcg.png',
                'img/bcg2.png', 
                'img/bcg4.png',
                'img/logo.svg'
            ];

            imageUrls.forEach(url => {
                const img = new Image();
                img.src = url;
            });
        };

        // Preload after initial load
        setTimeout(preloadImages, 1000);
    }

    // === MOBILE MENU TOGGLE ===
    function setupMobileMenu() {
        const submenuBtn = document.querySelector('.submenu');
        const mainMenu = document.querySelector('.main-menu');
        
        if (submenuBtn && mainMenu) {
            submenuBtn.addEventListener('click', function() {
                this.classList.toggle('active');
                mainMenu.classList.toggle('show');
            });

            // Close menu when clicking on menu items
            const menuLinks = document.querySelectorAll('.main-menu a');
            menuLinks.forEach(link => {
                link.addEventListener('click', () => {
                    submenuBtn.classList.remove('active');
                    mainMenu.classList.remove('show');
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', function(e) {
                if (!submenuBtn.contains(e.target) && !mainMenu.contains(e.target)) {
                    submenuBtn.classList.remove('active');
                    mainMenu.classList.remove('show');
                }
            });
        }
    }

    // === SCROLL TO SECTION FUNCTIONALITY ===
    function setupScrollToSection() {
        // Handle anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = this.getAttribute('href').substring(1);
                
                // Map sections to slide indices
                const slideMap = {
                    'home': 0,
                    'about': 1,
                    'practices': 2,
                    'contacts': 3
                };
                
                if (slideMap.hasOwnProperty(target) && verticalSwiper) {
                    verticalSwiper.slideTo(slideMap[target]);
                }
            });
        });
    }

    // === FORM VALIDATION ENHANCEMENTS ===
    function setupFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input[required]');
            
            inputs.forEach(input => {
                input.addEventListener('invalid', function(e) {
                    e.preventDefault();
                    this.classList.add('error');
                    
                    // Remove error class after user starts typing
                    this.addEventListener('input', function() {
                        this.classList.remove('error');
                    }, { once: true });
                });

                input.addEventListener('blur', function() {
                    if (this.hasAttribute('required') && !this.value.trim()) {
                        this.classList.add('error');
                    } else {
                        this.classList.remove('error');
                    }
                });
            });
        });
    }

    // === INITIALIZATION ===
    function initializeApplication() {
        try {
            setupNavigation();
            setupKeyboardNavigation();
            setupAdvancedInteractions();
            setupPerformanceOptimizations();
            setupMobileMenu();
            setupScrollToSection();
            setupFormValidation();
            setupFloatingHeader();

            // Initialize on first slide if needed
            if (verticalSwiper && verticalSwiper.activeIndex === 2) {
                setTimeout(() => initHorizontalSwiper(), 100);
            }

            console.log('Argus Law application initialized successfully');
        } catch (error) {
            console.error('Error during application initialization:', error);
        }
    }

    // === ERROR HANDLING ===
    window.addEventListener('error', function(e) {
        console.error('Global error caught:', e.error);
        // Could send error reports to analytics here
    });

    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
    });

    // === FINAL INITIALIZATION ===
    initializeApplication();

    // Add loading state management
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        triggerSectionAnimations(0);
        
        // Add smooth fade-in effect
        document.body.style.opacity = '0';
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.5s ease-in';
            document.body.style.opacity = '1';
        }, 100);
    });

    // === UTILITY FUNCTIONS ===
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // === RESIZE HANDLER ===
    const handleResize = debounce(() => {
        if (verticalSwiper) {
            verticalSwiper.update();
        }
        if (horizontalSwiper) {
            horizontalSwiper.update();
        }
    }, 250);

    window.addEventListener('resize', handleResize);

    // === CLEANUP ON PAGE UNLOAD ===
    window.addEventListener('beforeunload', () => {
        if (verticalSwiper) {
            verticalSwiper.destroy(true, true);
        }
        if (horizontalSwiper) {
            horizontalSwiper.destroy(true, true);
        }
    });
});