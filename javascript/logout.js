// Tambahkan event listener untuk tombol logout
document.getElementById('logoutButton').addEventListener('click', function() {
    logoutUser();
});

// Fungsi untuk logout pengguna
function logoutUser() {
    // Hapus data email dari localStorage
    localStorage.removeItem('email');
    
    // Setelah menghapus data email, Anda dapat mengarahkan pengguna ke halaman logout atau melakukan aksi lain yang diperlukan.
    
    // Contoh: Redirect ke halaman logout
    window.location.href = '/logout.html';
}
