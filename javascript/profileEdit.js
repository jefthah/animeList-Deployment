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

    // Handle profile form submission
    const profileForm = document.getElementById('profile-form');
    profileForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const formData = new FormData();
        const profileImage = document.getElementById('profile-image').files[0];
        const profileDesc = document.getElementById('profile-desc').value;

        if (profileImage) formData.append('image', profileImage);
        if (profileDesc) formData.append('desc', profileDesc);

        // Mendapatkan token dari localStorage atau sumber lain
        const token = localStorage.getItem('auth_token'); // Pastikan token disimpan di localStorage

        fetch('https://mylistanime-api-user.vercel.app/edit', {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.message);
            }
            Swal.fire('Berhasil', 'Profil berhasil diperbarui', 'success').then(() => {
                window.location.href = '/html/profile.html';
            });
        })
        .catch(error => {
            console.error('Error updating profile:', error);
            Swal.fire('Gagal', 'Terjadi kesalahan saat memperbarui profil', 'error');
        });
    });

    function updateUserUsername() {
        const username = localStorage.getItem('username');
        const userUsernameElement = document.getElementById('user-username');
        const mobileUserUsernameElement = document.getElementById('mobile-user-username');
        if (userUsernameElement) userUsernameElement.textContent = username;
        if (mobileUserUsernameElement) mobileUserUsernameElement.textContent = username;
    }
});
