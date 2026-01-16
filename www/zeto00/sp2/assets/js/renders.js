import { searchResults, toast, workoutList } from './elements.js';

const WGER_BASE_URL = 'https://wger.de';

const sanitizeHtml = (str) => {
    if (!str) return '';
    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

const MUSCLE_GROUPS = [
    'Arms', 'Back', 'Chest', 'Legs', 'Shoulders', 'Abs', 'Calves', 'Cardio', 'Other'
];

const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    return `${WGER_BASE_URL}${imagePath}`;
};

export const renderSearchResults = (suggestions, onSelectCallback) => {
    searchResults.empty();
    
    if (!suggestions || suggestions.length === 0) {
        searchResults.append('<div class="no-results">No exercises found</div>');
        searchResults.addClass('active');
        return;
    }
    
    const fragment = $(document.createDocumentFragment());
    
    suggestions.forEach((suggestion) => {
        const { value, data } = suggestion;
        const { id, name, category, image, image_thumbnail } = data;
        
        const safeName = sanitizeHtml(name);
        const safeCategory = sanitizeHtml(category) || 'Uncategorized';
        
        const imageSrc = getFullImageUrl(image_thumbnail) || getFullImageUrl(image);
        const imageHtml = imageSrc 
            ? `<img class="result-image" src="${imageSrc}" alt="${safeName}" onerror="this.classList.add('hidden'); this.nextElementSibling.classList.remove('hidden');">
               <div class="result-image-placeholder hidden"><span>No Image</span></div>`
            : `<div class="result-image-placeholder"><span>No Image</span></div>`;
        
        const resultItem = $(`
            <div class="search-result-item" data-id="${id}">
                ${imageHtml}
                <div class="result-content">
                    <div class="result-name">${safeName}</div>
                    <div class="result-category">${safeCategory}</div>
                </div>
            </div>
        `);
        
        resultItem.on('click', () => {
            if (onSelectCallback) {
                onSelectCallback(data);
            }
            hideSearchResults();
        });
        
        fragment.append(resultItem);
    });
    
    searchResults.append(fragment);
    searchResults.addClass('active');
};

export const hideSearchResults = () => {
    searchResults.removeClass('active');
    searchResults.empty();
};

export const showToast = (message, type = 'info') => {
    toast.text(message);
    toast.removeClass('success error info');
    toast.addClass(type);
    toast.addClass('show');
    
    setTimeout(() => {
        toast.removeClass('show');
    }, 3000);
};

export const displayError = (message) => {
    showToast(message, 'error');
};

export const getUniqueDates = (workouts) => {
    const dates = [...new Set(workouts.map(w => w.date))];
    return dates.sort((a, b) => moment(b, 'YYYY-MM-DD').diff(moment(a, 'YYYY-MM-DD')));
};

export const getUniqueMuscleGroups = (workouts) => {
    return [...new Set(workouts.map(w => w.muscleGroup))].sort();
};

export const renderFilterDropdown = (items, onSelectCallback, formatFn = (item) => item) => {
    const dropdown = $('<div class="filter-dropdown"></div>');
    
    const fragment = $(document.createDocumentFragment());
    
    const allOption = $('<div class="filter-option" data-value="">All</div>');
    allOption.on('click', () => {
        onSelectCallback(null);
        dropdown.remove();
    });
    fragment.append(allOption);
    
    items.forEach(item => {
        const safeItem = sanitizeHtml(item);
        const safeFormatted = sanitizeHtml(formatFn(item));
        const option = $(`<div class="filter-option" data-value="${safeItem}">${safeFormatted}</div>`);
        option.on('click', () => {
            onSelectCallback(item);
            dropdown.remove();
        });
        fragment.append(option);
    });
    
    dropdown.append(fragment);
    return dropdown;
};

export const renderSearchLoading = () => {
    searchResults.empty();
    searchResults.append('<div class="no-results">Searching...</div>');
    searchResults.addClass('active');
};

