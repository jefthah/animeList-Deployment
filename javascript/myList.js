document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('auth_token'); // Get token from localStorage
    console.log('Token used to fetch anime list:', token); // Debug log token

    // Show loader
    const loader = document.getElementById('loader');
    loader.style.display = 'flex';

    // Sembunyikan tombol edit review pada awalnya
    const editReviewButton = document.getElementById('edit-review-button');
    editReviewButton.style.display = 'none';

    fetch('https://mylistanime-api.vercel.app/animes', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Add Authorization header
        }
    })
    .then(response => {
        console.log('Fetch anime list response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(animes => {
        console.log('Anime list fetched:', animes);
        const animeListContainer = document.getElementById('anime-list');
        const noReviewsMessage = document.getElementById('no-reviews');

        // Hide loader
        loader.style.display = 'none';

        if (animes.length === 0) {
            noReviewsMessage.classList.remove('hidden');
            editReviewButton.style.display = 'none'; // Hide edit review button if no reviews
        } else {
            noReviewsMessage.classList.add('hidden');
            editReviewButton.style.display = 'block'; // Show edit review button if there are reviews
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
                </div>
            `;
            animeListContainer.prepend(card); // Prepend the card to the container
        });
    })
    .catch(error => {
        console.error('Error fetching anime list:', error);
        // Hide loader
        loader.style.display = 'none';
        document.getElementById('anime-list').innerHTML = '<p>Failed to fetch anime list.</p>';
    });

    // Function to get query parameters
    function getQueryParams() {
        const params = {};
        window.location.search.replace(/^\?/, '').split('&').forEach(param => {
            const [key, value] = param.split('=');
            params[key] = decodeURIComponent(value);
        });
        return params;
    }

    // Function to update user username in the navbar
    function updateUserUsername() {
        const params = getQueryParams();
        const username = params.username || localStorage.getItem('username');
        if (username) {
            localStorage.setItem('username', username); // Save username to localStorage
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
