// Script principal para a Clínica Saúde Maputo
// Funcionalidades: Menu mobile, validação de formulários, animações, calendário

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar ícones Lucide
    lucide.createIcons();
    
    // Inicializar todas as funcionalidades
    initMobileMenu();
    initSmoothScrolling();
    initFormValidation();
    initAppointmentForm();
    initAnimations();
    initDatePicker();
    
    console.log('Clínica Saúde Maputo - Website carregado com sucesso!');
});

// ===== MENU MOBILE =====
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            
            // Alterar ícone do botão
            const icon = mobileMenuBtn.querySelector('[data-lucide]');
            if (mobileMenu.classList.contains('hidden')) {
                icon.setAttribute('data-lucide', 'menu');
            } else {
                icon.setAttribute('data-lucide', 'x');
            }
            lucide.createIcons();
        });
        
        // Fechar menu ao clicar em links
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
                const icon = mobileMenuBtn.querySelector('[data-lucide]');
                icon.setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            });
        });
    }
}

// ===== SCROLL SUAVE =====
function initSmoothScrolling() {
    // Scroll suave para links âncora
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== VALIDAÇÃO DE FORMULÁRIOS =====
function initFormValidation() {
    // Validação em tempo real para todos os inputs
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Limpar erros anteriores
    clearFieldError(field);
    
    // Validação por tipo de campo
    switch (fieldName) {
        case 'nome':
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'Nome deve ter pelo menos 2 caracteres';
            } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
                isValid = false;
                errorMessage = 'Nome deve conter apenas letras';
            }
            break;
            
        case 'telefone':
            if (!/^\+258\s\d{2}\s\d{3}\s\d{3,4}$/.test(value) && !/^\d{9,12}$/.test(value.replace(/\s/g, ''))) {
                isValid = false;
                errorMessage = 'Formato: +258 XX XXX XXXX';
            }
            break;
            
        case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                isValid = false;
                errorMessage = 'Email inválido';
            }
            break;
            
        case 'servico':
            if (!value) {
                isValid = false;
                errorMessage = 'Selecione um serviço';
            }
            break;
            
        case 'data':
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                isValid = false;
                errorMessage = 'Data deve ser futura';
            } else if (selectedDate.getDay() === 0) { // Domingo
                isValid = false;
                errorMessage = 'Não atendemos aos domingos (exceto urgências)';
            }
            break;
            
        case 'hora':
            if (!value) {
                isValid = false;
                errorMessage = 'Selecione um horário';
            }
            break;
    }
    
    // Aplicar resultado da validação
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');
    field.classList.add('border-red-500');
    
    const errorDiv = field.parentNode.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

function clearFieldError(field) {
    field.classList.remove('error');
    field.classList.remove('border-red-500');
    
    const errorDiv = field.parentNode.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.classList.add('hidden');
    }
}

// ===== FORMULÁRIO DE MARCAÇÃO =====
function initAppointmentForm() {
    const form = document.getElementById('appointment-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAppointmentSubmission(this);
        });
        
        // Formatação automática do telefone
        const phoneInput = document.getElementById('telefone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.startsWith('258')) {
                    value = value.substring(3);
                }
                
                if (value.length >= 9) {
                    const formatted = `+258 ${value.substring(0, 2)} ${value.substring(2, 5)} ${value.substring(5, 9)}`;
                    e.target.value = formatted;
                }
            });
        }
    }
}

function handleAppointmentSubmission(form) {
    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    const loadingText = document.getElementById('loading-text');
    
    // Validar todos os campos obrigatórios
    const requiredFields = form.querySelectorAll('[required]');
    let isFormValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });
    
    if (!isFormValid) {
        showNotification('Por favor, corrija os erros no formulário', 'error');
        return;
    }
    
    // Mostrar loading
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    loadingText.classList.remove('hidden');
    
    // Simular envio (substituir por integração real)
    setTimeout(() => {
        // Resetar botão
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        loadingText.classList.add('hidden');
        
        // Mostrar modal de confirmação
        showConfirmationModal();
        
        // Limpar formulário
        form.reset();
        
    }, 2000);
}

