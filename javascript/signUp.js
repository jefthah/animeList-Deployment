function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

document.getElementById('signup-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent form from submitting the default way
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Password Tidak Cocok',
            text: 'Password dan Konfirmasi Password tidak cocok',
        });
        return;
    }

    try {
        const response = await fetch('https://mylistanime-api-user.vercel.app/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const result = await response.json();
        console.log(result);

        console.log(result)

        if (response.ok) { // Menggunakan response.ok untuk memeriksa status keberhasilan
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Akun berhasil dibuat',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = '/html/signIn/login.html';
            });
        } else if (response.status === 400) {
            Swal.fire({
                icon: 'error',
                title: 'Kesalahan',
                text: 'Email atau password belum diisi',
            });
        } else if (response.status === 409) {
            Swal.fire({
                icon: 'error',
                title: 'Email Terdaftar',
                text: 'Email telah terdaftar',
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Kesalahan',
                text: result.message || 'Terjadi kesalahan koneksi',
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Kesalahan',
            text: 'Terjadi kesalahan koneksi',
        });
    }
});


