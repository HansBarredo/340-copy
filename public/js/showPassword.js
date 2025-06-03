document.addEventListener('DOMContentLoaded', function () {
    const passwordField = document.getElementById('account_password');
    const toggle = document.getElementById('togglePassword');

    if (toggle && passwordField) {
        toggle.addEventListener('change', function () {
            passwordField.type = this.checked ? 'text' : 'password';
        });
    }
});