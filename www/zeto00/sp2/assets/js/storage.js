const STORAGE_KEY = 'lifted_workouts';

export const getWorkouts = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveWorkout = (workout) => {
    const workouts = getWorkouts();
    const newWorkout = {
        ...workout,
        id: generateId(),
        createdAt: moment().toISOString()
    };
    workouts.push(newWorkout);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
    return newWorkout;
};

export const updateWorkout = (workoutId, updatedData) => {
    const workouts = getWorkouts();
    const index = workouts.findIndex(w => w.id === workoutId);
    
    if (index !== -1) {
        workouts[index] = {
            ...workouts[index],
            ...updatedData,
            updatedAt: moment().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
        return workouts[index];
    }
    return null;
};

export const deleteWorkout = (workoutId) => {
    const workouts = getWorkouts();
    const filteredWorkouts = workouts.filter(w => w.id !== workoutId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredWorkouts));
};

const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getWorkoutsGroupedByDate = () => {
    const workouts = getWorkouts();
    const grouped = {};
    
    workouts.forEach(workout => {
        const date = workout.date;
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(workout);
    });
    
    const sortedDates = Object.keys(grouped).sort((a, b) => {
        return moment(b, 'YYYY-MM-DD').diff(moment(a, 'YYYY-MM-DD'));
    });
    
    const sortedGrouped = {};
    sortedDates.forEach(date => {
        sortedGrouped[date] = grouped[date];
    });
    
    return sortedGrouped;
};