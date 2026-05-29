// @ts-check
const LOCAL_FILE_READER_VER = "0.0.01";
window["logConsoleHereIs"](`here is local-file-reader.js, module, ${LOCAL_FILE_READER_VER}`);
if (document.currentScript) { throw "local-file-reader.js is not loaded as module"; }

/** @type {IDBDatabase|null} */ let dbInstance = null;

/**
 *
 * @param {string} mediaTypes - comma-separated, like: image/*,video/mp4
 * @param {string} [title]
 * @returns {object}
 */
function makeFilePickerOptions(mediaTypes, title) {
    title = title || mediaTypes;
    if (typeof title != "string") throw Error(`title must be string`);

    const arrMediatypes = mediaTypes.split(",").map(mt => mt.trim());
    const validTypes = "application,audio,font,image,message,model,multipart,text,video,example";
    const typesArray = validTypes.split(",");
    arrMediatypes.forEach(mt => {
        const [mtType] = mt.split("/");
        const isValid = typesArray.includes(mtType);
        if (!isValid) {
            const msg = `Invalid media type: "${mtType}" (${mt})`;
            debugger;
            throw Error(msg);
        }
    });

    /** @type {Record<string,string[]>} */
    const objAccept = {};
    arrMediatypes.forEach(mt => {
        let [mtType, mtSubtype] = mt.split("/");
        mtSubtype = mtSubtype || "*"
        const ourMt = `${mtType}/${mtSubtype}`;
        objAccept[ourMt] = [];
    })
    /**
     * Sanitizes a string for use as a secure showOpenFilePicker option ID.
     * Removes non-alphanumeric/hyphen/underscore chars and caps length at 32.
     * @param {string} inputString - The raw ID string to clean.
     * @returns {string} A clean, valid ID string.
     */
    function sanitizePickerId(inputString) {
        if (typeof inputString !== 'string') return '';
        return inputString
            // 1. Remove all characters except a-z, A-Z, 0-9, hyphens (-), and underscores (_)
            .replace(/[^a-zA-Z0-9_-]/g, '')
            // 2. Enforce the strict 32-character limit
            .slice(0, 32);
    }

    const pickerOptions = {
        id: sanitizePickerId(title),
        // id: "a",
        types: [
            {
                description: title,
                accept: objAccept
            },
        ],
        excludeAcceptAllOption: true,
    };
    return pickerOptions;
}

/**
 *
 * @param {string} savedName
 * @param {string} mediaTypes - comma-separated, like: image/*,video/mp4
 * @param {string} [title]
 * @returns {Promise<boolean>}
 */
export async function selectAndSaveFile(savedName, mediaTypes, title) {
    if (typeof savedName != "string") throw Error(`savedName must be string`);
    const pickerOptions = makeFilePickerOptions(mediaTypes, title);
    return selectAndSaveFileAdvanced(savedName, pickerOptions);
}

/**
 * @param {string} savedName
 * @param {object} pickerOptions
 * @returns {Promise<boolean>}
 */
export async function selectAndSaveFileAdvanced(savedName, pickerOptions) {
    const fileHandle = await selectFile(pickerOptions);
    await saveFileHandle(savedName, fileHandle);
}

/**
 * @param {string} mediaTypes - comma-separated, like: image/*,video/mp4
 * @param {string} [title]
 * @returns 
 */
export async function selectFile(mediaTypes, title) {
    const pickerOptions = makeFilePickerOptions(mediaTypes, title);
    return selectFileAdvanced(pickerOptions);
}
/**
 * @param {object} pickerOptions
 * @returns {Promise<boolean|undefined>}
 */
export async function selectFileAdvanced(pickerOptions) {
    try {
        // @ts-ignore
        const [handle] = await window.showOpenFilePicker(pickerOptions);
        const fileHandle = await handle.getFile();
        if (!fileHandle) {
            debugger;
            throw Error("SelectAndSaveFile: !file");
        }
        // await saveFileHandle(savedName, fileHandle);
        return fileHandle;
    } catch (err) {
        if (err instanceof Error) {
            if (err.name == "AbortError") return false;
            const msg = `selectAndSaveFile error: ${err.name}`;
            console.error(msg, err);
            debugger;
            throw Error(msg);
        } else {
            debugger;
            throw err;
        }
        return;
    }
}


/**
 * @param {string} dbName
 * @param {number} dbVersion
 * @param {function} [handleVersionChange]
 * @returns {Promise<IDBDatabase>}
 * @throws
 */
async function getDatabase(dbName, dbVersion, handleVersionChange) {
    if (dbInstance) return dbInstance;

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = (event) => {
            console.log("Setting up database schema");
            if (event.target == null) throw Error("onupgradeneeded, event.target == null");
            const db = event.target.result;
            db.onversionchange = () => {
                db.close();
                dbInstance = null;
                // Your app may need to do something:
                if (handleVersionChange) {
                    handleVersionChange();
                }
            };
            // const usersStore = db.createObjectStore("users", { keyPath: "id" });
            // usersStore.createIndex("email", "email", { unique: true });

            // if (!db.objectStoreNames.contains("images")) db.createObjectStore('images');
            if (db.objectStoreNames.contains("images")) db.deleteObjectStore('images');
            // if (db.objectStoreNames.contains("handles")) db.deleteObjectStore('handles');
            if (!db.objectStoreNames.contains("handles")) db.createObjectStore('handles');
        };

        request.onsuccess = (event) => {
            if (event.target == null) throw Error("onsuccess, event.target == null");
            dbInstance = event.target.result;
            resolve(dbInstance);
        };

        request.onerror = (event) => {
            debugger;
            if (event.target == null) throw Error("onerror, event.target == null");
            reject(event.target.error);
        };
    });
}

export async function saveFileHandle(fileName, fileHandle) {
    const db = await getOurDatabase();
    return new Promise((resolve, reject) => {
        // const tx = db.transaction('images', 'readwrite');
        const tx = db.transaction('handles', 'readwrite');
        // const store = tx.objectStore('images');
        const store = tx.objectStore('handles');
        // const putRequest = store.put(fileHandle, 'savedBg');
        const putRequest = store.put(fileHandle, fileName);
        putRequest.onerror = () => {
            debugger;
            console.error('Put failed:', putRequest.error);
            reject(putRequest.error);
        };
        tx.oncomplete = () => {
            // debugger;
            // db.close();
            resolve(true);
        };
        tx.onerror = () => {
            debugger;
            reject(tx.error);
        }
    });

}

export async function getSavedFileBlob(savedName) {
    const db = await getOurDatabase();
    return new Promise((resolve, reject) => {
        // const tx = db.transaction('images', 'readonly');
        const tx = db.transaction('handles', 'readonly');
        // const store = tx.objectStore('images');
        const store = tx.objectStore('handles');
        // const getRequest = store.get('savedBg');
        const getRequest = store.get(savedName);

        getRequest.onsuccess = () => {
            // db.close();
            resolve(getRequest.result || null);
        };
        getRequest.onerror = () => {
            debugger;
            // db.close();
            reject(getRequest.error);
        };
    });
}


/**
 * @returns {Promise<IDBDatabase>}
 * @throws
 */
async function getOurDatabase() {
    const DB_NAME = 'FileHandlesDB';
    const DB_VERSION = 8;
    return getDatabase(DB_NAME, DB_VERSION);
}
