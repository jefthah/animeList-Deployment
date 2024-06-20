document.addEventListener("DOMContentLoaded", function() {
    // Memuat Navbar
    fetch('/html/layout/NavbarNotLogin.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;

            // Menambahkan event listener untuk navbar
            const menuButton = document.getElementById('menu-button');
            if (menuButton) {
                menuButton.addEventListener('click', function() {
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
            }

            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.addEventListener('input', function() {
                    const query = this.value.trim();
                    if (query.length > 2) {
                        performSearch(query, 'search-results');
                    } else {
                        clearSearchResults('search-results');
                    }
                });
            }

            const mobileSearchInput = document.getElementById('mobile-search-input');
            if (mobileSearchInput) {
                mobileSearchInput.addEventListener('input', function() {
                    const query = this.value.trim();
                    if (query.length > 2) {
                        performSearch(query, 'mobile-search-results');
                    } else {
                        clearSearchResults('mobile-search-results');
                    }
                });
            }

            function performSearch(query, resultContainerId) {
                fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=10`)
                    .then(response => response.json())
                    .then(data => {
                        const searchResults = document.getElementById(resultContainerId);
                        searchResults.innerHTML = ''; // Bersihkan hasil sebelumnya

                        data.data.forEach(anime => {
                            const resultItem = document.createElement('a');
                            resultItem.href = `/html/Guest/detailAnimeNotLogin.html?id=${anime.mal_id}&email=${localStorage.getItem('email')}`;
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
        });

    // Memuat Footer
    fetch('/html/footer/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        });

    // Memuat genre dan menampilkannya
    fetchGenres();

    // Fungsi untuk memuat genre
    function fetchGenres() {
        fetch('https://api.jikan.moe/v4/genres/anime')
            .then(response => response.json())
            .then(data => {
                const genreContainer = document.getElementById('genre-container');
                genreContainer.innerHTML = ''; // Bersihkan hasil sebelumnya

                const selectedGenres = [
                    1,   // Action
                    2,   // Adventure
                    5,   // Avant Garde
                    46,  // Award Winning
                    28,  // Boys Love
                    4,   // Comedy
                    8,   // Drama
                    10,  // Fantasy
                    26,  // Girls Love
                    14,  // Horror
                    7,   // Mystery
                    22,  // Romance
                    24,  // Sci-Fi
                    36,  // Slice of Life
                    30,  // Sports
                    37,  // Supernatural
                    41   // Suspense
                ];

                data.data.forEach(genre => {
                    if (selectedGenres.includes(genre.mal_id)) {
                        const genreItem = document.createElement('div');
                        genreItem.classList.add('genre-category', 'cursor-pointer', 'hover:bg-gray-700', 'p-2', 'rounded');
                        genreItem.id = `genre-${genre.mal_id}`;
                        genreItem.textContent = genre.name;
                        genreContainer.appendChild(genreItem);

                        // Menambahkan event listener untuk memuat anime berdasarkan genre
                        genreItem.addEventListener('click', function() {
                            fetchAnimeByGenre(genre.mal_id, genre.name);
                        });

                        console.log(`Genre item created: ${genre.name} with ID: genre-${genre.mal_id}`);
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching genres:', error);
            });
    }

    // Memuat Anime berdasarkan Genre
    function fetchAnimeByGenre(genreId, genreName) {
        const loadingSpinner = document.getElementById('loading-spinner');
        loadingSpinner.classList.remove('hidden');
        document.getElementById('anime-prompt').classList.add('hidden'); // Sembunyikan pesan prompt

        fetch(`https://api.jikan.moe/v4/anime?genres=${genreId}&order_by=popularity`)
            .then(response => response.json())
            .then(data => {
                const animeContainer = document.getElementById('anime-container');
                animeContainer.innerHTML = ''; // Bersihkan hasil sebelumnya

                data.data.forEach(anime => {
                    const animeItem = document.createElement('div');
                    animeItem.classList.add('anime-item', 'bg-gray-800', 'rounded-lg', 'overflow-hidden', 'shadow-lg', 'text-white');
                    animeItem.innerHTML = `
                        <img src="${anime.images.webp?.image_url}" alt="${anime.title}" class="w-full h-48 object-cover">
                        <div class="p-4">
                            <h3 class="text-lg font-bold mt-2">${anime.title}</h3>
                            <p class="text-gray-400">Rating: ${anime.score || 'N/A'}</p>
                            <p class="text-gray-400">Year: ${anime.year || 'N/A'}</p>
                            <button class="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700" onclick="window.location.href='/html/Guest/detailAnimeNotLogin.html?id=${anime.mal_id}&email=${localStorage.getItem('email')}'">Learn More</button>
                        </div>
                    `;
                    animeContainer.appendChild(animeItem);
                });

                document.getElementById('selected-genre').textContent = `> ${genreName}`;
                loadingSpinner.classList.add('hidden');

                // Hapus kelas aktif dari semua item genre
                document.querySelectorAll('.genre-category').forEach(item => {
                    item.classList.remove('active');
                });

                // Tambahkan kelas aktif ke item genre yang dipilih
                const selectedGenreItem = document.getElementById(`genre-${genreId}`);
                if (selectedGenreItem) {
                    selectedGenreItem.classList.add('active');
                }
            })
            .catch(error => {
                console.error('Error fetching anime:', error);
                loadingSpinner.classList.add('hidden');
            });
    }

    // Memuat semua anime dari semua genre saat halaman dimuat
    fetchAllAnime();

    function fetchAllAnime() {
        document.getElementById('anime-prompt').classList.remove('hidden'); // Tampilkan pesan prompt
        // Logika tambahan untuk memuat semua anime dapat ditambahkan di sini
    }
});