function showConfirmationModal() {
    const modal = document.getElementById('confirmation-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Adicionar animação
        const modalContent = modal.querySelector('.bg-white');
        modalContent.style.transform = 'scale(0.9)';
        modalContent.style.opacity = '0';
        
        setTimeout(() => {
            modalContent.style.transform = 'scale(1)';
            modalContent.style.opacity = '1';
            modalContent.style.transition = 'all 0.3s ease';
        }, 100);
    }
}

function closeModal() {
    const modal = document.getElementById('confirmation-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// ===== ANIMAÇÕES =====
function initAnimations() {
    // Animações ao scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observar elementos para animação
    const animatedElements = document.querySelectorAll('.service-card, .testimonial-card, .team-member');
    animatedElements.forEach(el => observer.observe(el));
}

// ===== SELETOR DE DATA =====
function initDatePicker() {
    const dateInput = document.getElementById('data');
    
    if (dateInput) {
        // Definir data mínima como hoje
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        dateInput.min = tomorrow.toISOString().split('T')[0];
        
        // Definir data máxima (3 meses à frente)
        const maxDate = new Date(today);
        maxDate.setMonth(maxDate.getMonth() + 3);
        dateInput.max = maxDate.toISOString().split('T')[0];
        
        // Atualizar horários disponíveis baseado na data
        dateInput.addEventListener('change', function() {
            updateAvailableHours(this.value);
        });
    }
}

function updateAvailableHours(selectedDate) {
    const hourSelect = document.getElementById('hora');
    if (!hourSelect) return;
    
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    
    // Limpar opções existentes (exceto a primeira)
    while (hourSelect.children.length > 1) {
        hourSelect.removeChild(hourSelect.lastChild);
    }
    
    let availableHours = [];
    
    // Definir horários baseado no dia da semana
    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Segunda a Sexta
        availableHours = [
            '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
            '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
            '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
        ];
    } else if (dayOfWeek === 6) { // Sábado
        availableHours = [
            '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
            '11:00', '11:30', '14:00', '14:30', '15:00', '15:30'
        ];
    }
    
    // Adicionar opções de horário
    availableHours.forEach(hour => {
        const option = document.createElement('option');
        option.value = hour;
        option.textContent = hour;
        hourSelect.appendChild(option);
    });
    
    // Se for domingo, mostrar mensagem
    if (dayOfWeek === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Apenas urgências aos domingos';
        option.disabled = true;
        hourSelect.appendChild(option);
    }
}

// ===== NOTIFICAÇÕES =====
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
    
    // Definir cor baseado no tipo
    switch (type) {
        case 'success':
            notification.classList.add('bg-green-500', 'text-white');
            break;
        case 'error':
            notification.classList.add('bg-red-500', 'text-white');
            break;
        case 'warning':
            notification.classList.add('bg-yellow-500', 'text-white');
            break;
        default:
            notification.classList.add('bg-blue-500', 'text-white');
    }
    
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-2">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    lucide.createIcons();
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// ===== UTILITÁRIOS =====

// Função para formatar números de telefone
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('258')) {
        const number = cleaned.substring(3);
        return `+258 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`;
    }
    
    return phone;
}

// Função para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Função para capitalizar nomes
function capitalizeName(name) {
    return name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Função para detectar dispositivo móvel
function isMobile() {
    return window.innerWidth <= 768;
}

// Função para scroll para o topo
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Event listeners globais
window.addEventListener('scroll', function() {
    // Adicionar sombra ao header ao fazer scroll
    const header = document.querySelector('header');
    if (window.scrollY > 10) {
        header.classList.add('shadow-lg');
    } else {
        header.classList.remove('shadow-lg');
    }
});

// Fechar modal ao clicar fora
window.addEventListener('click', function(e) {
    const modal = document.getElementById('confirmation-modal');
    if (modal && e.target === modal) {
        closeModal();
    }
});

// Prevenir envio de formulário com Enter (exceto textarea)
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') {
        const form = e.target.closest('form');
        if (form) {
            e.preventDefault();
        }
    }
});

// Função para debug (remover em produção)
function debugInfo() {
    console.log('=== DEBUG INFO ===');
    console.log('User Agent:', navigator.userAgent);
    console.log('Screen Size:', window.innerWidth + 'x' + window.innerHeight);
    console.log('Is Mobile:', isMobile());
    console.log('Current Page:', window.location.pathname);
    console.log('==================');
}

// Chamar debug info em desenvolvimento
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    debugInfo();
}