$(document).ready(function () {
    console.log('started :)');
    checkAuth();

    $('#loginBtn').on('click', function () {
        login();
    });

    $('#loadActivitiesBtn').on('click', function () {
        loadActivities();
    });
});

function checkAuth() {
    const token = localStorage.getItem('strava_token');
    const athlete = localStorage.getItem('strava_athlete');

    if (token && athlete) {
        $('#statusText').hide()

        $('#loginBtn').text('Logout').off('click').on('click', logout);

        $('#athleteData').text(JSON.stringify(JSON.parse(athlete), null, 2));
        $('#athleteInfo').show();

        $('#activitiesSection').show();
    } else {
        $('#statusText').text("Login to your strava account to continue");
        $('#statusText').show();

        $('#athleteInfo').hide();

        $('#activitiesSection').hide();
    }
}

function login() {
    console.log('Loggggging in');
    // 'mayo-for-strava.vercel.app/api/auth-redirect'
    // `${window.location.origin}/api/auth-redirect`
    window.location.href = 'mayo-for-strava.vercel.app/api/auth-redirect';
}

function logout() {
    // Redirectuje ked by nemal
    console.log('Loggggging out');

    localStorage.removeItem('strava_token');
    localStorage.removeItem('strava_refresh_token');
    localStorage.removeItem('strava_expires_at');
    localStorage.removeItem('strava_athlete');

    location.reload();
}

async function loadActivities() {
    const token = localStorage.getItem('strava_token');
    try {
        const response = await fetch('https://www.strava.com/api/v3/athlete/activities? per_page=10', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const activities = await response.json();
        displayActivities(activities);
    } catch (error) {
        console.error('Error loading activities:', error);
    }
}

function displayActivities(activities) {
    const $list = $('#activitiesList');
    $list.empty();

    const $table = $('<table class="table table-striped"></table>');
    $table.append(`
        <thead>
            <tr>
                <th>Activity</th>
                <th>Type</th>
                <th>Date</th>
                <th>Distance</th>
                <th>Map object</th>
            </tr>
        </thead>
    `);
    const $tbody = $('<tbody></tbody>');
    activities.forEach(activity => {
        $tbody.append(`
            <tr>
                <td>${activity.name}</td>
                <td>${activity.type}</td>
                <td>${activity.start_date}</td>
                <td>${(activity.distance / 1000).toFixed(2) + ' km'}</td>
                <td>${activity.map}</td>
            </tr>
        `);
    });

    $table.append($tbody);
    $list.append($table);
}
