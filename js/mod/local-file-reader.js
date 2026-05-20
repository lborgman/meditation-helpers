// @ts-check
const LOCAL_FILE_READER_VER = "0.0.01";
window["logConsoleHereIs"](`here is local-file-reader.js, module, ${LOCAL_FILE_READER_VER}`);
if (document.currentScript) { throw "local-file-reader.js is not loaded as module"; }

/** @type {IDBDatabase|null} */ let dbInstance = null;


export async function selectAndSaveFile(savedName, pickerOptions) {
    /*
    const OLDpickerOptions = {
        types: [
            {
                description: "Images and Videos",
                accept: {
                    "image/*": [],
                    "video/*": [],
                },
            },
        ],
        excludeAcceptAllOption: true,
    };
    */
    /*
    return internalSelectAndSaveFile(savedName, pickerOptions);
}
async function internalSelectAndSaveFile(savedName, pickerOptions) {
    */
    try {
        // Ask user to pick a file
        // @ts-ignore
        const [handle] = await window.showOpenFilePicker(pickerOptions);
        const fileHandle = await handle.getFile();
        if (!fileHandle) {
            debugger;
            throw Error("SelectAndSaveFile: !file");
        }
        if (fileHandle.type.startsWith("video/")) {
            alert("Sorry, video background not implemented yet.");
            return false;
        }
        await saveFileHandle(savedName, fileHandle);
        return true;
    } catch (err) {
        if (err instanceof Error) {
            if (err.name != "AbortError") {
                const msg = `selectAndSaveFile error: ${err.name}`;
                console.error(msg, err);
                debugger;
                throw Error(msg);
            }
        } else {
            debugger;
            throw err;
        }
        return false;
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

async function saveFileHandle(fileName, fileHandle) {
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
