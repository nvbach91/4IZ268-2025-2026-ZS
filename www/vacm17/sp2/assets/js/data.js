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
export const PC_STORAGE_KEY = "data"; // ID for PC items storage
export const COMP_STORAGE_KEY = "comp"; // ID for items in comparator storage

// Returns local storage
export function getLocalStorage(storage) {
    const items = JSON.parse(localStorage.getItem(storage)) || []
    console.log("LOCAL: getLocalStorage: Local storage received:", items.length > 0 ? items : "None")
    return items;
}

// Finds first item in local storage by ID
export function getLocalItemById(id, storage) {
    const item = getLocalStorage(storage).find(item => item.id === id);
    console.log("LOCAL: getLocalItemById: Local item received:", id);
    return item;
}

export function existsLocalItemById(id, storage) {
    const item = getLocalStorage(storage).find(item => item.id === id);
    if (item) {
        console.log("LOCAL: existsLocalItemById: Local item exists:", id);
        return true;

    } else {
        console.log("LOCAL: existsLocalItemById: Local item does not exist:", id);
        return false;
    }
}

// Adds a local item
export function addLocalItem(item, storage) {
    const items = getLocalStorage(storage);
    items.push(item);
    localStorage.setItem(storage, JSON.stringify(items));
    console.log(`LOCAL: addLocalItem: Item ${item.name} has been added to local storage.`);
}

// Removes items by ID from local storage
export function removeLocalItem(id, storage) {
    const items = getLocalStorage(storage);
    const filteredItems = items.filter(item => item.id !== id);
    localStorage.setItem(storage, JSON.stringify(filteredItems));
    console.log(`LOCAL: removeLocalItem: Item with id ${id} has been removed from local storage.`);
}

// --- LOGIC / FORMATTING ---

export function createDataObject(name, inputs, id) {
    // If id is unknown - it should be automatically created
    const generatedID = crypto.randomUUID();
    let newItem = { id: id ?? generatedID.toString(), name, score: 0 };

    console.log("DATA: createDataObject: Received inputs:", inputs);

    let totalScore = 0;
    let componentCount = 0;

    // Object.entries returns key (category) and value (componentName)
    for (const [category, componentName] of Object.entries(inputs)) {
        const dbItems = temporaryStorage[category];
        const match = dbItems.find(i => i.FullName.toLowerCase() === componentName.toLowerCase());

        if (!match) {
            console.warn(`DATA: createDataObject: Invalid component found ${componentName}. Item creation terminated.`)
            return null;
        }

        newItem[category] = {
            component: match.FullName,
            score: parseFloat(match.Score).toFixed(0)
        };

        totalScore += parseFloat(match.Score || 0);
        componentCount++;
    }

    newItem.score = (totalScore / componentCount).toFixed(0);

    console.log(`DATA: createDataObject: Item with id=${newItem.id} created.`)
    return newItem;
}

export function changeCompID(id) {
    const modifiedId = `comp-${id}`;

    console.log(`DATA: changeCompID: id="${id} changed to id="${modifiedId}".`);
    return modifiedId;
}

export function changePcID(id) {
    const modifiedId = id.replace("comp-", "");

    console.log(`DATA: changePcID: id="${id} changed to id=${modifiedId}".`);
    return modifiedId;
}