export const renderExerciseForm = (exerciseData, onSubmitCallback, isEdit = false) => {
    const { id, name, category, sets: existingSets, date: existingDate, muscleGroups: existingMuscles, muscleGroup: legacyMuscle, note: existingNote, image, image_thumbnail } = exerciseData;
    
    const defaultDate = existingDate || moment().format('YYYY-MM-DD');
    let defaultMuscles = existingMuscles || [];
    if (defaultMuscles.length === 0 && legacyMuscle) {
        defaultMuscles = [legacyMuscle];
    }
    if (defaultMuscles.length === 0 && category) {
        const categoryMapping = {
            'Arms': 'Arms',
            'Back': 'Back',
            'Chest': 'Chest',
            'Legs': 'Legs',
            'Shoulders': 'Shoulders',
            'Abs': 'Abs',
            'Calves': 'Calves',
            'Cardio': 'Cardio'
        };
        const mappedCategory = categoryMapping[category] || category;
        if (MUSCLE_GROUPS.includes(mappedCategory)) {
            defaultMuscles = [mappedCategory];
        } else if (MUSCLE_GROUPS.includes(category)) {
            defaultMuscles = [category];
        }
    }
    const defaultSets = existingSets || [{ reps: '', weight: '' }];
    const defaultNote = existingNote || '';
    const exerciseImage = getFullImageUrl(image_thumbnail) || getFullImageUrl(image);
    
    const safeName = sanitizeHtml(name);
    const safeNote = sanitizeHtml(defaultNote);
    
    $('.modal-overlay').remove();
    
    const setsHtml = defaultSets.map((set, index) => createSetRowHtml(index + 1, set.reps, set.weight)).join('');
    
    const muscleOptions = MUSCLE_GROUPS.map(muscle => 
        `<option value="${muscle}">${muscle}</option>`
    ).join('');
    
    const selectedMusclesHtml = defaultMuscles.map(muscle => 
        createMuscleTagHtml(muscle)
    ).join('');
    
    const modal = $(`
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">${isEdit ? 'Edit' : 'Add'} Exercise</h2>
                    <button class="modal-close" type="button">&times;</button>
                </div>
                <form class="exercise-form" id="exerciseForm">
                    <div class="form-group">
                        <label class="form-label">Exercise Name <span class="required-mark">*</span></label>
                        <input type="text" class="form-input" name="exerciseName" value="${safeName}" readonly required>
                        <input type="hidden" name="exerciseImage" value="${exerciseImage || ''}">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Date <span class="required-mark">*</span></label>
                            <input type="date" class="form-input" name="date" value="${defaultDate}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Add Muscle Group</label>
                            <select class="form-input" id="muscleGroupSelect">
                                <option value="">Select...</option>
                                ${muscleOptions}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Selected Muscle Groups <span class="required-mark">*</span></label>
                        <div class="muscle-tags-container" id="muscleTagsContainer">
                            ${selectedMusclesHtml}
                        </div>
                        <p class="form-hint">At least one muscle group is required</p>
                    </div>
                    
                    <div class="sets-section">
                        <div class="sets-header">
                            <label class="form-label">Sets</label>
                            <button type="button" class="add-set-btn" id="addSetBtn">+ Add Set</button>
                        </div>
                        <div class="sets-container" id="setsContainer">
                            ${setsHtml}
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Note (optional)</label>
                        <textarea class="form-input form-textarea" name="note" placeholder="Add a short note..." rows="2">${safeNote}</textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
                        <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Save'} Workout</button>
                    </div>
                </form>
            </div>
        </div>
    `);
    
    $('body').append(modal);
    
    let setCount = defaultSets.length;
    
    modal.find('#addSetBtn').on('click', () => {
        setCount++;
        const newSetHtml = createSetRowHtml(setCount, '', '');
        modal.find('#setsContainer').append(newSetHtml);
        attachRemoveSetHandler(modal);
    });
    
    attachRemoveSetHandler(modal);
    
    modal.find('.modal-close, #cancelBtn').on('click', () => {
        modal.remove();
    });
    
    modal.on('click', (e) => {
        if ($(e.target).hasClass('modal-overlay')) {
            modal.remove();
        }
    });
    
    modal.find('#muscleGroupSelect').on('change', function() {
        const selectedMuscle = $(this).val();
        if (!selectedMuscle) return;
        
        const existingTags = modal.find('.muscle-tag').map(function() {
            return $(this).data('muscle');
        }).get();
        
        if (existingTags.includes(selectedMuscle)) {
            displayError('This muscle group is already added');
            $(this).val('');
            return;
        }
        
        const tagHtml = createMuscleTagHtml(selectedMuscle);
        modal.find('#muscleTagsContainer').append(tagHtml);
        attachRemoveMuscleTagHandler(modal);
        $(this).val('');
    });
    
    attachRemoveMuscleTagHandler(modal);
    
    modal.find('#exerciseForm').on('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const sets = [];
        
        modal.find('.set-row').each(function() {
            const reps = $(this).find('input[name="reps"]').val().trim();
            const weight = $(this).find('input[name="weight"]').val().trim();
            const repsNum = parseInt(reps) || 0;
            const weightNum = parseFloat(weight) || 0;
            
            if (repsNum > 0) {
                sets.push({
                    reps: repsNum,
                    weight: weightNum
                });
            }
        });
        
        if (sets.length === 0) {
            displayError('Please add at least one set with reps');
            return;
        }
        
        const muscleGroups = modal.find('.muscle-tag').map(function() {
            return $(this).data('muscle');
        }).get();
        
        if (muscleGroups.length === 0) {
            displayError('Please select at least one muscle group');
            return;
        }
        
        const workoutData = {
            exerciseId: id,
            name: formData.get('exerciseName'),
            date: formData.get('date'),
            muscleGroups: muscleGroups,
            muscleGroup: muscleGroups[0],
            sets: sets,
            note: formData.get('note')?.trim() || '',
            image: formData.get('exerciseImage') || null
        };
        
        modal.remove();
        
        if (onSubmitCallback) {
            onSubmitCallback(workoutData);
        }
    });
};

