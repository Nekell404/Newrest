const usernameInput = document.querySelector('input[name="username"]');

usernameInput.addEventListener('input', () => {
  const username = usernameInput.value;
  if (username.includes(' ') || /[A-Z]/.test(username)) {
    usernameInput.setCustomValidity("Username tidak boleh mengandung spasi atau huruf besar.");
  } else {
    usernameInput.setCustomValidity("");
  }
});
  
function autoSubmitVerifyBtn() {
  const form = document.querySelector('form');
  const otpInput = document.querySelector('input[name="otp"]');
  const submitButton = document.querySelector('button[type="submit"]');
  const alert = document.querySelector('#alert');
  
  if (otpInput.value.length === 6) {
    alert.style.display = 'none';
    submitButton.disabled = true;
    submitButton.style.opacity = 0.5;
    form.submit();
  } else {
    submitButton.disabled = false;
    alert.textContent = 'Panjang OTP harus 6 karakter';
  }
}
