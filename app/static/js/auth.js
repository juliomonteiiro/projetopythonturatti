document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".toggle-password").forEach(toggle => {
        toggle.addEventListener("click", function () {
            const target = document.getElementById(toggle.dataset.target);
            target.type = target.type === "password" ? "text" : "password";
            this.classList.toggle("fa-eye-slash");
        });
    });

    function showError(input, message) {
        const errorMessage = document.createElement("small");
        errorMessage.classList.add("text-danger", "form-text");
        errorMessage.textContent = message;
        input.classList.add("is-invalid");

        if (!input.nextElementSibling || !input.nextElementSibling.classList.contains("text-danger")) {
            input.insertAdjacentElement("afterend", errorMessage);
        }
    }

    function clearErrors(input) {
        input.classList.remove("is-invalid");
        const errorMessage = input.nextElementSibling;
        if (errorMessage && errorMessage.classList.contains("text-danger")) {
            errorMessage.remove();
        }
    }

    document.getElementById("registerForm").addEventListener("submit", function (e) {
        const password = document.getElementById("password");
        const confirm = document.getElementById("confirm_password");

        let isValid = true;

        clearErrors(password);
        clearErrors(confirm);

        const strengthRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!strengthRegex.test(password.value)) {
            showError(password, "A senha deve ter pelo menos 8 caracteres, 1 número, 1 letra maiúscula e 1 símbolo.");
            isValid = false;
        }

        if (password.value !== confirm.value) {
            showError(confirm, "As senhas não coincidem.");
            isValid = false;
        }

        if (!isValid) {
            e.preventDefault();
        }
    });

    document.getElementById("loginForm")?.addEventListener("submit", function (e) {
        const password = document.getElementById("password");
        clearErrors(password);

        if (password.value.trim() === "") {
            showError(password, "Por favor, insira sua senha.");
            e.preventDefault();
        }
    });
});
