document.addEventListener("DOMContentLoaded", function() {
    fetch('/html/layout/NavbarNotLogin.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;

            // Reinitialize any required JS here
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
                            resultItem.href = `/html/detailAnimeNotLogin.html?id=${anime.mal_id}&email=${localStorage.getItem('email')}`;
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

    // Fetching and displaying anime cards dynamically
    fetchAnimeByGenre('Slice of Life', 'sol-cards', 'loading-sol-anime');
    fetchAnimeByGenre('Isekai', 'isekai-cards', 'loading-isekai-anime');
    fetchAnimeByGenre('Romance', 'romance-cards', 'loading-romance-anime');
    fetchAnimeByGenre('Adventure', 'adventure-cards', 'loading-adventure-anime');
    fetchAnimeByGenre('Horror', 'horror-cards', 'loading-horror-anime');
    fetchAnimeByGenre('Sports', 'olahraga-cards', 'loading-olahraga-anime');
});

function fetchAnimeByGenre(genre, containerId, loadingId) {
    const loadingElement = document.getElementById(loadingId);
    const cardsContainer = document.getElementById(containerId);

    fetch(`https://api.jikan.moe/v4/anime?genres=${genre}&limit=8`)
        .then(response => response.json())
        .then(data => {
            data.data.forEach(anime => {
                const card = document.createElement('div');
                card.classList.add('bg-gray-800', 'rounded-lg', 'overflow-hidden', 'shadow-lg');
                card.innerHTML = `
                    <img src="${anime.images.webp.image_url}" alt="${anime.title}" class="w-full h-48 object-cover">
                    <div class="p-4">
                        <h3 class="text-xl font-semibold">${anime.title}</h3>
                        <a href="detailAnimeNotLogin.html?id=${anime.mal_id}" class="mt-2 inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Learn More</a>
                    </div>
                `;
                cardsContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error(`Error fetching ${genre} anime data:`, error);
        })
        .finally(() => {
            loadingElement.style.display = 'none';
        });
}
