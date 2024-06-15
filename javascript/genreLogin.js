document.addEventListener("DOMContentLoaded", function() {
    // Load Navbar
    fetch('/html/layout/NavbarLogin.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;

            // Add event listeners for the navbar
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
                        searchResults.innerHTML = ''; // Clear previous results

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

    // Fetch genres and display them
    fetchGenres();

    // Fetch and display all anime from all genres on page load
    fetchAllAnime();

    // Function to fetch genres
    function fetchGenres() {
        fetch('https://api.jikan.moe/v4/genres/anime')
            .then(response => response.json())
            .then(data => {
                const genreContainer = document.getElementById('genre-container');
                genreContainer.innerHTML = ''; // Clear previous results

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
                        genreItem.classList.add('genre-category');
                        genreItem.id = genre.mal_id;
                        genreItem.textContent = genre.name;
                        genreContainer.appendChild(genreItem);

                        // Add click event listener to fetch anime by genre
                        genreItem.addEventListener('click', function() {
                            fetchAnimeByGenre(genre.mal_id, genre.name);
                        });
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching genres:', error);
            });
    }

    function fetchAllAnime() {
        document.getElementById('loading-spinner').classList.remove('hidden');
        
        // Fetch anime from selected genres to avoid too many requests
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

        let allAnime = [];
        let delay = 500; // 500ms delay between requests
        let promises = selectedGenres.map((genre, index) => 
            new Promise((resolve) => 
                setTimeout(() => 
                    fetch(`https://api.jikan.moe/v4/anime?genres=${genre}`)
                        .then(response => response.json())
                        .then(data => {
                            allAnime = allAnime.concat(data.data);
                            resolve();
                        })
                        .catch(error => {
                            console.error(`Error fetching ${genre}:`, error);
                            resolve();
                        }), index * delay)
            )
        );

        Promise.all(promises)
            .then(() => {
                const animeContainer = document.getElementById('anime-container');
                animeContainer.innerHTML = ''; // Clear previous results

                allAnime.forEach(anime => {
                    const animeItem = document.createElement('div');
                    animeItem.classList.add('anime-item', 'bg-gray-800', 'rounded-lg', 'overflow-hidden', 'shadow-lg', 'text-white');
                    animeItem.innerHTML = `
                        <img src="${anime.images.webp?.image_url}" alt="${anime.title}" class="w-full h-48 object-cover">
                        <div class="p-4">
                            <h3 class="text-lg font-bold mt-2">${anime.title}</h3>
                            <p class="text-gray-400">Rating: ${anime.score || 'N/A'}</p>
                            <p class="text-gray-400">Year: ${anime.year || 'N/A'}</p>
                            <button class="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700" onclick="window.location.href='/html/detailAnime.html?id=${anime.mal_id}&username=${localStorage.getItem('username')}'">Learn More</button>
                        </div>
                    `;
                    animeContainer.appendChild(animeItem);
                });

                document.getElementById('loading-spinner').classList.add('hidden');
            })
            .catch(error => {
                console.error('Error fetching anime:', error);
                document.getElementById('loading-spinner').classList.add('hidden');
            });
    }

    // Fetch Anime by Genre
    function fetchAnimeByGenre(genreId, genreName) {
        document.getElementById('loading-spinner').classList.remove('hidden');

        fetch(`https://api.jikan.moe/v4/anime?genres=${genreId}`)
            .then(response => response.json())
            .then(data => {
                const animeContainer = document.getElementById('anime-container');
                animeContainer.innerHTML = ''; // Clear previous results

                data.data.forEach(anime => {
                    const animeItem = document.createElement('div');
                    animeItem.classList.add('anime-item', 'bg-gray-800', 'rounded-lg', 'overflow-hidden', 'shadow-lg', 'text-white');
                    animeItem.innerHTML = `
                        <img src="${anime.images.webp?.image_url}" alt="${anime.title}" class="w-full h-48 object-cover">
                        <div class="p-4">
                            <h3 class="text-lg font-bold mt-2">${anime.title}</h3>
                            <p class="text-gray-400">Rating: ${anime.score || 'N/A'}</p>
                            <p class="text-gray-400">Year: ${anime.year || 'N/A'}</p>
                            <button class="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700" onclick="window.location.href='/html/detailAnime.html?id=${anime.mal_id}&username=${localStorage.getItem('username')}'">Learn More</button>
                        </div>
                    `;
                    animeContainer.appendChild(animeItem);
                });

                document.getElementById('selected-genre').textContent = `> ${genreName}`;
                document.getElementById('loading-spinner').classList.add('hidden');

                // Remove active class from all genre items
                document.querySelectorAll('.genre-category').forEach(item => {
                    item.classList.remove('active');
                });

                // Add active class to the selected genre item
                document.getElementById(genreId).classList.add('active');
            })
            .catch(error => {
                console.error('Error fetching anime:', error);
                document.getElementById('loading-spinner').classList.add('hidden');
            });
    }

    function updateUserUsername() {
        const params = getQueryParams();
        const username = params.username || localStorage.getItem('username');
        if (username) {
            localStorage.setItem('username', username); // Simpan username ke localStorage jika ada di query params
            const userUsernameElement = document.getElementById('user-username');
            const mobileUserUsernameElement = document.getElementById('mobile-user-username');
            userUsernameElement.textContent = username;
            mobileUserUsernameElement.textContent = username;
        }
    }

    function getQueryParams() {
        const params = {};
        window.location.search.replace(/^\?/, '').split('&').forEach(param => {
            const [key, value] = param.split('=');
            params[key] = decodeURIComponent(value);
        });
        return params;
    }
});
