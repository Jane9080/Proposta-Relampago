// ============================================
// VERIFICAÇÃO DE EMAIL
// ============================================

async function verificarEmail() {
    console.log("🔍 VERIFICANDO EMAIL...");
    
    // Verificar se já tem email salvo
    let email = localStorage.getItem('user_email');
    
    if (email && email.includes('@')) {
        console.log("✅ Email já salvo:", email);
        return email;
    }
    
    // Se não tem, pede
    email = prompt('📧 Para gerar seu contrato, digite seu email:');
    
    if (!email || !email.includes('@')) {
        alert('❌ É necessário um email válido para gerar o contrato.');
        console.log("❌ Email inválido ou cancelado");
        return null;
    }
    
    // Salvar email
    localStorage.setItem('user_email', email);
    console.log("💾 Email salvo:", email);
    
    // Enviar para o servidor
    fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    }).catch(err => console.error('Erro ao salvar email:', err));
    
    return email;
}

// ============================================
// LEAD FORM
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
                headers: { 'Content-Type': 'application/json' },
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
// CONTRATO FORM
// ============================================

const contratoForm = document.getElementById('contratoForm');
const formStatus = document.getElementById('formStatus');

if (contratoForm) {
    contratoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log("🎯 EVENTO DISPARADO - VERIFICANDO EMAIL...");
        
        // VERIFICAR EMAIL - SE NÃO TIVER, BLOQUEIA
        const email = await verificarEmail();
        
        if (!email) {
            console.log("🚫 BLOQUEADO: sem email");
            mostrarStatusFormulario('❌ Precisamos do seu email para gerar o contrato.', 'error');
            return;
        }
        
        console.log("✅ Email verificado:", email);
        
        // Coletar dados
        const nomeContratante = document.getElementById('nomeContratante').value.trim();
        const nomeContratado = document.getElementById('nomeContratado').value.trim();
        const servico = document.getElementById('servico').value.trim();
        const valor = document.getElementById('valor').value;
        const prazo = document.getElementById('prazo').value;
        const formaPagamento = document.getElementById('formaPagamento').value;

        if (!nomeContratante || !nomeContratado || !servico || !valor || !prazo || !formaPagamento) {
            mostrarStatusFormulario('❌ Preencha todos os campos.', 'error');
            return;
        }

        try {
            mostrarStatusFormulario('⏳ Gerando contrato...', 'loading');

            const response = await fetch('/api/gerar-contrato', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nomeContratante, nomeContratado, servico, valor, prazo, formaPagamento })
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

                mostrarStatusFormulario('✅ Contrato gerado!', 'success');
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
// VALIDAÇÕES
// ============================================

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Limpar localStorage para teste (remover depois)
// localStorage.removeItem('user_email');

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ PropostaRelâmpago carregado');
});
