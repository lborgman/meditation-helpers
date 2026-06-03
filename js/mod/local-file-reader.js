// @ts-check
const LOCAL_FILE_READER_VER = "0.0.02";
window["logConsoleHereIs"](`here is local-file-reader.js, module, ${LOCAL_FILE_READER_VER}`);
if (document.currentScript) { throw "local-file-reader.js is not loaded as module"; }

/** @type {IDBDatabase|null} */ let dbInstance = null;

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
            throw Error(`Invalid media type: "${mtType}" (${mt})`);
        }
    });

    /** @type {Record<string,string[]>} */
    const objAccept = {};
    arrMediatypes.forEach(mt => {
        let [mtType, mtSubtype] = mt.split("/");
        mtSubtype = mtSubtype || "*";
        objAccept[`${mtType}/${mtSubtype}`] = [];
    });

    function sanitizePickerId(inputString) {
        if (typeof inputString !== 'string') return '';
        return inputString.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32);
    }

    return {
        id: sanitizePickerId(title),
        types: [{ description: title, accept: objAccept }],
        excludeAcceptAllOption: true,
    };
}

export async function selectAndSaveFile(savedName, mediaTypes, title) {
    if (typeof savedName != "string") throw Error(`savedName must be string`);
    const pickerOptions = makeFilePickerOptions(mediaTypes, title);
    return selectAndSaveFileAdvanced(savedName, pickerOptions);
}

export async function selectAndSaveFileAdvanced(savedName, pickerOptions) {
    const fileHandle = await selectFileAdvanced(pickerOptions);
    if (!fileHandle) return false; // User cancelled
    await saveFileHandle(savedName, fileHandle);
    return true;
}

export async function selectFile(mediaTypes, title) {
    const pickerOptions = makeFilePickerOptions(mediaTypes, title);
    return selectFileAdvanced(pickerOptions);
}

/**
 * @param {object} pickerOptions
 * @returns {Promise<FileSystemFileHandle|undefined>} Returns null if aborted
 */
export async function selectFileAdvanced(pickerOptions) {
    try {
        // @ts-ignore
        const [handle] = await window.showOpenFilePicker(pickerOptions);
        if (!handle) throw Error("SelectAndSaveFile: !handle");

        // NOTE: We return the HANDLE itself to save into IndexedDB, 
        // NOT handle.getFile() which grabs the heavy file data.
        return handle;
    } catch (err) {
        /*
        if (err instanceof Error && err.name === "AbortError") {
            return undefined; // Changing null to undefined to match standard optional returns
        }
        */
        // 1. "AbortError" = User clicked cancel
        // 2. "TypeError" = Browser rejected the options object format on cleanup
        if (err.name === "AbortError" || err instanceof TypeError) {
            console.warn(`File picker closed safely. Reason: ${err.message}`);
            return undefined;
        }

        console.error("File picker error:", err);
        throw err;
    }
}

/**
 * @param {string} dbName
 * @param {number} dbVersion
 * @returns {Promise<IDBDatabase>}
 */
async function getDatabase(dbName, dbVersion) {
    if (dbInstance) return dbInstance;

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = (event) => {
            // @ts-ignore
            const db = event.target.result;
            if (db.objectStoreNames.contains("images")) db.deleteObjectStore('images');
            if (!db.objectStoreNames.contains("handles")) db.createObjectStore('handles');
        };

        request.onsuccess = (event) => {
            // @ts-ignore
            dbInstance = event.target.result;

            // Handle cross-tab updates safely here so it doesn't hang!
            dbInstance.onversionchange = () => {
                dbInstance.close();
                dbInstance = null;
                console.warn("Database outdated. Closing connection.");
            };
            resolve(dbInstance);
        };

        request.onerror = (event) => {
            // @ts-ignore
            reject(event.target.error);
        };
    });
}

export async function saveFileHandle(fileName, fileHandle) {
    const db = await getOurDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('handles', 'readwrite');
        const store = tx.objectStore('handles');
        const putRequest = store.put(fileHandle, fileName);

        putRequest.onerror = () => reject(putRequest.error);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
}

/**
 * @param {string} savedName 
 * @returns {Promise<File|null>}
 */
export async function getSavedFileBlob(savedName) {
    const handle = await getSavedFileHandle(savedName);
    if (!handle) return null;
    console.warn("%cgetSavedFileBlob: before getFile", "font-size:30px;", handle);
    const blob = await handle.getFile();
    console.log("getSavedFileBlob", blob)
    return blob;
}
/**
 * @param {string} savedName 
 * @returns {Promise<FileSystemHandle>}
 */
export async function getSavedFileHandle(savedName) {
    const db = await getOurDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('handles', 'readonly');
        const store = tx.objectStore('handles');
        const getRequest = store.get(savedName);

        getRequest.onsuccess = async () => {
            const result = getRequest.result;
            if (!result) {
                resolve(null);
                return;
            }
            try {
                // If you saved a FileSystemHandle, you call .getFile() when READING it back out
                /*
                if (typeof result.getFile === 'function') {
                    const file = await result.getFile();
                    resolve(file);
                } else {
                    resolve(result); // Fallback if it was saved as a standard Blob/File
                }
                */
                console.log("getSavedFileHandle", result);
                resolve(result);
            } catch (e) {
                reject(e);
            }
        };
        getRequest.onerror = () => reject(getRequest.error);
    });
}

async function getOurDatabase() {
    return getDatabase('FileHandlesDB', 8);
}