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

// CONTRATO FORM
const contratoForm = document.getElementById('contratoForm');
const formStatus = document.getElementById('formStatus');

if (contratoForm) {
    contratoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Email
        const emailDoFormulario = document.getElementById('emailContrato').value.trim();
        const email = await verificarEmail(emailDoFormulario);
        
        if (!email) {
            mostrarStatusFormulario('❌ Precisamos do seu email para gerar o contrato.', 'error');
            return;
        }

        // Coletar todos os dados do formulário
        const nomeContratante = document.getElementById('nomeContratante').value.trim();
        const cpfCnpjContratante = document.getElementById('cpfCnpjContratante').value.trim();
        const enderecoContratante = document.getElementById('enderecoContratante').value.trim();
        
        const nomeContratado = document.getElementById('nomeContratado').value.trim();
        const cpfCnpjContratado = document.getElementById('cpfCnpjContratado').value.trim();
        const enderecoContratado = document.getElementById('enderecoContratado').value.trim();
        
        const servico = document.getElementById('servico').value.trim();
        const valor = document.getElementById('valor').value;
        const prazo = document.getElementById('prazo').value;
        const formaPagamento = document.getElementById('formaPagamento').value;

        // Validação
        if (!nomeContratante || !cpfCnpjContratante || !enderecoContratante ||
            !nomeContratado || !cpfCnpjContratado || !enderecoContratado ||
            !servico || !valor || !prazo || !formaPagamento) {
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
                    cpfCnpjContratante,
                    enderecoContratante,
                    nomeContratado,
                    cpfCnpjContratado,
                    enderecoContratado,
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

// Validação do email em tempo real (se existir o campo)
const emailInput = document.getElementById('emailInput');
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
