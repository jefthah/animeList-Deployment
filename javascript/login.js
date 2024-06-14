function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}

document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Mencegah form dari submit secara default
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('https://mylistanime-api.vercel.app/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok && !result.error) {
            // Simpan token, email, dan username ke localStorage
            const token = result.loginResult.token;
            const username = result.loginResult.username; // Pastikan API mengembalikan username
            localStorage.setItem('auth_token', token);
            localStorage.setItem('email', email); // Simpan email ke localStorage
            localStorage.setItem('username', username); // Simpan username ke localStorage

            // Redirect ke homeLogin.html
            Swal.fire({
                icon: 'success',
                title: 'Login Berhasil!',
                text: 'Anda akan diarahkan ke halaman utama.',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = `../html/homeLogin.html?username=${encodeURIComponent(username)}`;
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Login Gagal',
                text: result.message || 'Email atau password salah',
            });
        }
    } catch (error) {
        console.error('Kesalahan saat login:', error);
        Swal.fire({
            icon: 'error',
            title: 'Kesalahan',
            text: 'Terjadi kesalahan koneksi',
        });
    }
});
