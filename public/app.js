/**
 * PropostaRelâmpago - JavaScript Principal
 */

async function verificarEmail(emailDoFormulario) {
    console.log("🔍 VERIFICANDO EMAIL...");
    
    if (emailDoFormulario && emailDoFormulario.includes('@')) {
        console.log("✅ Email do formulário:", emailDoFormulario);
        localStorage.setItem('user_email', emailDoFormulario);
        fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailDoFormulario })
        }).catch(err => console.error('Erro:', err));
        return emailDoFormulario;
    }
    
    let emailSalvo = localStorage.getItem('user_email');
    if (emailSalvo && emailSalvo.includes('@')) {
        console.log("✅ Email salvo:", emailSalvo);
        return emailSalvo;
    }
    
    let email = prompt('📧 Para gerar seu contrato, digite seu email:');
    if (!email || !email.includes('@')) {
        alert('❌ É necessário um email válido para gerar o contrato.');
        return null;
    }
    
    localStorage.setItem('user_email', email);
    fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    }).catch(err => console.error('Erro:', err));
    
    return email;
}

// LEAD FORM
//const leadForm = document.getElementById('leadForm');
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

// CONTRATO FORM
const contratoForm = document.getElementById('contratoForm');
const formStatus = document.getElementById('formStatus');

if (contratoForm) {
    contratoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // ID CORRETO: emailContrato (igual ao HTML)
        const emailDoFormulario = document.getElementById('emailContrato').value.trim();
        const email = await verificarEmail(emailDoFormulario);
        
        if (!email) {
            mostrarStatusFormulario('❌ Precisamos do seu email para gerar o contrato.', 'error');
            return;
        }

        const nomeContratante = document.getElementById('nomeContratante').value.trim();
        const nomeContratado = document.getElementById('nomeContratado').value.trim();
        const servico = document.getElementById('servico').value.trim();
        const valor = document.getElementById('valor').value;
        const prazo = document.getElementById('prazo').value;
        const formaPagamento = document.getElementById('formaPagamento').value;

        if (!nomeContratante || !nomeContratado || !servico || !valor || !prazo || !formaPagamento) {
            mostrarStatusFormulario('❌ Por favor, preencha todos os campos.', 'error');
            return;
        }

        try {
            mostrarStatusFormulario('⏳ Gerando contrato...', 'loading');

            const response = await fetch('/api/gerar-contrato', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
        if (parseFloat(valorInput.value) < 0) valorInput.value = '';
    });
}

const prazoInput = document.getElementById('prazo');
if (prazoInput) {
    prazoInput.addEventListener('input', () => {
        if (parseInt(prazoInput.value) < 1) prazoInput.value = '';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ PropostaRelâmpago carregado com sucesso!');
});
