document.addEventListener('DOMContentLoaded', function () {

    const fadeElements = document.querySelectorAll('.fade-in');
    const contactForm = document.getElementById('contactForm');

    function handleScroll() {

        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;

            if (elementTop < window.innerHeight * 0.85 && elementBottom > 0) {
                element.classList.add('visible');
            }
        });
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);

                if (target) {
                    const targetPosition = target.offsetTop;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !subject || !message) {
                showNotification('Please fill in all fields', 'error');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }

            showNotification('Opening your email client...', 'success');


            const mailtoLink = `mailto:sharmareteesh@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;


            setTimeout(() => {
                window.location.href = mailtoLink;
                contactForm.reset();
            }, 1500);
        });
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            z-index: 9999;
            font-weight: 600;
            max-width: 350px;
            animation: slideIn 0.4s ease;
            backdrop-filter: blur(10px);
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.4s ease';
            setTimeout(() => {
                notification.remove();
            }, 400);
        }, 4000);
    }

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-12px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    const skillBadges = document.querySelectorAll('.skill-badge');
    skillBadges.forEach((badge, index) => {
        badge.style.animationDelay = `${index * 0.1}s`;
    });

    let ticking = false;
    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                const scrolled = window.pageYOffset;
                const parallaxElements = document.querySelectorAll('.hero-section::before');

                parallaxElements.forEach(element => {
                    const speed = 0.5;
                    element.style.transform = `translateY(${scrolled * speed}px)`;
                });

                ticking = false;
            });

            ticking = true;
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    fadeElements.forEach(element => {
        observer.observe(element);
    });

    const githubIcon = document.getElementById('github-icon');
    const instaIcon = document.getElementById('insta-icon');
    const gameModal = document.getElementById('game-modal');
    const closeGameBtn = document.getElementById('close-game');
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');

    let gameInterval;
    let score = 0;
    const gridSize = 20;
    const tileCount = 20;
    let snake = [];
    let food = { x: 15, y: 15 };
    let dx = 0;
    let dy = 0;

    if (githubIcon && instaIcon) {
        githubIcon.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', 'secret-game');
            instaIcon.style.transform = 'scale(1.2)';
            instaIcon.style.color = '#e1306c';
        });

        githubIcon.addEventListener('dragend', () => {
            instaIcon.style.transform = '';
            instaIcon.style.color = '';
        });

        instaIcon.addEventListener('dragover', (e) => {
            e.preventDefault();
            instaIcon.style.transform = 'scale(1.4) rotate(10deg)';
        });

        instaIcon.addEventListener('dragleave', () => {
            instaIcon.style.transform = 'scale(1.2)';
        });

        instaIcon.addEventListener('drop', (e) => {
            e.preventDefault();
            const data = e.dataTransfer.getData('text/plain');
            if (data === 'secret-game') {
                instaIcon.style.transform = '';
                instaIcon.style.color = '';
                openGame();
            }
        });
    }

    function openGame() {
        gameModal.classList.add('active');
        resetGame();
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, 100);
        window.addEventListener('keydown', handleKeydown);
    }

    function closeGame() {
        gameModal.classList.remove('active');
        clearInterval(gameInterval);
        window.removeEventListener('keydown', handleKeydown);
    }

    if (closeGameBtn) {
        closeGameBtn.addEventListener('click', closeGame);
    }

    function resetGame() {
        snake = [{ x: 10, y: 10 }];
        food = { x: 15, y: 15 };
        dx = 0;
        dy = 0;
        score = 0;
        scoreElement.textContent = score;
    }

    function handleKeydown(e) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
        switch (e.key) {
            case 'ArrowUp': if (dy === 0) { dx = 0; dy = -1; } break;
            case 'ArrowDown': if (dy === 0) { dx = 0; dy = 1; } break;
            case 'ArrowLeft': if (dx === 0) { dx = -1; dy = 0; } break;
            case 'ArrowRight': if (dx === 0) { dx = 1; dy = 0; } break;
            case 'r': case 'R': resetGame(); break;
        }
    }

    function gameLoop() {
        update();
        draw();
    }

    function update() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver();
            return;
        }

        if (dx !== 0 || dy !== 0) {
            for (let i = 0; i < snake.length; i++) {
                if (head.x === snake[i].x && head.y === snake[i].y) {
                    gameOver();
                    return;
                }
            }
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreElement.textContent = score;
            placeFood();
        } else {
            if (dx !== 0 || dy !== 0) {
                snake.pop();
            } else {
                snake.pop();
                snake.unshift(head);
            }
        }
    }

    function draw() {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#14b8a6';
        snake.forEach((segment, index) => {
            if (index === 0) ctx.fillStyle = '#5eead4';
            else ctx.fillStyle = '#14b8a6';

            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        });

        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(
            food.x * gridSize + gridSize / 2,
            food.y * gridSize + gridSize / 2,
            gridSize / 2 - 2,
            0,
            2 * Math.PI
        );
        ctx.fill();
    }

    function placeFood() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        snake.forEach(segment => {
            if (segment.x === food.x && segment.y === food.y) {
                placeFood();
            }
        });
    }

    function gameOver() {
        clearInterval(gameInterval);
        alert(`Game Over! Your score: ${score}`);
        resetGame();
    }

});
