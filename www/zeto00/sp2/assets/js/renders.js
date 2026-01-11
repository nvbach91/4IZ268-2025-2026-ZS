import { searchResults, toast, workoutList } from './elements.js';

const MUSCLE_GROUPS = [
    'Arms', 'Back', 'Chest', 'Legs', 'Shoulders', 'Abs', 'Calves', 'Cardio', 'Other'
];

export const renderSearchResults = (suggestions, onSelectCallback) => {
    searchResults.empty();
    
    if (!suggestions || suggestions.length === 0) {
        searchResults.append('<div class="no-results">No exercises found</div>');
        searchResults.addClass('active');
        return;
    }
    
    suggestions.forEach((suggestion) => {
        const { value, data } = suggestion;
        const { id, name, category, image, image_thumbnail } = data;
        
        const resultItem = $(`
            <div class="search-result-item" data-id="${id}">
                <div class="result-name">${name}</div>
                <div class="result-category">${category || 'Uncategorized'}</div>
            </div>
        `);
        
        resultItem.on('click', () => {
            if (onSelectCallback) {
                onSelectCallback(data);
            }
            hideSearchResults();
        });
        
        searchResults.append(resultItem);
    });
    
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
    
    const allOption = $('<div class="filter-option" data-value="">All</div>');
    allOption.on('click', () => {
        onSelectCallback(null);
        dropdown.remove();
    });
    dropdown.append(allOption);
    
    items.forEach(item => {
        const option = $(`<div class="filter-option" data-value="${item}">${formatFn(item)}</div>`);
        option.on('click', () => {
            onSelectCallback(item);
            dropdown.remove();
        });
        dropdown.append(option);
    });
    
    return dropdown;
};

export const renderSearchLoading = () => {
    searchResults.empty();
    searchResults.append('<div class="no-results">Searching...</div>');
    searchResults.addClass('active');
};

export const renderExerciseForm = (exerciseData, onSubmitCallback, isEdit = false) => {
    const { id, name, category, sets: existingSets, date: existingDate, muscleGroup: existingMuscle, note: existingNote } = exerciseData;
    
    const defaultDate = existingDate || moment().format('YYYY-MM-DD');
    const defaultMuscle = existingMuscle || category || 'Other';
    const defaultSets = existingSets || [{ reps: '', weight: '' }];
    const defaultNote = existingNote || '';
    
    $('.modal-overlay').remove();
    
    const setsHtml = defaultSets.map((set, index) => createSetRowHtml(index + 1, set.reps, set.weight)).join('');
    
    const muscleOptions = MUSCLE_GROUPS.map(muscle => 
        `<option value="${muscle}" ${muscle === defaultMuscle ? 'selected' : ''}>${muscle}</option>`
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
                        <label class="form-label">Exercise Name</label>
                        <input type="text" class="form-input" name="exerciseName" value="${name}" readonly>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Date</label>
                            <input type="date" class="form-input" name="date" value="${defaultDate}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Muscle Group</label>
                            <select class="form-input" name="muscleGroup" required>
                                ${muscleOptions}
                            </select>
                        </div>
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
                        <textarea class="form-input form-textarea" name="note" placeholder="Add a short note..." rows="2">${defaultNote}</textarea>
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
    
    modal.find('#exerciseForm').on('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const sets = [];
        
        modal.find('.set-row').each(function() {
            const reps = $(this).find('input[name="reps"]').val();
            const weight = $(this).find('input[name="weight"]').val();
            if (reps || weight) {
                sets.push({
                    reps: parseInt(reps) || 0,
                    weight: parseFloat(weight) || 0
                });
            }
        });
        
        if (sets.length === 0) {
            displayError('Please add at least one set');
            return;
        }
        
        const workoutData = {
            exerciseId: id,
            name: formData.get('exerciseName'),
            date: formData.get('date'),
            muscleGroup: formData.get('muscleGroup'),
            sets: sets,
            note: formData.get('note')?.trim() || ''
        };
        
        modal.remove();
        
        if (onSubmitCallback) {
            onSubmitCallback(workoutData);
        }
    });
};

const createSetRowHtml = (setNumber, reps = '', weight = '') => {
    return `
        <div class="set-row">
            <span class="set-number">${setNumber}</span>
            <div class="set-inputs">
                <input type="number" class="form-input set-input" name="reps" placeholder="Reps" value="${reps}" min="0">
                <input type="number" class="form-input set-input" name="weight" placeholder="Weight (kg)" value="${weight}" min="0" step="0.5">
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
            // Renumber sets
            modal.find('.set-row').each(function(index) {
                $(this).find('.set-number').text(index + 1);
            });
        } else {
            displayError('You need at least one set');
        }
    });
};

export const renderWorkoutList = (workouts, onEditCallback, onDeleteCallback, filters = {}) => {
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
        return;
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
    
    sortedDates.forEach(date => {
        const dateWorkouts = groupedWorkouts[date];
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
        
        dateWorkouts.forEach(workout => {
            const sets = Array.isArray(workout.sets) ? workout.sets : [];
            const totalVolume = sets.reduce((sum, set) => sum + (set.reps * set.weight), 0);
            const setsDisplay = sets.map((set, i) => 
                `<span class="set-badge">${set.reps}×${set.weight}kg</span>`
            ).join('');
            
            const noteHtml = workout.note ? `<div class="workout-note">${workout.note}</div>` : '';
            
            const workoutCard = $(`
                <div class="workout-card" data-id="${workout.id}">
                    <div class="workout-card-header">
                        <div class="workout-info">
                            <h4 class="workout-name">${workout.name}</h4>
                            <span class="workout-muscle">${workout.muscleGroup}</span>
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
            
            // Edit handler
            workoutCard.find('.edit-btn').on('click', () => {
                if (onEditCallback) {
                    onEditCallback(workout.id);
                }
            });
            
            // Delete handler
            workoutCard.find('.delete-btn').on('click', () => {
                if (onDeleteCallback) {
                    onDeleteCallback(workout.id);
                }
            });
            
            cardsContainer.append(workoutCard);
        });
        
        workoutList.append(dateGroup);
    });
};