const createMuscleTagHtml = (muscle) => {
    const safeMuscle = sanitizeHtml(muscle);
    return `
        <span class="muscle-tag" data-muscle="${safeMuscle}">
            ${safeMuscle}
            <button type="button" class="remove-muscle-tag" title="Remove">&times;</button>
        </span>
    `;
};

const attachRemoveMuscleTagHandler = (modal) => {
    modal.find('.remove-muscle-tag').off('click').on('click', function() {
        const tags = modal.find('.muscle-tag');
        if (tags.length > 1) {
            $(this).closest('.muscle-tag').remove();
        } else {
            displayError('At least one muscle group is required');
        }
    });
};

const createSetRowHtml = (setNumber, reps = '', weight = '') => {
    return `
        <div class="set-row">
            <span class="set-number">${setNumber}</span>
            <div class="set-inputs">
                <input type="number" class="form-input set-input" name="reps" placeholder="Reps" value="${reps}" min="0" required>
                <input type="number" class="form-input set-input" name="weight" placeholder="Weight (kg)" value="${weight}" min="0" step="0.5" required>
            </div>
            <button type="button" class="remove-set-btn" title="Remove set">&times;</button>
        </div>
    `;
};

const attachRemoveSetHandler = (modal) => {
    modal.find('.remove-set-btn').off('click').on('click', function() {
        const setRows = modal.find('.set-row');
        if (setRows.length > 1) {
            $(this).closest('.set-row').remove();
            modal.find('.set-row').each(function(index) {
                $(this).find('.set-number').text(index + 1);
            });
        } else {
            displayError('You need at least one set');
        }
    });
};

const PAGINATION = {
    MAX_DAYS_PER_PAGE: 3
};

