document.addEventListener('DOMContentLoaded', async function () {
    const params = new URLSearchParams(window.location.search);
    const animeId = params.get('id');
    const username = params.get('username') || localStorage.getItem('username');

    if (!animeId) {
        console.error('ID anime tidak ditemukan di URL');
        return;
    }

    // Memuat navbar dari komponen HTML eksternal
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
                            resultItem.href = `/html/detailAnime.html?id=${anime.mal_id}&username=${username}`;
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
        });

    async function fetchAnimeDetails() {
        try {
            const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}`);
            if (!response.ok) {
                throw new Error('Gagal mengambil detail anime');
            }

            const data = await response.json();
            const anime = data.data;

            // Isi detail anime
            document.getElementById('anime-image').src = anime.images.jpg.image_url;
            document.getElementById('anime-title').textContent = `Review: ${anime.title}`;
            document.getElementById('anime-release').textContent = `Release: ${anime.aired.string}`;
            document.getElementById('anime-genre').textContent = `Genre: ${anime.genres.map(g => g.name).join(', ')}`;
            document.getElementById('anime-author').textContent = `Author: ${anime.studios.map(s => s.name).join(', ')}`;
            document.getElementById('anime-rating').textContent = `Rating: ${anime.score}`;
            document.getElementById('anime-description').textContent = anime.synopsis;

            document.getElementById('review-form').addEventListener('submit', async function (event) {
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
                    title: anime.title,
                    rating: parseFloat(reviewRating),
                    review: reviewText,
                    username: username
                };

                try {
                    const token = localStorage.getItem('auth_token');
                    if (!token) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Tidak Berizin',
                            text: 'Anda tidak memiliki izin. Silakan login kembali.',
                        });
                        return;
                    }

                    const reviewResponse = await fetch('https://mylistanime-api.vercel.app/animes', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(reviewData)
                    });

                    const responseBody = await reviewResponse.text();
                    if (reviewResponse.ok) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Review Berhasil!',
                            text: 'Review berhasil ditambahkan!',
                            timer: 2000,
                            showConfirmButton: false
                        }).then(() => {
                            window.location.href = `detailAnime.html?id=${animeId}&username=${username}`;
                        });
                    } else if (reviewResponse.status === 401) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Gagal Mengirim Review',
                            text: 'Anda tidak memiliki izin.',
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
        } catch (error) {
            console.error('Error fetching anime details:', error);
        }
    }

    function updateUserUsername() {
        const username = localStorage.getItem('username');
        if (username) {
            const userUsernameElement = document.getElementById('user-username');
            const mobileUserUsernameElement = document.getElementById('mobile-user-username');
            userUsernameElement.textContent = username;
            mobileUserUsernameElement.textContent = username;
        }
    }

    fetchAnimeDetails();
});
