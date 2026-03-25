/**
 * PropostaRelâmpago - JavaScript Principal
 * Manipulação de formulários e interação com API
 */

// ============================================
// FUNÇÃO PARA VERIFICAR EMAIL
// ============================================

// ============================================
// FUNÇÃO PARA VERIFICAR EMAIL
// ============================================

async function verificarEmail(emailDoFormulario) {
    console.log("🔍 VERIFICANDO EMAIL...");
    
    // 1. Se o usuário preencheu o campo de email, usa ele
    if (emailDoFormulario && emailDoFormulario.includes('@')) {
        console.log("✅ Email do formulário:", emailDoFormulario);
        
        // Salvar no localStorage para próximas vezes
        localStorage.setItem('user_email', emailDoFormulario);
        
        // Enviar para o servidor
        fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailDoFormulario })
        }).catch(err => console.error('Erro:', err));
        
        return emailDoFormulario;
    }
    
    // 2. Se não preencheu, verifica se tem email salvo
    let emailSalvo = localStorage.getItem('user_email');
    
    if (emailSalvo && emailSalvo.includes('@')) {
        console.log("✅ Email salvo:", emailSalvo);
        return emailSalvo;
    }
    
    // 3. Se não tem email salvo nem preencheu, pede no popup
    let email = prompt('📧 Para gerar seu contrato, digite seu email:');
    
    if (!email || !email.includes('@')) {
        alert('❌ É necessário um email válido para gerar o contrato.');
        console.log("❌ Email inválido ou cancelado");
        return null;
    }
    
    // Salvar email
    localStorage.setItem('user_email', email);
    console.log("💾 Email salvo:", email);
    
    fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    }).catch(err => console.error('Erro:', err));
    
    return email;
}


// ============================================
// LEAD FORM (Email Capture)
// ============================================

const leadForm = document.getElementById('leadForm');
const emailInput = document.getElementById('emailInput');
const formMessage = document.getElementById('formMessage');

if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();

        if (!email) {
            mostrarMensagem('Por favor, insira um email válido.', 'error');
            return;
        }

        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                mostrarMensagem('✅ Email cadastrado com sucesso!', 'success');
                leadForm.reset();
                setTimeout(() => {
                    document.getElementById('formContainer').scrollIntoView({ behavior: 'smooth' });
                }, 1000);
            } else if (response.status === 409) {
                mostrarMensagem('⚠️ Este email já foi cadastrado.', 'error');
            } else {
                mostrarMensagem('❌ Erro ao processar.', 'error');
            }
        } catch (error) {
            console.error('Erro:', error);
            mostrarMensagem('❌ Erro de conexão.', 'error');
        }
    });
}

function mostrarMensagem(texto, tipo) {
    formMessage.textContent = texto;
    formMessage.className = `form-message ${tipo}`;
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

        // Pegar o email do formulário
        const emailDoFormulario = document.getElementById('emailInputContrato')?.value.trim();
        
        // Verificar email (passa o que foi preenchido)
        const email = await verificarEmail(emailDoFormulario);
        
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
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `contrato_${nomeContratante}_${Date.now()}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                mostrarStatusFormulario('✅ Contrato gerado com sucesso!', 'success');
                setTimeout(() => {
                    contratoForm.reset();
                    mostrarStatusFormulario('', '');
                }, 2000);
            } else {
                const errorData = await response.json();
                mostrarStatusFormulario(`❌ Erro: ${errorData.error}`, 'error');
            }
        } catch (error) {
            console.error('Erro:', error);
            mostrarStatusFormulario('❌ Erro de conexão.', 'error');
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

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

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

const valorInput = document.getElementById('valor');
if (valorInput) {
    valorInput.addEventListener('input', () => {
        const valor = parseFloat(valorInput.value);
        if (valor < 0) {
            valorInput.value = '';
        }
    });
}

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
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ PropostaRelâmpago carregado com sucesso!');
});