export const renderWorkoutList = (workouts, onEditCallback, onDeleteCallback, filters = {}, currentPage = 1, onPageChange = null) => {
    workoutList.empty();
    
    if (!workouts || workouts.length === 0) {
        workoutList.html(`
            <div class="empty-state">
                <p>No workouts yet</p>
                <p class="empty-hint">Search for an exercise above to get started!</p>
            </div>
        `);
        return;
    }
    
    let filteredWorkouts = [...workouts];
    
    if (filters.date) {
        filteredWorkouts = filteredWorkouts.filter(w => w.date === filters.date);
    }
    
    if (filters.muscleGroup) {
        filteredWorkouts = filteredWorkouts.filter(w => w.muscleGroup === filters.muscleGroup);
    }
    
    if (filteredWorkouts.length === 0) {
        workoutList.html(`
            <div class="empty-state">
                <p>No workouts match your filters</p>
                <p class="empty-hint">Try adjusting your filter criteria</p>
            </div>
        `);
        return { totalPages: 0, currentPage: 1 };
    }
    
    const groupedWorkouts = {};
    filteredWorkouts.forEach(workout => {
        const date = workout.date;
        if (!groupedWorkouts[date]) {
            groupedWorkouts[date] = [];
        }
        groupedWorkouts[date].push(workout);
    });
    
    const sortedDates = Object.keys(groupedWorkouts).sort((a, b) => {
        return moment(b, 'YYYY-MM-DD').diff(moment(a, 'YYYY-MM-DD'));
    });
    
    const paginatedData = paginateWorkouts(sortedDates, groupedWorkouts, currentPage);
    const { pageDates, pageWorkouts, totalPages, totalExercises } = paginatedData;
    
    const mainFragment = $(document.createDocumentFragment());
    
    pageDates.forEach(date => {
        const dateWorkouts = pageWorkouts[date];
        const formattedDate = moment(date, 'YYYY-MM-DD').format('dddd, MMMM D, YYYY');
        const isToday = moment(date, 'YYYY-MM-DD').isSame(moment(), 'day');
        const dateLabel = isToday ? 'Today' : formattedDate;
        
        const dateGroup = $(`
            <div class="date-group">
                <h3 class="date-header">${dateLabel}</h3>
                <div class="workout-cards"></div>
            </div>
        `);
        
        const cardsContainer = dateGroup.find('.workout-cards');
        const cardsFragment = $(document.createDocumentFragment());
        
        dateWorkouts.forEach(workout => {
            const sets = Array.isArray(workout.sets) ? workout.sets : [];
            const totalVolume = sets.reduce((sum, set) => sum + (set.reps * set.weight), 0);
            const setsDisplay = sets.map((set, i) => 
                `<span class="set-badge">${set.reps}×${set.weight}kg</span>`
            ).join('');
            
            const safeNote = sanitizeHtml(workout.note);
            const safeName = sanitizeHtml(workout.name);
            const noteHtml = safeNote ? `<div class="workout-note">${safeNote}</div>` : '';
            const workoutImageSrc = getFullImageUrl(workout.image);
            const workoutImageHtml = workoutImageSrc 
                ? `<div class="workout-image">
                    <img src="${workoutImageSrc}" alt="${safeName}" onerror="this.classList.add('hidden'); this.nextElementSibling.classList.remove('hidden');">
                    <div class="workout-image-placeholder hidden"><span>N/A</span></div>
                   </div>`
                : `<div class="workout-image"><div class="workout-image-placeholder"><span>N/A</span></div></div>`;
            
            const muscleGroupsArray = workout.muscleGroups || (workout.muscleGroup ? [workout.muscleGroup] : []);
            const muscleGroupsHtml = muscleGroupsArray.map(mg => 
                `<span class="workout-muscle">${sanitizeHtml(mg)}</span>`
            ).join('');
            
            const workoutCard = $(`
                <div class="workout-card" data-id="${workout.id}">
                    <div class="workout-card-header">
                        ${workoutImageHtml}
                        <div class="workout-info">
                            <h4 class="workout-name">${safeName}</h4>
                            <div class="workout-muscles">${muscleGroupsHtml}</div>
                        </div>
                        <div class="workout-actions">
                            <button class="action-btn edit-btn" title="Edit"><img src="assets/img/edit.png" alt="Edit"></button>
                            <button class="action-btn delete-btn" title="Delete"><img src="assets/img/delete.png" alt="Delete"></button>
                        </div>
                    </div>
                    ${noteHtml}
                    <div class="workout-sets">
                        ${setsDisplay}
                    </div>
                    <div class="workout-stats">
                        <span class="stat">${sets.length} sets</span>
                        <span class="stat">${totalVolume.toFixed(1)} kg total volume</span>
                    </div>
                </div>
            `);
            
            workoutCard.find('.edit-btn').on('click', () => {
                if (onEditCallback) {
                    onEditCallback(workout.id);
                }
            });
            
            workoutCard.find('.delete-btn').on('click', () => {
                if (onDeleteCallback) {
                    onDeleteCallback(workout.id);
                }
            });
            
            cardsFragment.append(workoutCard);
        });
        
        cardsContainer.append(cardsFragment);
        mainFragment.append(dateGroup);
    });
    
    workoutList.append(mainFragment);
    
    if (totalPages > 1 && onPageChange) {
        const paginationHtml = renderPaginationControls(currentPage, totalPages, totalExercises);
        workoutList.append(paginationHtml);
        
        workoutList.find('.pagination-btn').on('click', function() {
            const page = $(this).data('page');
            if (page && page !== currentPage) {
                onPageChange(page);
            }
        });
    }
    
    return { totalPages, currentPage };
};

const paginateWorkouts = (sortedDates, groupedWorkouts, currentPage) => {
    const pages = [];
    
    for (let i = 0; i < sortedDates.length; i += PAGINATION.MAX_DAYS_PER_PAGE) {
        const pageDates = sortedDates.slice(i, i + PAGINATION.MAX_DAYS_PER_PAGE);
        const pageWorkouts = {};
        let exerciseCount = 0;
        
        for (const date of pageDates) {
            pageWorkouts[date] = groupedWorkouts[date];
            exerciseCount += groupedWorkouts[date].length;
        }
        
        pages.push({ dates: pageDates, workouts: pageWorkouts, exerciseCount });
    }
    
    const totalPages = pages.length;
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
    const pageData = pages[safeCurrentPage - 1] || { dates: [], workouts: {}, exerciseCount: 0 };
    
    let totalExercises = 0;
    for (const date of sortedDates) {
        totalExercises += groupedWorkouts[date].length;
    }
    
    return {
        pageDates: pageData.dates,
        pageWorkouts: pageData.workouts,
        totalPages,
        currentPage: safeCurrentPage,
        totalExercises
    };
};

