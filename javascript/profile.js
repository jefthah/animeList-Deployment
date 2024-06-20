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
            updateUserProfile();
        });

    // Fetch logged-in user's username and email
    function updateUserProfile() {
        const username = localStorage.getItem('username');
        const usernameSpinner = document.getElementById('username-spinner');
        const emailSpinner = document.getElementById('email-spinner');

        usernameSpinner.classList.remove('hidden'); // Show username spinner
        emailSpinner.classList.remove('hidden'); // Show email spinner

        console.log("Fetching user data..."); // Log for debugging

        fetch(`https://mylistanime-api-user.vercel.app/${username}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('User data:', data); // Log the response data to debug
                if (data && data.user && data.user.username && data.user.email) {
                    document.getElementById('username').innerText = data.user.username;
                    document.getElementById('email').innerText = data.user.email;

                    // Check if image and desc are null
                    const userImage = data.user.image ? data.user.image : 'default-avatar.png';
                    const userDesc = data.user.desc !== null ? data.user.desc : 'Tidak ada deskripsi tersedia';

                    document.getElementById('avatar-img').src = userImage;
                    document.getElementById('avatar-placeholder').style.backgroundImage = `url(${userImage})`;
                    document.getElementById('description').innerText = userDesc;
                } else {
                    console.error('Invalid user data format:', data);
                }
            })
            .catch(error => console.error('Error fetching user data:', error))
            .finally(() => {
                usernameSpinner.classList.add('hidden'); // Hide username spinner
                emailSpinner.classList.add('hidden'); // Hide email spinner
                console.log("User data fetched."); // Log for debugging
            });
    }

    function updateUserUsername() {
        const params = getQueryParams();
        const username = params.username || localStorage.getItem('username');
        if (username) {
            localStorage.setItem('username', username); // Simpan username ke localStorage jika ada di query params
            const userUsernameElement = document.getElementById('user-username');
            const mobileUserUsernameElement = document.getElementById('mobile-user-username');
            if (userUsernameElement) userUsernameElement.textContent = username;
            if (mobileUserUsernameElement) mobileUserUsernameElement.textContent = username;
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

    // Redirect to edit profile page
    const editProfileButton = document.querySelector('button[data-modal-toggle="authentication-modal"]');
    editProfileButton.addEventListener('click', function() {
        window.location.href = '/html/profileEdit.html';
    });

    // Logout functionality
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', function() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        window.location.href = '/html/signIn/login.html';
    });

    // Load Footer
    fetch('/html/footer/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        });
});
