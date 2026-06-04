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
    // await saveFileHandle(savedName, fileHandle);
    await saveToOpfs(savedName, fileHandle);
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
        // const blob = await handle.getFile();
        // console.log({ blob });
        // debugger;

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
async function getDatabaseIDB(dbName, dbVersion) {
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
    await saveToOpfs(fileName, fileHandle);
    return;
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
 * @returns {Promise<Blob|null>}
 */
export async function getSavedFileBlob(savedName) {
    const b = await getBlobFromOPFS(savedName);
    return b;
    const handle = await getSavedFileHandle(savedName);
    if (!handle) return null;
    console.warn("%cgetSavedFileBlob: before getFile", "font-size:30px;", handle);
    const blob = await handle.getFile();
    console.log("%cgetSavedFileBlob after", "font-size:18px;", blob);
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

/**
 * 
 * @param {string} fileName 
 * @param {FileSystemHandle} handle 
 */
async function saveToOpfs(fileName, handle) {

    /*
    // 1. Fire the modern file picker
    const [handle] = await window.showOpenFilePicker();
    */

    // 2. Extract the file blob and metadata
    const file = await handle.getFile();

    // 3. Since webkitRelativePath is guaranteed to be "", 
    // you can safely save directly to the OPFS root using just the file name.
    const root = await navigator.storage.getDirectory();
    const opfsFileHandle = await root.getFileHandle(fileName, { create: true });

    const writable = await opfsFileHandle.createWritable();
    await writable.write(file);
    await writable.close();
}

/**
 * Fetches an image file from OPFS and creates a temporary Object URL.
 * @param {string} fileName - The name of the file inside OPFS
 * @returns {Promise<string>} The temporary blob:// URL
 */
async function getBlobUrlFromOPFS(fileName) {
    const root = await navigator.storage.getDirectory();

    // 1. Get the private handle for the file
    const fileHandle = await root.getFileHandle(fileName);

    // 2. Unpack it into a standard Web File/Blob object
    const fileBlob = await fileHandle.getFile();

    // 3. Generate the temporary URL pointing to these cached bytes
    return URL.createObjectURL(fileBlob);
}
/**
 * 
 * @param {string} fileName 
 * @returns {Promise<Blob|undefined>}
 */
async function getBlobFromOPFS(fileName) {
    const root = await navigator.storage.getDirectory();

    // 1. Get the private handle for the file
    let fileHandle;
    try {
        fileHandle = await root.getFileHandle(fileName);
    } catch (err) {
        if (!(err instanceof Error)) throw Error("err is not Error");
        if (err.name == "NotFoundError") {
            return undefined;
        }
        console.error(err);
        debugger;
        throw Error;
    }

    // 2. Unpack it into a standard Web File/Blob object
    const fileBlob = await fileHandle.getFile();

    return fileBlob;
}

/**
 * Safely checks if an Object URL is active without throwing security errors.
 * @param {string} url - The blob:// URL to test
 * @returns {Promise<boolean>} True if valid, false if revoked or blocked
 */
export async function isObjectUrlValid(url) {
    if (!url || !url.startsWith('blob:')) {
        debugger;
        return false;
    }

    try {
        // 1. MUST use 'GET' instead of 'HEAD' for Blobs
        // 2. 'cors' ensures we don't trip over origin mismatches
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors'
        });

        return response.ok;
    } catch (error) {
        // If it catches an error, the URL is either revoked 
        // OR a strict Content Security Policy is blocking fetch() from blobs.
        console.warn("Blob validation fetch failed:", error.message);
        return false;
    }
}