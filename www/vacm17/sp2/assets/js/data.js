import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as Modal from "./modal.js";


const supabaseUrl = "https://bxkvjqcmykdnzjjinfzf.supabase.co";
const supabaseKey = "sb_publishable_14WkpONyvoqvnT1W8g7VGQ_kAf_n5Y6";
const supabase = createClient(supabaseUrl, supabaseKey);

// --- SUPABASE ---

// Temporary storage (stores values so that it is not necessary to task back-end all the time)
let temporaryStorage = {};

// Function used to fetch data from the back-end
export async function fetchData() {
    if (Object.keys(temporaryStorage).length > 0) {
        console.log("DATA: fetchData: Data already fetched. Operation aborted.");
        return temporaryStorage
    }

    const tableNames = ["cpu", "gpu", "ram", "ssd"];

    for (const table of tableNames) {
        let { data, error } = await supabase
            .from(table)
            .select(`*`);
        if (!error) {
            temporaryStorage[table] = data;
        } else {
            Modal.disableModal(`Error fetching ${table}`, error)
        }
    }
    return temporaryStorage;
}

// Returns specific column of components
export function getComponentList(category) {
    return temporaryStorage[category] ? temporaryStorage[category].map(i => i.FullName) : [];
}

// --- LOCAL STORAGE ---

// Name for the local storage
const STORAGE_KEY = "data";

export function getLocalStorage() {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    console.log("LOCAL: getLocalStorage: Local storage received:", items.length > 0 ? items : "None")
    return items;
}

export function getLocalItemById(id) {
    const item = getLocalStorage().find(item => item.id === id);
    console.log("LOCAL: getLocalItemById: Local item received:", id);
    return item;
}

export function addLocalItem(item) {
    const items = getLocalStorage();
    items.push(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    console.log(`LOCAL: addLocalItem: Item ${item.name} has been added to local storage.`);
}

export function removeLocalItem(id) {
    const items = getLocalStorage();
    const filteredItems = items.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredItems));
    console.log(`LOCAL: removeLocalItem: Item with id ${id} has been removed from local storage.`);
}

// --- LOGIC / FORMATTING ---

export function createDataObject(name, inputs) {
    const id = Date.now().toString();
    let newItem = { id, name, score: 0 };

    let totalScore = 0;
    let componentCount = 0;

    for (const [category, componentName] of Object.entries(inputs)) {
        const dbItems = temporaryStorage[category];
        const match = dbItems.find(i => i.FullName.toLowerCase() === componentName.toLowerCase());

        if (!match) return null; // Invalid component found

        // Store as object (Better structure)
        newItem[category] = {
            component: match.FullName,
            score: match.Score
        };

        totalScore += parseFloat(match.Score || 0);
        componentCount++;
    }

    newItem.score = (totalScore / componentCount).toFixed(0);

    console.log("DATA: createDataObject: New Item created.")
    return newItem;
}