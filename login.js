// ============================================
// LOGIN PAGE JAVASCRIPT
// ============================================

// Animated counter for live users
function animateCounter() {
    const counter = document.getElementById('liveUsers');
    if (!counter) return;
    
    let current = 2847;
    setInterval(() => {
        const change = Math.floor(Math.random() * 10) - 5;
        current = Math.max(2800, Math.min(2900, current + change));
        counter.textContent = current.toLocaleString();
    }, 3000);
}

animateCounter();

// Password toggle
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
}

// Login form handling
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

// Credenciais corretas
const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'dashboard2024';

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validação
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        // Login bem-sucedido
        const loginBtn = loginForm.querySelector('.login-btn-new');
        loginBtn.innerHTML = '<i class="fas fa-check-circle"></i> <span>Login realizado com sucesso!</span>';
        loginBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)';
        
        // Armazena sessão
        sessionStorage.setItem('isLoggedIn', 'true');
        
        // Lembra o usuário se marcado
        if (rememberMe) {
            localStorage.setItem('rememberedUser', username);
        }
        
        // Redireciona após animação
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1200);
    } else {
        // Login falhou
        errorMessage.textContent = '❌ Usuário ou senha incorretos. Verifique as credenciais.';
        errorMessage.style.display = 'block';
        errorMessage.style.color = '#ef4444';
        errorMessage.style.padding = '12px';
        errorMessage.style.background = 'rgba(239, 68, 68, 0.1)';
        errorMessage.style.borderRadius = '8px';
        errorMessage.style.marginBottom = '15px';
        errorMessage.style.animation = 'shake 0.5s ease';
        
        // Remove mensagem após 3 segundos
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
        
        // Shake effect nos inputs
        const inputs = loginForm.querySelectorAll('input[type="text"], input[type="password"]');
        inputs.forEach(input => {
            input.style.animation = 'shake 0.5s ease';
            input.style.borderColor = '#ef4444';
            setTimeout(() => {
                input.style.animation = '';
                input.style.borderColor = '';
            }, 500);
        });
    }
});

// Social login buttons (apenas visual - não funcionam)
const socialButtons = document.querySelectorAll('.social-btn');
socialButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const provider = this.classList.contains('google') ? 'Google' : 'Microsoft';
        alert(`🚧 Login com ${provider} ainda não está disponível nesta demonstração.\n\nUse as credenciais de demo:\nUsuário: admin\nSenha: dashboard2024`);
    });
});

// Forgot password (apenas visual)
const forgotPassword = document.querySelector('.forgot-password');
if (forgotPassword) {
    forgotPassword.addEventListener('click', function(e) {
        e.preventDefault();
        alert('🚧 Recurso de recuperação de senha ainda não está disponível nesta demonstração.\n\nUse as credenciais:\nUsuário: admin\nSenha: dashboard2024');
    });
}

// Auto-fill remembered user
window.addEventListener('load', () => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        document.getElementById('username').value = rememberedUser;
        document.getElementById('rememberMe').checked = true;
    }
});

// Input animations
const inputs = document.querySelectorAll('.input-wrapper input');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'translateY(-2px)';
        this.parentElement.style.transition = 'all 0.3s ease';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'translateY(0)';
    });
});

console.log('🔐 Sistema de login carregado');
console.log('👤 Credenciais de teste: admin / dashboard2024');
