const App = (() => {
    const state = {
        profilePage: 0,
        currentPage: null,
        allActivities: [],
        filteredActivities: [],
        selectedActivityIds: new Set(),
        filters: {
            types: [],
            dateRange: {start: null, end: null},
            distanceRange: {min: 0, max: Infinity}
        }
    };

    const $profileBtn = $('#profileBtn');
    const $activitiesBtn =  $('#activitiesBtn');
    const $loginBtn = $('#loginBtn');
    // const $loadActivitiesBtn = $('#loadActivitiesBtn');
    const $loadMoreBtn = $('#loadMoreBtn');

    const $statusText = $('#statusText');
    const $sections = $('#profileSection, #activitiesSection');
    const $activitiesSection = $('#activitiesSection');
    const $profileSection = $('#profileSection');
    const $activitiesTableBody = $('#activitiesTableBody');

    const $activityTypeFilters = $('#activityTypeFilters');
    const $minDistanceFilter = $('#minDistanceFilter');
    const $maxDistanceFilter = $('#maxDistanceFilter');
    const $dateRangeFromFilter = $('#dateRangeFromFilter');
    const $dateRangeToFilter = $('#dateRangeToFilter');
    const $resetFiltersBtn = $('#resetFiltersBtn');
    const $unselectAllBtn = $('#unselectAllBtn');

    async function init() {
        $profileBtn.on('click', togglePages);
        $activitiesBtn.on('click', togglePages);
        $loginBtn.on('click', handleLoginLogout);
        // $loadActivitiesBtn.on('click', handleLoadActivities);
        $loadMoreBtn.on('click', handleLoadMoreActivities)

        $dateRangeFromFilter.on('change', handleFilterChange);
        $dateRangeToFilter.on('change', handleFilterChange);
        $minDistanceFilter.on('change', handleFilterChange);
        $maxDistanceFilter.on('change', handleFilterChange);
        $(document).on('change', '.activity-type-checkbox', handleFilterChange);
        $(document).on('change', '.activity-row-checkbox', handleActivitySelection);
        $resetFiltersBtn.on('click', resetFilters);
        $unselectAllBtn.on('click', unselectAllActivities);

        await checkAuthAndInitialize();
    }

    async function checkAuthAndInitialize() {
        if (StravaAPI.isAuthenticated()) {
            updateUIForLoggedIn();
            displayAthleteProfile();

            MapController.init('profileMap');

            // const cachedActivities = JSON.parse(localStorage.getItem('cached_activities'));
            // if (cachedActivities) {
            //     state.allActivities = cachedActivities;
            //     state.selectedActivityIds = new Set(cachedActivities.map(a => a.id));
            //     displayActivitiesTable(cachedActivities);
            //     displayProfileHeatmap();
            // } else {
                await handleLoadMoreActivities();
            // }
        } else {
            updateUIForLoggedOut();
        }
    }

    function updateUIForLoggedIn() {
        $statusText.hide();
        $loginBtn.text('Logout').off('click').on('click', handleLogout);
        // $loadActivitiesBtn.show();
        $sections.removeClass('d-none');
    }

    function updateUIForLoggedOut() {
        $statusText.show();
        $loginBtn.text('Login to Strava').off('click').on('click', handleLogin);
        // $loadActivitiesBtn.hide();
        $sections.addClass('d-none');
    }

    function displayAthleteProfile() {
        const athlete = StravaAPI.getAthlete();
        if (!athlete) return;

        $('#athleteName').text(`${athlete.firstname} ${athlete.lastname}`);
        $('#athleteLocation').text(athlete.city ? `${athlete.city}, ${athlete.state}` : 'N/A');
        $('#athleteProfile').attr('src', athlete.profile);
        $('#athleteBio').text(athlete.bio || 'N/A');
        $('#athleteSex').text(athlete.sex || 'N/A');
        $('#athleteWeight').text(athlete.weight ? `${athlete.weight} kg` : 'N/A');
        $('#athleteCreated').text(new Date(athlete.created_at).toLocaleDateString());
        $('#athleteUpdated').text(new Date(athlete.updated_at).toLocaleDateString());
    }

    function togglePages() {
        if (state.profilePage) {
            $activitiesBtn.removeClass('btn-outline-secondary').addClass('btn-success');
            $profileBtn.removeClass('btn-success').addClass('btn-outline-secondary');
            $activitiesSection.show();
            $profileSection .hide();

            MapController.moveToContainer('activitiesMap');
            applyFilters();

            state.profilePage = false;
        } else {
            $profileBtn.removeClass('btn-outline-secondary').addClass('btn-success');
            $activitiesBtn.removeClass('btn-success').addClass('btn-outline-secondary');
            $profileSection .show();
            $activitiesSection.hide();

            MapController.moveToContainer('profileMap');
            setTimeout(() => {
                displayProfileHeatmap();
            }, 0);

            state.profilePage = true;
        }
    }

    function handleLogin() {
        $loginBtn.html('<span class="spinner-border spinner-border-sm"></span> Logging in...');
        window.location.href = `${location.origin}/api/auth-redirect`;
    }

    async function handleLogout() {
        $loginBtn.html('<span class="spinner-border spinner-border-sm"></span> Logging out...');
        await StravaAPI.deauthorize(); // Deauthorizacia na strane stravy
        localStorage.clear();
        location.reload();
    }

    function handleLoginLogout() {
        if (StravaAPI.isAuthenticated()) {
            handleLogout();
        } else {
            handleLogin();
        }
    }

    async function handleLoadMoreActivities(e, num = 50) {
        const $btn = $loadMoreBtn;
        showLoadingState($btn);

        const newActivities = await StravaAPI.fetchActivities(num, state.currentPage + 1);
        if (newActivities.length > 0) state.currentPage += 1;
        console.log(state.currentPage)
        state.allActivities.push(...newActivities);

        newActivities.forEach(a => state.selectedActivityIds.add(a.id));
        displayActivitiesTable(newActivities);
        displayProfileHeatmap();
        applyFilters();

        hideLoadingState($btn, 'Load 50 more');
    }


    // async function handleLoadActivities() {
    //     const $btn = $loadActivitiesBtn;
    //     showLoadingState($btn);
    //
    //     try {
    //         const activities = await StravaAPI.fetchAllActivities(200);
    //         state.allActivities = activities;
    //         state.selectedActivityIds = new Set(activities.map(a => a.id));
    //
    //         localStorage.setItem('cached_activities', JSON.stringify(activities));
    //
    //         displayActivitiesTable(activities);
    //         displayProfileHeatmap();
    //     } catch (error) {
    //         console.error(error);
    //     } finally {
    //         hideLoadingState($btn, 'Load activities');
    //     }
    // }

    function displayActivitiesTable(activities) {
        const types = [...new Set(activities.map(a => a.type))].sort();
        const typeFilters = types.map(type =>
            `<div class="form-check">
                <input class="form-check-input activity-type-checkbox" type="checkbox" value="${type}" id="type_${type}" checked>
                <label class="form-check-label" for="type_${type}">${type}</label>
            </div>`
        ).join('');
        $activityTypeFilters.html(typeFilters);

        const maxDistance = Math.ceil(Math.max(...activities.map(a => a.distance / 1000)));
        $maxDistanceFilter.val(maxDistance);

        renderActivitiesTableRows(activities);
    }

    function renderActivityDetail(activity) {
        const detailHtml = `
            <p class="badge" style="background-color: ${MapController.getColorForActivityType(activity.type)}">${activity.type}</p>
            <h3>${activity.name}</h3>
            <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                ${activity.kudos_count}
            </span>
            <p class="small">ID: ${activity.id}</p>
            <ul class="list-group">
                <li class="list-unstyled mb-2"><strong>${new Date(activity.start_date).toLocaleDateString()}</strong></li>
                <li class="list-unstyled">Distance: ${(activity.distance / 1000).toFixed(2)}</li>
                <li class="list-unstyled mb-2">Elevation gain: ${activity.total_elevation_gain}</li>
                <li class="list-unstyled">Average speed: ${activity.average_speed}</li>
                <li class="list-unstyled mb-2">Max speed: ${activity.max_speed}</li>
                <li class="list-unstyled">Moving time: ${Math.round(activity.moving_time / 6) / 10} minutes</li>
                <li class="list-unstyled mb-2">Elapsed time: ${Math.round(activity.elapsed_time / 6) / 10} minutes</li>
                <li class="list-unstyled">Heartrate: ${activity.average_heartrate ? average_heartrate : 'Not recorded'}</li>
                <li class="list-unstyled">Watts: ${activity.average_watts ? activity.average_watts : 'Not recorded'}</li>
            </ul>
        `;

        $('#activityDetailContainer').html(detailHtml);
    }

    function renderActivitiesTableRows(activities) {
        const $rows = activities.map(activity => {
            const $activity = $(`
                <tr data-activity-id="${activity.id}" class="activity-row">
                    <td>
                        <input type="checkbox" class="form-check-input activity-row-checkbox" 
                               value="${activity.id}" checked>
                    </td>
                    <td>${activity.name}</td>
                    <td><span class="badge" style="background-color: ${MapController.getColorForActivityType(activity.type)}">${activity.type}</span></td>
                    <td>${new Date(activity.start_date).toLocaleDateString()}</td>
                    <td>${(activity.distance / 1000).toFixed(2)}</td>
                </tr>
            `);

            $activity.on('click', e => {
                if (!$(e.target).is('input[type="checkbox"]')) renderActivityDetail(activity);
            });

            return $activity;
        });

        $activitiesTableBody.append($rows);
    }

    function displayProfileHeatmap() {
        if (state.profilePage && state.allActivities.length > 0) {
            const activitiesWithMap = state.allActivities.filter(a => a.map?.summary_polyline);
            MapController.drawActivities(activitiesWithMap);
        }
    }

    function handleFilterChange() {
        state.filters.types = $('.activity-type-checkbox:checked').map((_, element) => element.value).get();

        const dateFrom = $dateRangeFromFilter.val();
        const dateTo = $dateRangeToFilter.val();
        state.filters.dateRange = {start: dateFrom ? new Date(dateFrom) : null, end: dateTo ? new Date(dateTo) : null};

        const minDistance = Number($minDistanceFilter.val() || 0);
        const maxDistance = Number($maxDistanceFilter.val() || Infinity);
        state.filters.distanceRange = {min: minDistance, max: maxDistance};

        applyFilters();
    }

    function handleActivitySelection() {
        state.selectedActivityIds = new Set(
            $('.activity-row-checkbox:checked').map((_, element) => Number(element.value)).get()
        );
        applyFilters();
    }

    function applyFilters() {
        const {allActivities, filters} = state;

        state.filteredActivities = allActivities.filter(activity => {
            if (filters.types.length > 0 && !filters.types.includes(activity.type)) {
                return false;
            }

            const activityDate = new Date(activity.start_date);
            if (filters.dateRange.start && activityDate < filters.dateRange.start) {
                return false;
            }
            if (filters.dateRange.end) {
                const lastDate = new Date(filters.dateRange.end);
                if (activityDate > lastDate) {
                    return false;
                }
            }

            const distanceKm = activity.distance / 1000;
            if (distanceKm < filters.distanceRange.min || distanceKm > filters.distanceRange.max) {
                return false;
            }
            return true;
        });

        updateCheckboxStates();

        const mapActivities = state.filteredActivities.filter(activity => {
            return state.selectedActivityIds.has(activity.id) && activity.map?.summary_polyline;
        });
        MapController.drawActivities(mapActivities);
    }

    function updateCheckboxStates() {
        const filteredIds = new Set(state.filteredActivities.map(a => a.id));

        state.allActivities.forEach(activity => {
            const $checkbox = $(`.activity-row-checkbox[value="${activity.id}"]`);

            const $row = $checkbox.closest('tr');
            $row.toggle(filteredIds.has(activity.id));

            $checkbox.prop(
                'checked',
                state.selectedActivityIds.has(activity.id)
            );
        });
    }

    function resetFilters() {
        $('.activity-type-checkbox').prop('checked', true);
        $dateRangeFromFilter.val('');
        $dateRangeToFilter.val('');
        $minDistanceFilter.val('0');
        const maxDistance = Math.ceil(Math.max(...state.allActivities.map(a => a.distance / 1000)));
        $maxDistanceFilter.val(maxDistance);

        state.filters = {
            types: [],
            dateRange: {start: null, end: null},
            distanceRange: {min: 0, max: Infinity}
        };

        state.selectedActivityIds = new Set(state.allActivities.map(a => a.id));
        $('.activity-row-checkbox').prop('checked', true);
        applyFilters();
    }

    function unselectAllActivities() {
        $('.activity-row-checkbox').each((_, element) => {
            $(element).prop('checked', false);
        });
        state.selectedActivityIds.clear();
        applyFilters();
    }

    function showLoadingState($btn) {
        $btn.data('original-html', $btn.html());
        $btn.html('<span class="spinner-border spinner-border-sm"></span> Loading...');
        $btn.prop('disabled', true);
    }

    function hideLoadingState($btn, text) {
        $btn.html($btn.data('original-html') || text);
        $btn.prop('disabled', false);
    }

    return {
        init
    };
})();

$(document).ready(() => App.init());
