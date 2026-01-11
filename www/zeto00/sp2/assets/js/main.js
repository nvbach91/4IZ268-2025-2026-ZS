import { searchInput, searchResults, workoutList, dateFilterBtn, muscleFilterBtn, dateFilterText, muscleFilterText } from './elements.js';
import { searchExercises } from './network.js';
import { 
    renderSearchResults, 
    hideSearchResults, 
    displayError, 
    renderSearchLoading,
    renderExerciseForm,
    renderWorkoutList,
    getUniqueDates,
    getUniqueMuscleGroups,
    renderFilterDropdown
} from './renders.js';
import {
    getWorkouts,
    saveWorkout,
    updateWorkout,
    deleteWorkout
} from './storage.js';

let searchTimeout = null;
const DEBOUNCE_DELAY = 300;

let activeFilters = {
    date: null,
    muscleGroup: null
};

const refreshWorkoutList = () => {
    renderWorkoutList(getWorkouts(), handleEditWorkout, handleDeleteWorkout, activeFilters);
};

$(document).ready(() => {
    refreshWorkoutList();
    
    dateFilterBtn.on('click', (e) => {
        e.stopPropagation();
        $('.filter-dropdown').remove();
        
        const workouts = getWorkouts();
        const dates = getUniqueDates(workouts);
        
        if (dates.length === 0) {
            displayError('No workouts to filter');
            return;
        }
        
        const dropdown = renderFilterDropdown(dates, (selectedDate) => {
            activeFilters.date = selectedDate;
            dateFilterText.text(selectedDate ? moment(selectedDate, 'YYYY-MM-DD').format('MMM D, YYYY') : 'Date');
            dateFilterBtn.toggleClass('active', !!selectedDate);
            refreshWorkoutList();
        }, (date) => moment(date, 'YYYY-MM-DD').format('MMM D, YYYY'));
        
        dateFilterBtn.parent().css('position', 'relative').append(dropdown);
    });
    
    muscleFilterBtn.on('click', (e) => {
        e.stopPropagation();
        $('.filter-dropdown').remove();
        
        const workouts = getWorkouts();
        const muscles = getUniqueMuscleGroups(workouts);
        
        if (muscles.length === 0) {
            displayError('No workouts to filter');
            return;
        }
        
        const dropdown = renderFilterDropdown(muscles, (selectedMuscle) => {
            activeFilters.muscleGroup = selectedMuscle;
            muscleFilterText.text(selectedMuscle || 'Muscle Group');
            muscleFilterBtn.toggleClass('active', !!selectedMuscle);
            refreshWorkoutList();
        });
        
        muscleFilterBtn.parent().css('position', 'relative').append(dropdown);
    });
    
    $(document).on('click', (e) => {
        if (!$(e.target).closest('.filter-btn').length) {
            $('.filter-dropdown').remove();
        }
    });
});

searchInput.on('input', function() {
    const term = $(this).val().trim();
    
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    if (term.length < 2) {
        hideSearchResults();
        return;
    }
    
    renderSearchLoading();
    
    searchTimeout = setTimeout(async () => {
        try {
            const response = await searchExercises(term);
            renderSearchResults(response.suggestions, handleExerciseSelect);
        } catch (error) {
            displayError('Failed to search exercises. Please try again.');
            hideSearchResults();
        }
    }, DEBOUNCE_DELAY);
});

const handleExerciseSelect = (exerciseData) => {
    const { id, name, category } = exerciseData;
    
    searchInput.val('');
    
    renderExerciseForm(exerciseData, handleFormSubmit);
};

const handleFormSubmit = (workoutData) => {
    saveWorkout(workoutData);
    refreshWorkoutList();
};

const handleEditWorkout = (workoutId) => {
    const workouts = getWorkouts();
    const workout = workouts.find(w => w.id === workoutId);
    
    if (workout) {
        renderExerciseForm(workout, (updatedData) => {
            updateWorkout(workoutId, updatedData);
            refreshWorkoutList();
        }, true);
    }
};

const handleDeleteWorkout = (workoutId) => {
    if (confirm('Are you sure you want to delete this workout?')) {
        deleteWorkout(workoutId);
        refreshWorkoutList();
    }
};

$(document).on('click', function(event) {
    if (!$(event.target).closest('.search-wrapper').length) {
        hideSearchResults();
    }
});

searchInput.on('keydown', function(event) {
    const items = searchResults.find('.search-result-item');
    const activeItem = searchResults.find('.search-result-item.active');
    
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (activeItem.length === 0) {
            items.first().addClass('active');
        } else {
            activeItem.removeClass('active');
            const nextItem = activeItem.next('.search-result-item');
            if (nextItem.length) {
                nextItem.addClass('active');
            } else {
                items.first().addClass('active');
            }
        }
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (activeItem.length === 0) {
            items.last().addClass('active');
        } else {
            activeItem.removeClass('active');
            const prevItem = activeItem.prev('.search-result-item');
            if (prevItem.length) {
                prevItem.addClass('active');
            } else {
                items.last().addClass('active');
            }
        }
    } else if (event.key === 'Enter') {
        event.preventDefault();
        if (activeItem.length) {
            activeItem.trigger('click');
        }
    } else if (event.key === 'Escape') {
        hideSearchResults();
        searchInput.blur();
    }
});
