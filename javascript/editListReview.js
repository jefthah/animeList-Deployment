document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const animeId = params.get('id');
    const token = localStorage.getItem('auth_token');

    if (!animeId) {
        console.error('ID anime tidak ditemukan di URL');
        return;
    }

    console.log('Mengambil detail untuk anime dengan ID:', animeId);

    // Tampilkan loader hanya pada bagian review
    const loader = document.getElementById('loader');
    loader.style.display = 'flex';

    // Memuat navbar dari komponen HTML eksternal terlebih dahulu
    fetch('/html/layout/NavbarLogin.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;

            // Inisialisasi ulang event listener yang diperlukan
            document.getElementById('menu-button').addEventListener('click', function () {
                var menu = document.getElementById('mobile-menu');
                if (menu.classList.contains('hidden')) {
                    menu.classList.remove('hidden');
                    menu.style.maxHeight = menu.scrollHeight + 'px';
                } else {
                    menu.style.maxHeight = '0';
                    menu.addEventListener('transitionend', function () {
                        menu.classList.add('hidden');
                    }, { once: true });
                }
            });

            document.getElementById('search-input').addEventListener('input', function () {
                const query = this.value.trim();
                if (query.length > 2) {
                    performSearch(query, 'search-results');
                } else {
                    clearSearchResults('search-results');
                }
            });

            document.getElementById('mobile-search-input').addEventListener('input', function () {
                const query = this.value.trim();
                if (query.length > 2) {
                    performSearch(query, 'mobile-search-results');
                } else {
                    clearSearchResults('mobile-search-results');
                }
            });

            function performSearch(query, resultContainerId) {
                fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=10`)
                    .then(response => response.json())
                    .then(data => {
                        const searchResults = document.getElementById(resultContainerId);
                        searchResults.innerHTML = ''; // Hapus hasil sebelumnya

                        data.data.forEach(anime => {
                            const resultItem = document.createElement('a');
                            resultItem.href = `/html/detailAnime.html?id=${anime.mal_id}&username=${localStorage.getItem('username')}`;
                            resultItem.classList.add('p-2', 'hover:bg-gray-200', 'cursor-pointer', 'flex', 'items-center');
                            resultItem.innerHTML = `
                                <img src="${anime.images.webp.image_url}" alt="${anime.title}" class="w-12 h-12 object-cover inline-block mr-2">
                                <span>${anime.title}</span>
                            `;
                            searchResults.appendChild(resultItem);
                        });

                        searchResults.classList.remove('hidden');
                    })
                    .catch(error => {
                        console.error('Error fetching search results:', error);
                    });
            }

            function clearSearchResults(resultContainerId) {
                const searchResults = document.getElementById(resultContainerId);
                searchResults.innerHTML = '';
                searchResults.classList.add('hidden');
            }

            updateUserUsername();
        })
        .then(() => {
            // Setelah navbar dimuat, ambil detail anime
            fetchAnimeDetails();
        });

    function updateUserUsername() {
        const username = localStorage.getItem('username');
        if (username) {
            const userUsernameElement = document.getElementById('user-username');
            const mobileUserUsernameElement = document.getElementById('mobile-user-username');
            userUsernameElement.textContent = username;
            mobileUserUsernameElement.textContent = username;
        }
    }

    async function fetchAnimeDetails() {
        try {
            // Ambil data dari server internal
            const response = await fetch(`https://mylistanime-api-anime.vercel.app/animes/${animeId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Gagal mengambil detail anime, status: ${response.status}`);
            }

            const anime = await response.json();
            console.log('Detail anime dari server internal:', anime);

            // Gunakan judul untuk mencari detail dari API Jikan
            const animeTitle = anime.title;
            console.log('Mengambil detail dari Jikan API untuk judul:', animeTitle);

            const jikanResponse = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeTitle)}`);
            if (!jikanResponse.ok) {
                throw new Error(`Gagal mengambil detail dari Jikan API, status: ${jikanResponse.status}`);
            }

            const jikanData = await jikanResponse.json();
            const jikanAnime = jikanData.data[0]; // Ambil anime pertama dari hasil pencarian
            console.log('Detail dari Jikan API:', jikanAnime);

            const author = jikanAnime.studios.map(studio => studio.name).join(', ') || 'Tidak diketahui';
            const description = jikanAnime.synopsis || 'Tidak ada deskripsi';

            // Isi detail anime
            document.getElementById('anime-image').src = anime.image;
            document.getElementById('anime-title').textContent = `Edit Review: ${anime.title}`;
            document.getElementById('anime-release').textContent = `Release: ${anime.year}`;
            document.getElementById('anime-genre').textContent = `Genre: ${Array.isArray(anime.genres) ? anime.genres.join(', ') : anime.genres}`;
            document.getElementById('anime-author').textContent = `Author: ${author}`;
            document.getElementById('anime-rating').textContent = `Rating: ${anime.rating}`;
            document.getElementById('anime-description').textContent = description;

            // Isi form dengan data review
            document.getElementById('review-text').value = anime.review;
            document.getElementById('review-rating').value = anime.rating;

            // Sembunyikan loader dan tampilkan konten
            loader.style.display = 'none';
            document.getElementById('review-section').classList.remove('hidden');
        } catch (error) {
            console.error('Error fetching anime details:', error);
            Swal.fire('Kesalahan', error.message, 'error');
            loader.style.display = 'none';
        }
    }

    document.getElementById('edit-review-form').addEventListener('submit', async function (event) {
        event.preventDefault();

        const reviewTextElement = document.getElementById('review-text');
        const reviewRatingElement = document.getElementById('review-rating');

        if (!reviewTextElement || !reviewRatingElement) {
            console.error('Satu atau lebih elemen formulir tidak ditemukan');
            return;
        }

        const reviewText = reviewTextElement.value.trim();
        const reviewRating = reviewRatingElement.value;

        if (reviewText === '' || reviewRating === '') {
            Swal.fire({
                icon: 'error',
                title: 'Input Tidak Lengkap',
                text: 'Mohon isi teks ulasan dan rating',
            });
            return;
        }

        const reviewData = {
            review: reviewText,
            rating: parseFloat(reviewRating)
        };

        try {
            const reviewResponse = await fetch(`https://mylistanime-api-anime.vercel.app/animes/${animeId}`, {
                method: 'PATCH', // Menggunakan PATCH sesuai dokumentasi API
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(reviewData)
            });

            console.log('Response PATCH:', reviewResponse); // Tambahkan log untuk response PATCH

            if (reviewResponse.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Review Berhasil!',
                    text: 'Review berhasil diperbarui!',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = '/html/myList.html';
                });
            } else if (reviewResponse.status === 401) {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Mengirim Review',
                    text: 'Anda tidak memiliki izin.',
                });
            } else if (reviewResponse.status === 404) {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Mengirim Review',
                    text: 'Anime tidak ditemukan.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Mengirim Review',
                    text: 'Gagal mengirim review. Silakan coba lagi.',
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Kesalahan',
                text: 'Terjadi kesalahan. Silakan coba lagi.',
            });
        }
    });
});