export const findPageForDate = (workouts, targetDate, filters = {}) => {
    if (!workouts || workouts.length === 0) return 1;
    
    let filteredWorkouts = [...workouts];
    
    if (filters.date) {
        filteredWorkouts = filteredWorkouts.filter(w => w.date === filters.date);
    }
    
    if (filters.muscleGroup) {
        filteredWorkouts = filteredWorkouts.filter(w => w.muscleGroup === filters.muscleGroup);
    }
    
    if (filteredWorkouts.length === 0) return 1;
    
    const groupedWorkouts = {};
    filteredWorkouts.forEach(workout => {
        const date = workout.date;
        if (!groupedWorkouts[date]) {
            groupedWorkouts[date] = [];
        }
        groupedWorkouts[date].push(workout);
    });
    
    const sortedDates = Object.keys(groupedWorkouts).sort((a, b) => {
        return moment(b, 'YYYY-MM-DD').diff(moment(a, 'YYYY-MM-DD'));
    });
    
    const dateIndex = sortedDates.indexOf(targetDate);
    if (dateIndex === -1) return 1;
    
    return Math.floor(dateIndex / PAGINATION.MAX_DAYS_PER_PAGE) + 1;
};

const renderPaginationControls = (currentPage, totalPages, totalExercises) => {
    let paginationButtons = '';
    
    paginationButtons += `
        <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
                data-page="${currentPage - 1}" 
                ${currentPage === 1 ? 'disabled' : ''}>
            ← Prev
        </button>
    `;
    
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        paginationButtons += `<button class="pagination-btn" data-page="1">1</button>`;
        if (startPage > 2) {
            paginationButtons += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationButtons += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationButtons += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationButtons += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`;
    }
    
    paginationButtons += `
        <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                data-page="${currentPage + 1}"
                ${currentPage === totalPages ? 'disabled' : ''}>
            Next →
        </button>
    `;
    
    return $(`
        <div class="pagination-container">
            <div class="pagination-info">${totalExercises} exercises total</div>
            <div class="pagination-controls">
                ${paginationButtons}
            </div>
        </div>
    `);
};

let dateCalendarInstance = null;

export const destroyDateCalendar = () => {
    if (dateCalendarInstance) {
        dateCalendarInstance.destroy();
        dateCalendarInstance = null;
    }
    $('.calendar-dropdown').remove();
};

export const renderDateCalendar = (targetBtn, workoutDates, currentSelectedDate, onSelectCallback) => {
    destroyDateCalendar();
    $('.filter-dropdown').remove();
    
    const dropdown = $(`
        <div class="calendar-dropdown">
            <div class="calendar-header">
                <button type="button" class="calendar-clear-btn">Clear Filter</button>
            </div>
            <div class="calendar-container"></div>
        </div>
    `);
    
    targetBtn.parent().css('position', 'relative').append(dropdown);
    
    const calendarContainer = dropdown.find('.calendar-container')[0];
    
    dateCalendarInstance = flatpickr(calendarContainer, {
        inline: true,
        dateFormat: 'Y-m-d',
        defaultDate: currentSelectedDate || null,
        onDayCreate: function(dObj, dStr, fp, dayElem) {
            const year = dayElem.dateObj.getFullYear();
            const month = String(dayElem.dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dayElem.dateObj.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            if (workoutDates.includes(dateStr)) {
                dayElem.style.backgroundColor = '#e0e0e0';
                dayElem.style.borderRadius = '4px';
                dayElem.style.color = '#333';
            }
        },
        onChange: function(selectedDates, dateStr) {
            if (dateStr) {
                onSelectCallback(dateStr);
                destroyDateCalendar();
            }
        }
    });
    
    dropdown.find('.calendar-clear-btn').on('click', () => {
        onSelectCallback(null);
        destroyDateCalendar();
    });
    
    $(document).on('click.calendarDropdown', (e) => {
        if (!$(e.target).closest('.calendar-dropdown, .filter-btn').length) {
            destroyDateCalendar();
            $(document).off('click.calendarDropdown');
        }
    });
};
