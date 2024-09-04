export const validateData = (data) => {
    let errors = [];
    let isValid = true;

    if (!data.data.email || !validateEmail(data.data.email)) {
        errors.push('Email inválido.');
        isValid = false;
    }

    if (!data.data.cnpj || !validateCNPJ(data.data.cnpj)) {
        errors.push('CNPJ inválido.');
        isValid = false;
    }

    return { isValid, errors };
};

// Função de validação de email
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Função de validação de CNPJ (simplificada)
const validateCNPJ = (cnpj) => {
    const cnpjRegex = /^\d{14}$/;
    return cnpjRegex.test(cnpj);
};
  