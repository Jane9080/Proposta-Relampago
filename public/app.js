/**
 * PropostaRelâmpago - JavaScript Principal
 * Manipulação de formulários e interação com API
 */

// ============================================
// LEAD FORM (Email Capture)
// ============================================



async function verificarEmail() {
    // Verificar se já tem email salvo
    let email = localStorage.getItem('user_email');
    
    if (email && email.includes('@')) {
        return email;
    }
    
    // Se não tem, pede
    email = prompt('📧 Para gerar seu contrato, digite seu email:');
    
    if (!email || !email.includes('@')) {
        alert('❌ É necessário um email válido para gerar o contrato.');
        return null;
    }
    
    // Salvar email
    localStorage.setItem('user_email', email);
    
    // Enviar para o servidor
    fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    }).catch(err => console.error('Erro:', err));
    
    return email;
}
const leadForm = document.getElementById('leadForm');
const emailInput = document.getElementById('emailInput');
const formMessage = document.getElementById('formMessage');

if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();

        // Validação básica
        if (!email) {
            mostrarMensagem('Por favor, insira um email válido.', 'error');
            return;
        }

        try {
            // Enviar email para API
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                mostrarMensagem('✅ Email cadastrado com sucesso! Você receberá novidades em breve.', 'success');
                leadForm.reset();
                
                // Rolar para o formulário de contrato após 1 segundo
                setTimeout(() => {
                    document.getElementById('formContainer').scrollIntoView({ behavior: 'smooth' });
                }, 1000);
            } else if (response.status === 409) {
                mostrarMensagem('⚠️ Este email já foi cadastrado.', 'error');
            } else {
                mostrarMensagem('❌ Erro ao processar. Tente novamente.', 'error');
            }
        } catch (error) {
            console.error('Erro ao enviar email:', error);
            mostrarMensagem('❌ Erro de conexão. Tente novamente.', 'error');
        }
    });
}

function mostrarMensagem(texto, tipo) {
    formMessage.textContent = texto;
    formMessage.className = `form-message ${tipo}`;
    
    // Limpar mensagem após 5 segundos
    setTimeout(() => {
        formMessage.textContent = '';
        formMessage.className = 'form-message';
    }, 5000);
}

// ============================================
// CONTRATO FORM (Contract Generation)
// ============================================

const contratoForm = document.getElementById('contratoForm');
const formStatus = document.getElementById('formStatus');

if (contratoForm) {
    contratoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
	// Verificar email antes de gerar contrato
        const email = await verificarEmail();
        if (!email) {
            mostrarStatusFormulario('❌ Precisamos do seu email para gerar o contrato.', 'error');
            return;
        }

        // Coletar dados do formulário
        const nomeContratante = document.getElementById('nomeContratante').value.trim();
        const nomeContratado = document.getElementById('nomeContratado').value.trim();
        const servico = document.getElementById('servico').value.trim();
        const valor = document.getElementById('valor').value;
        const prazo = document.getElementById('prazo').value;
        const formaPagamento = document.getElementById('formaPagamento').value;

        // Validação
        if (!nomeContratante || !nomeContratado || !servico || !valor || !prazo || !formaPagamento) {
            mostrarStatusFormulario('❌ Por favor, preencha todos os campos.', 'error');
            return;
        }

        try {
            mostrarStatusFormulario('⏳ Gerando contrato...', 'loading');

            // Enviar dados para API
            const response = await fetch('/api/gerar-contrato', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nomeContratante,
                    nomeContratado,
                    servico,
                    valor,
                    prazo,
                    formaPagamento
                })
            });

            if (response.ok) {
                // Criar blob do PDF e fazer download
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `contrato_${nomeContratante}_${new Date().getTime()}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                mostrarStatusFormulario('✅ Contrato gerado com sucesso! Download iniciado.', 'success');
                
                // Limpar formulário após sucesso
                setTimeout(() => {
                    contratoForm.reset();
                    mostrarStatusFormulario('', '');
                }, 2000);
            } else {
                const errorData = await response.json();
                mostrarStatusFormulario(`❌ Erro: ${errorData.error}`, 'error');
            }
        } catch (error) {
            console.error('Erro ao gerar contrato:', error);
            mostrarStatusFormulario('❌ Erro de conexão. Tente novamente.', 'error');
        }
    });
}

function mostrarStatusFormulario(texto, tipo) {
    formStatus.textContent = texto;
    formStatus.className = `form-status ${tipo}`;
}

// ============================================
// VALIDAÇÃO DE FORMULÁRIO EM TEMPO REAL
// ============================================

// Validar email em tempo real
if (emailInput) {
    emailInput.addEventListener('blur', () => {
        const email = emailInput.value.trim();
        if (email && !isValidEmail(email)) {
            emailInput.style.borderColor = 'var(--danger-color)';
        } else {
            emailInput.style.borderColor = '';
        }
    });
}

// Validar valor em tempo real
const valorInput = document.getElementById('valor');
if (valorInput) {
    valorInput.addEventListener('input', () => {
        const valor = parseFloat(valorInput.value);
        if (valor < 0) {
            valorInput.value = '';
        }
    });
}

// Validar prazo em tempo real
const prazoInput = document.getElementById('prazo');
if (prazoInput) {
    prazoInput.addEventListener('input', () => {
        const prazo = parseInt(prazoInput.value);
        if (prazo < 1) {
            prazoInput.value = '';
        }
    });
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Validar formato de email
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Formatar valor em moeda brasileira
 */
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

/**
 * Log de eventos para análise (opcional)
 */
function logEvento(evento, dados = {}) {
    console.log(`[PropostaRelâmpago] ${evento}`, dados);
    // Aqui você pode enviar para um serviço de analytics
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ PropostaRelâmpago carregado com sucesso!');
    logEvento('Página carregada');
});
