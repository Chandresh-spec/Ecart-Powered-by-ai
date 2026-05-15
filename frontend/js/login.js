// ===== Particle Canvas Background =====
(function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 60;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.4 + 0.1;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(132, 194, 37, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    function drawLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 140) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(132, 194, 37, ${0.06 * (1 - dist / 140)})`;
                    ctx.lineWidth = 0.6;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        drawLines();
        requestAnimationFrame(animate);
    }
    animate();
})();

// ===== Floating Grocery Icons =====
(function initFloatingIcons() {
    const icons = ['🥬', '🍎', '🥕', '🍋', '🥑', '🍇', '🌽', '🍊', '🥦', '🍌', '🍓', '🫐'];
    const container = document.getElementById('floatingIcons');
    function spawnIcon() {
        const el = document.createElement('span');
        el.className = 'float-icon';
        el.textContent = icons[Math.floor(Math.random() * icons.length)];
        el.style.left = Math.random() * 100 + '%';
        el.style.fontSize = (Math.random() * 20 + 18) + 'px';
        el.style.animationDuration = (Math.random() * 15 + 12) + 's';
        el.style.animationDelay = (Math.random() * 5) + 's';
        container.appendChild(el);
        setTimeout(() => el.remove(), 30000);
    }
    for (let i = 0; i < 10; i++) setTimeout(spawnIcon, i * 800);
    setInterval(spawnIcon, 3000);
})();

// ===== Counter Animation =====
(function animateCounters() {
    document.querySelectorAll('.stat-number').forEach(el => {
        const target = parseInt(el.dataset.target);
        const duration = 2000;
        const start = performance.now();
        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            el.textContent = Math.floor(target * eased).toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    });
})();

// ===== Tab Switching =====
function switchTab(tab) {
    const indicator = document.getElementById('tabIndicator');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');

    if (tab === 'login') {
        indicator.classList.remove('right');
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        // Re-trigger animation
        loginForm.style.animation = 'none';
        loginForm.offsetHeight; // reflow
        loginForm.style.animation = '';
    } else {
        indicator.classList.add('right');
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        registerForm.style.animation = 'none';
        registerForm.offsetHeight;
        registerForm.style.animation = '';
    }
}

// ===== Password Toggle =====
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

// ===== Password Strength =====
function checkPasswordStrength(password) {
    const fill = document.getElementById('strengthFill');
    const text = document.getElementById('strengthText');
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
        { width: '0%',   color: 'transparent',     label: '' },
        { width: '20%',  color: 'var(--danger)',    label: 'Weak' },
        { width: '40%',  color: 'var(--danger)',    label: 'Weak' },
        { width: '60%',  color: 'var(--warning)',   label: 'Fair' },
        { width: '80%',  color: 'var(--primary)',   label: 'Good' },
        { width: '100%', color: 'var(--success)',   label: 'Strong' },
    ];
    const level = levels[score];
    fill.style.width = level.width;
    fill.style.background = level.color;
    text.textContent = level.label;
    text.style.color = level.color;
}

// ===== Toast Notifications =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toastMsg');
    const icon = toast.querySelector('.toast-icon');
    msg.textContent = message;
    toast.className = 'toast ' + type;
    icon.className = 'toast-icon fas ' + (type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}

// ===== Button Loading State =====
function setLoading(btn, loading) {
    const text = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.btn-loader');
    if (loading) {
        text.style.display = 'none';
        loader.style.display = 'inline-block';
        btn.disabled = true;
        btn.style.opacity = '0.7';
    } else {
        text.style.display = 'inline';
        loader.style.display = 'none';
        btn.disabled = false;
        btn.style.opacity = '1';
    }
}

// ===== Ripple Effect =====
document.querySelectorAll('.auth-submit').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const ripple = this.querySelector('.btn-ripple');
        if (!ripple) return;
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        ripple.style.animation = 'none';
        ripple.offsetHeight;
        ripple.style.animation = 'ripple 0.6s ease-out';
    });
});

// ===== Form Handlers =====
async function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('loginSubmit');
    const username = document.getElementById('l_username').value;
    const password = document.getElementById('l_password').value;

    setLoading(btn, true);
    try {
        const data = await apiCall('/users/login/', 'POST', { username, password }, false);
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        showToast('Login successful! Redirecting...', 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 1200);
    } catch (err) {
        setLoading(btn, false);
        showToast(err.message || 'Login failed. Please try again.', 'error');
        document.getElementById('authCard').classList.add('shake');
        setTimeout(() => document.getElementById('authCard').classList.remove('shake'), 600);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const btn = document.getElementById('registerSubmit');
    const username = document.getElementById('r_username').value;
    const email = document.getElementById('r_email').value;
    const password = document.getElementById('r_password').value;

    setLoading(btn, true);
    try {
        await apiCall('/users/register/', 'POST', { username, email, password }, false);
        showToast('Account created! Please sign in.', 'success');
        setLoading(btn, false);
        setTimeout(() => switchTab('login'), 1000);
    } catch (err) {
        setLoading(btn, false);
        showToast(err.message || 'Registration failed.', 'error');
        document.getElementById('authCard').classList.add('shake');
        setTimeout(() => document.getElementById('authCard').classList.remove('shake'), 600);
    }
}

// ===== Redirect if already logged in =====
if (localStorage.getItem('access_token')) {
    window.location.href = 'index.html';
}
