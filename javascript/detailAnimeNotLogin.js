document.addEventListener("DOMContentLoaded", function() {
    fetch('/html/layout/NavbarNotLogin.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;

            // Inisialisasi ulang JS yang diperlukan di sini
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
                        searchResults.innerHTML = ''; // Clear previous results

                        data.data.forEach(anime => {
                            const resultItem = document.createElement('a');
                            resultItem.href = `detailAnimeNotLogin.html?id=${anime.mal_id}`;
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
        fetch('/html/footer/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        });

    const params = new URLSearchParams(window.location.search);
    const animeId = params.get('id');

    if (!animeId) {
        console.error('No anime ID found in URL');
        return;
    }

    function showReviewLoading() {
        const reviewLoadingElement = document.getElementById('review-loading');
        reviewLoadingElement.classList.remove('hidden');
    }

    function hideReviewLoading() {
        const reviewLoadingElement = document.getElementById('review-loading');
        reviewLoadingElement.classList.add('hidden');
    }

    // Fetch Anime Details
    fetch(`https://api.jikan.moe/v4/anime/${animeId}`)
        .then(response => response.json())
        .then(data => {
            const anime = data.data;

            document.getElementById('anime-image').src = anime.images.jpg.image_url;
            document.getElementById('anime-title').textContent = anime.title;
            document.getElementById('anime-release').textContent = `Release: ${anime.aired.string}`;
            document.getElementById('anime-genre').textContent = `Genre: ${anime.genres.map(g => g.name).join(', ')}`;
            document.getElementById('anime-author').textContent = `Author: ${anime.studios.map(s => s.name).join(', ')}`;
            document.getElementById('anime-rating').textContent = `Rating: ${anime.score}`;
            document.getElementById('anime-description').textContent = anime.synopsis;
            document.getElementById('anime-trailer-title').textContent = `${anime.title} Trailer`;

            // Populate Anime Trailer
            if (anime.trailer.embed_url) {
                document.getElementById('anime-trailer').innerHTML = `
                    <iframe width="100%" height="100%" src="${anime.trailer.embed_url}" frameborder="0" allowfullscreen></iframe>
                `;
            } else {
                document.getElementById('anime-trailer').textContent = 'No trailer available';
            }

            // Fetch Related Anime
            return fetch(`https://api.jikan.moe/v4/anime/${animeId}/recommendations`);
        })
        .then(response => response.json())
        .then(relatedData => {
            const relatedAnimeContainer = document.getElementById('related-anime');

            relatedData.data.slice(0, 4).forEach(recommendation => {
                const relatedAnime = recommendation.entry;
                const card = document.createElement('div');
                card.classList.add('bg-gray-800', 'rounded-lg', 'overflow-hidden', 'shadow-lg');
                card.innerHTML = `
                    <img src="${relatedAnime.images.jpg.image_url}" alt="${relatedAnime.title}" class="w-full h-48 object-cover">
                    <div class="p-4">
                        <a href="detailAnimeNotLogin.html?id=${relatedAnime.mal_id}" class="text-xl font-semibold text-blue-400 hover:text-blue-600">${relatedAnime.title}</a>
                        <p class="mt-2">Rating: ${relatedAnime.score || 'N/A'}</p>
                    </div>
                `;
                relatedAnimeContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching anime details:', error);
        });

    // Fetch and Display Reviews
    showReviewLoading();

    // Fetch the anime title to use in the review query
    fetch(`https://api.jikan.moe/v4/anime/${animeId}`)
        .then(response => response.json())
        .then(data => {
            const animeTitle = data.data.title;

            return fetch(`https://mylistanime-api-anime.vercel.app/animes/reviews?title=${encodeURIComponent(animeTitle)}`)
                .then(response => response.json())
                .then(reviews => {
                    const reviewsContainer = document.getElementById('anime-reviews');
                    reviewsContainer.innerHTML = ''; // Clear previous reviews
                    if (reviews.length === 0) {
                        reviewsContainer.innerHTML = '<p>No reviews available.</p>';
                        return;
                    }

                    reviews.sort((a, b) => b.id - a.id); // Sort reviews by ID in descending order

                    const reviewPromises = reviews.map(review => {
                        return fetchUserProfile(review.user.username).then(userProfile => {
                            const reviewElement = document.createElement('div');
                            reviewElement.classList.add('flex', 'items-start', 'bg-gray-900', 'p-4', 'rounded-lg', 'shadow-lg', 'space-x-4');
                            reviewElement.innerHTML = `
                                <div class="flex-shrink-0">
                                    <img src="${userProfile.image || 'default-avatar.png'}" alt="${review.user.username}" class="w-12 h-12 md:w-16 md:h-16 bg-gray-700 rounded-full object-cover">
                                </div>
                                <div>
                                    <h3 class="text-xl font-semibold">${review.user.username}</h3>
                                    <p>Rating: ${review.rating}</p>
                                    <p>${review.review}</p>
                                </div>
                            `;
                            reviewsContainer.prepend(reviewElement); // Prepend to ensure the latest review is on top
                        });
                    });

                    return Promise.all(reviewPromises);
                })
                .catch(error => {
                    console.error('Error fetching reviews:', error);
                    document.getElementById('anime-reviews').innerHTML = '<p>Failed to fetch reviews.</p>';
                })
                .finally(() => {
                    hideReviewLoading();
                });
        })
        .catch(error => {
            console.error('Error fetching anime title:', error);
        });

    function fetchUserProfile(username) {
        return fetch(`https://mylistanime-api-user.vercel.app/${username}`)
            .then(response => response.json())
            .then(data => data.user)
            .catch(error => {
                console.error(`Error fetching user profile for ${username}:`, error);
                return null;
            });
    }
});
