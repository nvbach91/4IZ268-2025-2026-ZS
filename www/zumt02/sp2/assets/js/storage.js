import { formSearch, order, setOrder } from "./elements.js";

export const get2Watch = () => {
    const stored = localStorage.getItem("toWatch");
    const newEmptyList = [];
    if (stored === null) {
        return newEmptyList;
    }
    let json;
    try {
        json = JSON.parse(stored);
    } catch (error) {
        console.error(error);
        return newEmptyList;
    }
    return json;
};

export const saveTo2Watch = (anime) => {
    let toWatch = get2Watch();
    if (!toWatch.some(a => a.id === anime.id)) {
        toWatch.push(anime);
        localStorage.setItem("toWatch", JSON.stringify(toWatch));
    }
    removeFromSeen(anime);
};

export const removeFrom2Watch = (anime) => {
    let toWatch = get2Watch();
    const index = toWatch.findIndex(a => a.id === anime.id);
    if (index !== -1) {
        toWatch.splice(index, 1);
        localStorage.setItem("toWatch", JSON.stringify(toWatch));
    }
};

export const getSeen = () => {
    const stored = localStorage.getItem("seen");
    const newEmptyList = [];
    if (stored === null) {
        return newEmptyList;
    }
    let json;
    try {
        json = JSON.parse(stored);
    } catch (error) {
        console.error(error);
        return newEmptyList;
    }
    return json;
};

export const saveToSeen = (anime) => {
    let seen = getSeen();
    if (!seen.some(a => a.id === anime.id)) {
        seen.push(anime);
        localStorage.setItem("seen", JSON.stringify(seen));
    }
    removeFrom2Watch(anime);
};

export const removeFromSeen = (anime) => {
    let seen = getSeen();
    const index = seen.findIndex(a => a.id === anime.id);
    if (index !== -1) {
        seen.splice(index, 1);
        localStorage.setItem("seen", JSON.stringify(seen));
    }
};

export const getRatings = () => {
    const stored = localStorage.getItem("ratings");
    if (!stored) return new Map();

    try {
        return new Map(JSON.parse(stored));
    } catch (e) {
        console.error(e);
        return new Map();
    }
};

export const addRating = (anime, stars) => {
    const ratings = getRatings();
    const id = anime.id;

    if (ratings.get(id)?.stars === stars) {
        ratings.delete(id);
    } else {
        ratings.set(id, {anime, stars});
    }

    localStorage.setItem("ratings", JSON.stringify([...ratings]));
};


export const removeRating = (anime) => {
    const ratings = getRatings();
    ratings.delete(anime.id);
    localStorage.setItem("ratings", JSON.stringify([...ratings]));
};


const updateUrl = (params, replace = false) => {
    const url = `${location.pathname}?${params.toString()}`;

    history[replace ? 'replaceState' : 'pushState'](
        { query: params.toString() },
        '',
        url
    );
};

const saveListURL = (list, replace = false) => {
    const params = new URLSearchParams();
    params.set('list', list);

    updateUrl(params, replace);
};

export const cleanParams = () => {
    const params = new URLSearchParams();
    updateUrl(params);
};

export const pushSeenToURL = (replace = false) => {
    saveListURL('seen', replace);
};

export const push2WatchToURL = (replace = false) => {
    saveListURL('toWatch', replace);
};

export const pushRatedToURL = (replace = false) => {
    saveListURL('rated', replace);
};

export const loadList = () => {
    const params = new URLSearchParams(location.search);
    const list = params.get('list');
    //console.log("Loaded list: ", list);
    return list;
};

export const saveCategories = (categories, replace = false) => {
    const params = new URLSearchParams(location.search);

    if (categories.length) {
        params.set('categories', categories.join(','));
    } else {
        params.delete('categories');
    }

    //console.log("Saved categories: ", categories);
    updateUrl(params, replace);
};

export const loadCategories = () => {
    const params = new URLSearchParams(location.search);
    const raw = params.get('categories');
    //console.log("Loaded categories: ", raw);
    return raw ? raw.split(',') : [];
};

export const saveOrder = (replace = false) => {
    const params = new URLSearchParams(location.search);

    if (order) {
        params.set('order', order);
    } else {
        params.delete('order');
    }

    //console.log("Saved orded: ", order);
    updateUrl(params, replace);
};

export const loadOrder = () => {
    const params = new URLSearchParams(location.search);
    const loaded = params.get('order') ?? "";

    setOrder(loaded);
    //console.log("Loaded order: ", order);
};

export const saveSearch = (replace = false) => {
    const params = new URLSearchParams(location.search);

    const formData = new FormData(formSearch.get(0));
    const searchString = formData.get('searchField');
    if (searchString !== "") {
        params.set('search', searchString);
    } else {
        params.delete('search');
    }

    //console.log("Saved search: ", searchString);
    updateUrl(params, replace);
};

export const loadSearch = () => {
    const params = new URLSearchParams(location.search);
    const searchString = params.get('search') ?? "";

    formSearch.find('[name="searchField"]').val(searchString);
};