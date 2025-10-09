const EMPLOYEE_NUMBER_PATTERN = new RegExp("^[A-Z0-9]{5}$");

const EMAIL_PATTERN = new RegExp("^[a-zA-Z0-9._%+-]+@(cfe.mx|gmail.com)$");

const VALIDATION_CODE_PATTERN = new RegExp("^[A-Z0-9]{6}$");

const VALIDATION_PASSWORD_PATTERN = new RegExp(
    "^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!$%&_¿?])[A-Za-z0-9!$%&_¿?*]{8,16}$"
);

export {
    EMPLOYEE_NUMBER_PATTERN,
    EMAIL_PATTERN,
    VALIDATION_CODE_PATTERN,
    VALIDATION_PASSWORD_PATTERN,
};
