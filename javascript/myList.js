document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('auth_token'); // Dapatkan token dari localStorage
    console.log('Token digunakan untuk mengambil daftar anime:', token); // Debug log token

    // Tampilkan loader
    const loader = document.getElementById('loader');
    loader.style.display = 'flex';

    fetch('https://mylistanime-api-anime.vercel.app/animes', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Tambahkan header Authorization
        }
    })
    .then(response => {
        console.log('Status respon fetch daftar anime:', response.status);
        if (!response.ok) {
            throw new Error(`Kesalahan HTTP! status: ${response.status}`);
        }
        return response.json();
    })
    .then(animes => {
        console.log('Daftar anime berhasil diambil:', animes);
        const animeListContainer = document.getElementById('anime-list');
        const noReviewsMessage = document.getElementById('no-reviews');

        // Sembunyikan loader
        loader.style.display = 'none';

        if (animes.length === 0) {
            noReviewsMessage.classList.remove('hidden');
        } else {
            noReviewsMessage.classList.add('hidden');
        }

        animes.forEach(anime => {
            const card = document.createElement('div');
            card.classList.add('bg-gray-800', 'rounded-lg', 'overflow-hidden', 'shadow-lg');
            card.innerHTML = `
                <img src="${anime.image}" alt="${anime.title}" class="w-full h-48 object-cover">
                <div class="p-4">
                    <h3 class="text-xl font-semibold text-blue-400">${anime.title}</h3>
                    <p class="mt-2">Rating: ${anime.rating}</p>
                    <p class="mt-2">Review: ${anime.review}</p>
                    <p class="mt-2">Genres: ${anime.genres}</p>
                    <p class="mt-2">Episodes: ${anime.episodes}</p>
                    <p class="mt-2">Year: ${anime.year}</p>
                    <button class="edit-review-button mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" data-id="${anime.id}">
                        Edit Review
                    </button>
                    <button class="delete-review-button mt-4 text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800" data-id="${anime.id}">
                        Hapus Review
                    </button>
                </div>
            `;
            animeListContainer.prepend(card); // Prepend the card to the container
        });

        // Tambahkan event listeners untuk tombol hapus
        document.querySelectorAll('.delete-review-button').forEach(button => {
            button.addEventListener('click', function() {
                const animeId = this.getAttribute('data-id');
                confirmDeleteReview(animeId);
            });
        });

        // Tambahkan event listeners untuk tombol edit
        document.querySelectorAll('.edit-review-button').forEach(button => {
            button.addEventListener('click', function() {
                const animeId = this.getAttribute('data-id');
                window.location.href = `/html/editListReview.html?id=${animeId}`;
            });
        });
    })
    .catch(error => {
        console.error('Error fetching anime list:', error);
        // Sembunyikan loader
        loader.style.display = 'none';
        document.getElementById('anime-list').innerHTML = '<p>Gagal mengambil daftar anime.</p>';
    });

    function confirmDeleteReview(animeId) {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Anda tidak dapat mengembalikan review ini!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteReview(animeId);
            }
        });
    }

    function deleteReview(animeId) {
        fetch(`https://mylistanime-api-anime.vercel.app/animes/${animeId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else if (response.status === 401) {
                throw new Error('Tidak terotorisasi.');
            } else if (response.status === 404) {
                throw new Error('Anime tidak ditemukan.');
            } else {
                throw new Error('Terjadi kesalahan.');
            }
        })
        .then(data => {
            if (!data.error) {
                Swal.fire(
                    'Dihapus!',
                    'Anime berhasil dihapus.',
                    'success'
                ).then(() => {
                    window.location.reload(); // Refresh halaman untuk memperbarui perubahan
                });
            } else {
                Swal.fire('Kesalahan', data.message, 'error');
            }
        })
        .catch(error => {
            Swal.fire('Kesalahan', error.message, 'error');
        });
    }

    // Fungsi untuk mendapatkan parameter query
    function getQueryParams() {
        const params = {};
        window.location.search.replace(/^\?/, '').split('&').forEach(param => {
            const [key, value] = param.split('=');
            params[key] = decodeURIComponent(value);
        });
        return params;
    }

    // Fungsi untuk memperbarui nama pengguna di navbar
    function updateUserUsername() {
        const params = getQueryParams();
        const username = params.username || localStorage.getItem('username');
        if (username) {
            localStorage.setItem('username', username); // Simpan username ke localStorage
            const userUsernameElement = document.getElementById('user-username');
            const mobileUserUsernameElement = document.getElementById('mobile-user-username');
            userUsernameElement.textContent = username;
            mobileUserUsernameElement.textContent = username;
        }
    }

    // Memuat navbar dari komponen HTML eksternal
    fetch('/html/layout/NavbarLogin.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;

            // Inisialisasi ulang event listener yang diperlukan
            document.getElementById('menu-button').addEventListener('click', function() {
                var menu = document.getElementById('mobile-menu');
                if (menu.classList.contains('hidden')) {
                    menu.classList.remove('hidden');
                    menu.style.maxHeight = menu.scrollHeight + 'px';
                } else {
                    menu.style.maxHeight = '0';
                    menu.addEventListener('transitionend', function() {
                        menu.classList.add('hidden');
                    }, { once: true });
                }
            });

            document.getElementById('search-input').addEventListener('input', function() {
                const query = this.value.trim();
                if (query.length > 2) {
                    performSearch(query, 'search-results');
                } else {
                    clearSearchResults('search-results');
                }
            });

            document.getElementById('mobile-search-input').addEventListener('input', function() {
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
        });
});
