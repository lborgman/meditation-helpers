// @ts-check
const PUBLIC_IMAGES_VER = "0.0.5";
// @ts-ignore
window["logConsoleHereIs"](`here is user-images.js, module, ${PUBLIC_IMAGES_VER}`);
if (document.currentScript) { throw "user-images.js is not loaded as module"; }

/*
    This is a stub where you enter your own images.

    I have some public images on Google Photos which I want to use.
    However there is no easy official way to access them.
    So I have have used an inofficial hack for those.
    I am using that hack below, see const ourGoogleImagesHack.

    This hack may stop to work any day Google dismiss it.
    So I decided to copy those images to One Drive.
    Microsoft supports easy access of public images.


    **** How to copy:
    Method 1: Google Takeout (Direct Cloud-to-Cloud)
    This is the best official method for moving a specific album directly to your OneDrive .
     1. Visit Google Takeout and click "Deselect all" .
     2. Scroll down to Google Photos and check the box .
     3. Click the button that says "All photo albums included". Deselect all, then select only the specific album you want to move .
     4. Click "Next step" and for "Destination," choose "Add to OneDrive" .
     5. Click "Link accounts and create export". You will be prompted to sign in to your Microsoft account to authorize the transfer .
    Once finished, your album will appear in a folder named "Google Download Your Data" in your OneDrive .



    Below are OneDrive functions I got from Google basic search chat.
    https://learn.microsoft.com/en-us/onedrive/developer/rest-api/?view=odsp-graph-online
*/
async function OLDgetOneDrivePhotos(sharingUrl) {
    // 1. Encode the sharing URL for the Graph API
    const base64Url = btoa(sharingUrl).replace(/=/g, '').replace(/\//g, '_').replace(/\+/g, '-');
    const driveItemApi = `https://microsoft.com{base64Url}/driveItem/children`;

    try {
        const response = await fetch(driveItemApi);
        const data = await response.json();

        // 2. Map items to usable image objects
        return data.value.map(item => ({
            name: item.name,
            // This @microsoft.graph.downloadUrl works for unauthenticated PWA access
            src: item["@microsoft.graph.downloadUrl"],
            id: item.id
        }));
    } catch (error) {
        console.error("Error fetching photos:", error);
    }
}

/*
// Usage: Pass your "Anyone with link" OneDrive folder URL here
// const myPhotos = await getOneDrivePhotos("https://1drv.ms");

// Append the 'thumbnails' expansion to your sharing API request
const customSize = "c300x300"; // Fits inside 300x300
const apiUrl = `https://microsoft.com{encodedUrl}/driveItem/children?$expand=thumbnails(select=${customSize})`;

const response = await fetch(apiUrl);
const data = await response.json();

// Access the custom resized URL
const resizedUrl = data.value[0].thumbnails[0][customSize].url;
*/



async function OLDgetOneDrivePhotosWithSizes(sharingUrl, width, height) {
    // 1. Encode the sharing URL (same as before)
    const base64Url = btoa(sharingUrl).replace(/=/g, '').replace(/\//g, '_').replace(/\+/g, '-');

    // 2. Define the custom size (e.g., c400x400)
    const sizeKey = `c${width}x${height}`;

    // 3. Add ?$expand=thumbnails to the end of the URL
    // This tells OneDrive: "Send the file info AND a resized version of the image"
    const driveItemApi = `https://microsoft.com{base64Url}/driveItem/children?$expand=thumbnails(select=${sizeKey})`;

    try {
        const response = await fetch(driveItemApi);
        const data = await response.json();

        return data.value.map(item => ({
            name: item.name,
            // Instead of the original "downloadUrl", we use the generated thumbnail URL
            src: item.thumbnails[0][sizeKey].url,
            id: item.id
        }));
    } catch (error) {
        console.error("Error fetching photos:", error);
    }
}


/**
 * Fetches public OneDrive photos with custom resizing.
 * @param {string} sharingUrl - The "Anyone with the link" OneDrive URL.
 * @param {number} width - Desired width in pixels.
 * @param {number} height - Desired height in pixels.
 * @param {boolean} crop - Set to true for a perfect square crop.
 */
async function getOneDrivePhotosWithSizes(sharingUrl, width, height, crop = false) {
    // 1. Encode the sharing URL for the Graph API (Base64 without padding)
    const base64Url = btoa(sharingUrl)
        .replace(/=/g, '')
        .replace(/\//g, '_')
        .replace(/\+/g, '-');

    // 2. Format the size key (e.g., "c400x400" or "c400x400_crop")
    const sizeKey = `c${width}x${height}${crop ? '_crop' : ''}`;

    // 3. Construct the API URL using the $expand parameter to request the thumbnail
    const driveItemApi = `https://microsoft.com{base64Url}/driveItem/children?$expand=thumbnails(select=${sizeKey})`;

    try {
        const response = await fetch(driveItemApi);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        // 4. Extract the specific thumbnail URL from each item
        return data.value
            .filter(item => item.image || item.photo) // Only get images
            .map(item => ({
                name: item.name,
                // Using the specific resized version instead of the heavy original
                src: item.thumbnails[0][sizeKey].url,
                id: item.id
            }));
    } catch (error) {
        console.error("Error fetching photos from OneDrive:", error);
        return [];
    }
}

// --- Example Usage ---
// const photos = await getOneDrivePhotos("https://1drv.ms", 400, 400, true);


// Usage for your PWA:
// const myPhotos = await getOneDrivePhotos("YOUR_LINK", 400, 400);


/**
 * Fetches all photos recursively from a public OneDrive link.
 */
async function getOneDrivePhotosRecursive(sharingUrl, width, height, crop = false) {
    const base64Url = btoa(sharingUrl)
        .replace(/=/g, '')
        .replace(/\//g, '_')
        .replace(/\+/g, '-');

    const sizeKey = `c${width}x${height}${crop ? '_crop' : ''}`;

    // Notice the change: we use '/search(q=\'\')' instead of '/children'
    // We also add a filter to ensure we only get images
    const driveItemApi = `https://microsoft.com{base64Url}/driveItem/search(q='')?$filter=image ne null&$expand=thumbnails(select=${sizeKey})`;

    try {
        const response = await fetch(driveItemApi);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        return data.value.map(item => ({
            name: item.name,
            // Accessing the specific thumbnail size
            src: item.thumbnails[0] ? item.thumbnails[0][sizeKey].url : null,
            parentFolder: item.parentReference.path, // Useful if you want to group them by folder
            id: item.id
        })).filter(photo => photo.src !== null); // Remove any that failed to generate a thumbnail
    } catch (error) {
        console.error("Error fetching photos recursively:", error);
        return [];
    }
}





const ourGoogleImagesHack = [
    "https://lh3.googleusercontent.com/tooP6STn0Vpx-OcgxZ3iYqjmduc94Pm7Ly_hEyt9KxfGVTXJ9rRPaKNorZAPQQHVus_O-Q6PY6lp3yGWGr2JRO1YLkbHJMYZF8FrCnjaMBG1heO79dRfxLcOq2ZYxRd1njYQRyftoiFPK3NtydLJpyvW31SjW5CEINMzrJmki2tAPjwTc2qEnIHlMn4AuIbh8lNayB6aNMKcBq2Eo0wWrLe3RW8gl4BLt17RFUR9rmslTzwU5zYZS9-EzEpQifPdOwCVx0ErGvjspkTxAr3AHesavYGMI57rRB2edLYldfbAd0wzcHp1bF0sfoCTWJflk9BiLB1PiiXeNqBfZfZaRrQL7m0-GC_KpGJBGIRcd2PIU4wSLqwLB7mVneTf5D4iwSYguUGm0-W53oenvy913ENxhGPyqoKUrq8wPfmHdfsAmanpRniuWRONobDmwhY0p7hny-7_fDtp3bbrxIyQi0nqz76i6hD2oqXtoz0lPTD0QZ5p_wyWd2G91f2Y00Yosl7of1T2ZYv59u15mxHKoOuHjI5OHPR4DlqIKP4VlEjwFDjXxrVP4Pv8OlOBCk4pyn2iupz1S1FE1sf0gUgtyGEzS1yxIYmXkGPjk7j7JlV9LPw9EExAiO-QczFJ1ruI56XXmvRfZ5vYjetJcizvsZS8txF-Idykit5zL6vmlpfHpQonHtaN60LwWet77w_HCocnkYVQiwajBFtIbb9mhrpTfA=w1236-h927-no",
    "https://lh3.googleusercontent.com/gAH_eGp9vNWx_pWu9uISKJttTVsYS72hm8sOTM3QeeelSHvBGmDWfzAA3nJeRalO-4hwyCGbD6NSnXxLHHVJUaXl2x6bVRUXa__sa3PWM7QZYnIYJVpX8b8ClcwgACNcqMVWvvluNEp0ANe5ML-29t0WDkGpmIOv0VcfYiuamM3dhmuD_bqeWQZ4fElXjIAhB8dynjqwufXreFkWO8ij-IOEkLKL82FDGcl0FsDoryvDokRDRPkGlLY_-tMmTg-Oh-8EKVclfAY_lh9j7Z1pUWW33CCix0GW-lHbuAtNu0xFFHeVvR_GjpOMQIvDvivSY7Cw-LW28OznNDThnfO0lSUjEH4hxg00HMJwuWgq7J33bjLUrHpIRyz1UhgcfguxE3iu45CvLHPGsjV13s6qvAb44eFWElbdI2zTLx5txsbiM_jGVNVP3jo_JiI8mouS7B8bHjP5sCx-mTmFIOroVPlYfKq7Z59nw3Swu6OmgztRTQGg4d7EuBwx-vU9nIW30aHYFWFYXceBg-w8LIavh6VTcJCQxti3C-BUQe3HtRmrv9iJrKnQuPJxnMs1d-nxD0hqCiSx6OWQcAnQvwhJsd6VL-Q28YqrHfFNcAjG50mUl7U97gKfoWRe-faoSrJH0pnZ_2--IOkXe51tpgR0Vr9ugYBBRO3lAAFNZiec6zQfJ4lusjTQqTv84xnL95kN2sCO8o8UJPzpvBNH1R2fD5WgQw=w696-h927-no",
    "https://lh3.googleusercontent.com/kfid79H0759bElB8QB85IP3-ZXyVR-gWHFhja6tlMP2GA4VvklDGEZWGqQH8B-uULUTbXx4xdVL5XkMxoQhEiA14XVz8pZxTkP8YrOao7TUL_8QWlhyztjxGEgLD5UrRJ-doeVBwMsyLMD2ZkHgKRxcR70UJXBCYJhC2WRjm6QgtSNbclseiTv_O5NAYIUbZM9dLNYlnHZ13vtN82MWPpM4boT7XCjZklEzHtwpUtYMSc9DmbA6mQrQIXfFYxE3YRQgFUGCrdtCM5yCvxt2uik10-n74Qz6wTG8-JnDdEHZCFr1fkBHRDfQ2JV-rI5GXwO3eIlrOiSW8KUl3xe6ZSN1pk1nqLvABATELhA9X73nKmboEG-ef1OT6kbKsExVFH4kU6Pp6bm7y9Wjc_-M3EcZk-cvAQtvWPcHzDMYCwodxxKDdBwUBwbxd4Gl_wNNpW9rZuKZlDBnHP6Fp1r7osQlpTm8uHCXGE0LmlqGtPI5-B7QvcV7uRMKAo2lwa1Q43vauHC_NsjWen64eq5rTbJB2by225El-7zCEbOJZb19AD-_xXMEHNh0YVHASlt4c3y6J21kyPfiPPBm0PzZ-daE1CwQGAl8wgyto3KA01Rhkja9MtJQ8DI4rGhU5pY9Cbqxk__G8gc6VPW-WIMwp_-eDN-WegiQ6Dix7vAQ2WNSpFQycC_fFRiv6E5yM1kg6z_XMAWERuoF0O3Dmd8TEn29ypA=w1236-h927-no",
    "https://lh3.googleusercontent.com/Bj24vN2Fry_eXPAxEPSTIITVzVP-iaF4795rdea6vNtasfGaCm99u4gUeP7XOu1SFFuJinslqTHjUR32x9rAyAhdQW4LlrP4YWapr6ZssWtQzCHIGmapq0L7SHwIJbFT_c4N4sPzhnrFxhdwnayrVYZ8Fcn83QCfS_AaBAq05qI_PfP_TchqsSzIrWqYcZdRcRatMF5AsUI5A48QOt3C0wVmg8A2HGJSVT5mddBkgpKij6NI-8VtAlu-N-doriyQpTDuBxt7__KP4hxLVvR5jzy9-m2G1FsyKvh5Ebe_mcGyYA01vBNiiY7Iff4kDa_LXo0oah7BVI47X7B_kTpG1pHVoYnc1Cn9iIb8USEvq8WcclHHxnpxtv0HYz56HoTWOrOrGfFhvvXszRxebrdse9cm7up7NyJgBS5flNMa1_xQa3L475nSemrVU623uTSpaWgxi5i2bKNcnBT1qgklMlOSIuCz6nWU6-ATMGT79FPUex_wG4x20gxlFX3C5UIhxjGs-qdv9_Cn5PACnh_3iIttsB-eTNE64tzRiSVRocWks61gsE7VNjzqMVGdPIOSsjd85A3ka_6_onR93m87sd3ixwrUv2R7MKuJnq93qa8JKuwCd0qOpjspIu8-fYlh8FKtJdxKAEVk8MRNRAj05xeNgdn7CdZg_VAek4cH7sU37HYuV_R0zHZasjzFD89t9C3rMkcamLlk3fUPuJniZJyXBQ=w1236-h927-no",
    "https://lh3.googleusercontent.com/mh-JFTBIvYIpbnlzDXgSe4ek_WHVEPySB7Go4b2YP0EPMketYvj7hx6-G_mkgmjArYU5QZdYGxdd1jRspkP98CcF9oen3BNzYhFVi_qUCnAdChfTzdjNtzdLsmF_8aWWHrj5P04XmCDhgqXdw4Qbb-2Xc2QzZ_nvFBI-hDiwAafUTF2w4qg9EvyebvNEsU532LYFaYf2V76xYZSfK3mDU6RJ71gfrESHtihs4QgWesPbk7u_AB9d5pE86dAdQaNkbaRgmDmr33GaRhw5QYqHvW3moQm2pYEAqr3cLGREOYoCACUaWL-OqoRLngtLTLy4pMI45lqnFyyWnw8aFr16GnAQ4w0aDydmsxh5ws0KO8KGNZyp5mmdcLcWJKfJVluBbv2LKFHI1xz2zSYJOFAGfUKpXdKbO3jgA_hhAlSOfuWV2Gqmvyk-070IXIooTGldSEsC294v8x4XpBPss8F5oX1h0nN_egleYw2Yg3qoclE9hw6ipXIgy_7UFVFwUNKwDMvAASytEqzKYZZVS-kDGkDopM13PVZCQVko_lLxJLCb_YUSXpd8sPAiZNGGMBwYqZzT-yk5tpNpZaN37EpSJcJmhLwBeRRw1sCLuKzZmQ4adIOfr9iqTcX1u24emp63PybH81nToJpDWcy5zC2YfXmPrxaPdwv5xUyUWajDDUoRDNjo15Q23GE1UIDt41q5o9Z30u91GG5h9rV5AW3vbe9dxg=w1236-h927-no",
    "https://lh3.googleusercontent.com/s_ISgu4QbIwOWKD3goX-1x1yTaojHLET5LqVL1ha6EOA1OGyMwSwxQ-T0GecP03sePclxy2dcxW6gJq87Tq8rwEPyR3JPf3qhp48jeZmYCZy0Mm5Ftc2SkqkGytDJLsa5dZDsjubmqpo4fv9n5UJiYCyFch_SW6WunM8-PV9O_7vKJvpW15xYzEqZTv2plHPa-UeNxdlZ9UiYHihnowq99VPdKzoaPob-5Ug8Qx3RbomPwz577Du5MO-1wHFCVQpnbNpBtcc5DKfy5ya1hmWEvS2bR3-EB9KgNQigwlH4f7Q70MhYWqWeXgjCDlMbGC0TkARsb0Q5ptyRbVKue_25uhp_Pj2-MxHwTAZ8DHyM01iyZBMLapUuDx0pQ7I__46z3duRKNEVsVUM7lxtDlxVP5CYt4ek5A1KFXliXVBFiHmVp872BQO4lAYc3mRzUsY7Xg_bluYmpXVzMUeivPfH0jtTmyDz975kochC73bVTjp0DQZAvICgB51droHwejwX7-XNHrS8gvte8_2zfCnKhy53skqHGkQlpsrMd-IRHzrTLTm11ybY_oxVPcNhUNFiyAzpAANBt-VjLuPTjNDu_JTjVa8Ln6w4_NXbF47XqUBmvcRbn2Yn9ibKQZAfxLBwzqJLV2vs2pWRYoQHoDT5n6-j5ZlFRj99AjZRZDvP5dUbq-smaqtMA8xTpQUMRKCTkXwM7ambPeOZJNCZtPQYFqiBQ=w1236-h927-no",
    "https://lh3.googleusercontent.com/NAd021SvInDxi0DvXufJywuDp2xD2U2rKJMy04MK7D7LQkQ1S2vA0hCAAP0JyxKvfLJs12rjSqvR9E_yYcLIB4n4jbBKGAgAHb84u8wRooYwJIRj-KCba1bsYU2VAsoElNsVVwp61eL3nnYmO7jelfkS4uZzsfzyD6ENNLg3BYPxv35mXWjYC9zsbqz0aO4HPYTE-AHteWVh7qysnpzALowqVOn1AFiIGWocuYxexD1NqfbM4DpWThE-_aNBOJqVYSHUTkuZIS13_wH1Re_8kIGpQ3XrzVaCzK609btQHD2Cb_bto39hE6uJ-dPNlrV2wtpXsbiOrBYb9objDQUGXuWVW_ArFJkFG0twRIm9BNfBl0EgRuDUjLHf-vpGGy_qMxvCHLvFKXM6zuQp35_EOgbelDxhhj38HqvK1n9AIdIrWEDe8DkEInl5Mjbfdg9CfoZC8O37kbApknE31_BnvOhuO62LdD7tE6rkVTrq48DuDLaEi8wz2QfqdH2gp6ZnPPvFtZFjh6q_mp1k_1W3_iKkbT6EwnJqKQwRjOhP_TChG36XpSNJ1RnxB-VFch-Pb6ftjwkbQo8sGmIX8tuVMzGDNlmky00NoE0h9-CfWozyJ-Ah77jIQejkSIEU1VEAoQ3LYMfnXeSH6_mOJvqg9nN_ZaZds_U0=w696-h927-no",
    "https://lh3.googleusercontent.com/vJm5uFzibItls1xSgo6ckfN7YOGJcfPiStd8FwD475-daV8MPzOajvCv5258HrlFG_GjpNYY1sQ2EUNsdWJPlrREmvO1KzPqVnHfCQB-DG8VKtxtx67n0qnBtp51Sy84-mg62WIXtU0qrggmLplAYU8C2OMoiqX1nCX0HPWEeo1GqsMNpO9IY2ufJkpBmJPR4mMBkZOpQeqnzzDPxKmJbNZUmW9UIOzesFMVuqqpnwTxr12LOZ7kpnn1z4XCTwUyH12vIRXnY_NpLC0dbeANfact_4ib46as4VuPfaY98t00JHJkuO3W0z-s9v9bgMFfpI-3CtBYy00gT9qrl2FP-Q__FRA2Vigay4lLvN1hSFzwVE8SKFUHsu1xyhBVAoA8SxKPCU9wjHeSUtqcb5WWeNHWTI2ce2CRhxsbo_Pteg5BI-livr0CCWULh8MkjhCF9DFIh8KAU-CmWBiVgIqCk9iQFKxpmehiHhxuSYjBXytpce1rj6yOFnoPSe_CBWwJAczHe_SXpLdn47Pkw-BRuMMFq5Lx4Hll3mTBO_ckcIGQh0koNvmVjQ9zpfntQhckkWaJWSch_0WGW0_S6ezIzUzZm8Sf2X7Tg-kVOv3-oELjeDRgTg4iHLqYM6pTQ871r9tCk6GuVQMXbY9hkvDjpt1AoCZUqgaH=w1236-h927-no",
    "https://lh3.googleusercontent.com/tHW4HBppWE5taWab_XaSg4WSdFaOrZJKDrNj2PndcqHyX7bbQgugjhOT1LXi1A4WzmuPIwe-n8mJf_3CvvWLPZPSmUhtvKVaFuqNBvEgmrweTV-IeUl7sAejukomUpokXW9-058uThT6c-Uv7LdrVmMWP7dNUjO1AKxZhyIbDI2Sig9gZXJr8mg-IhwHwuYZw0iilTswZgCWbjIft9IgdDeqiSq0Z0fqyvcQ1KR1si1xaTDfKOsOkphjJ2NjHGY-uFjZ2eWEFqcy-EtPZg1z2HnHfLIacW-Op_ocpYLv-cV9hi4muuw8q0W96g9fzu_AoR_ubXgeUGStTkVnBeOpYFMjM78mvcx6C9Zis-4Cmqa38Z03403c2MGDZHuerymgoGlrpjonoMBMKhAXoEaxFHRG6lT4U3bYR-9ek3BfimOCLUqKv93_5byWuuASseR6aobCIBmjYl1S9WpHKc0YIf4hICnUb9fdwENTXD2nx1th3KtZGkergTh63Ut-yjBSNVDyrv9HRPEOTNWPb9sZd6AgT55uuCDykJZ8BvaZODIIqrBST_Qvh0ThyhXs1sQzPEmcezvrWeY_y8fRRJpsxYLItF9bi25AoWqEdhnBkh18Qu9DLRO3Cy11l0gxpAaP-fJnbwg4rmbleixMIT4S5LfItWJ-aldq=w1236-h927-no",
    "https://lh3.googleusercontent.com/9DyuS54yGaJFaijVz4EmSySQ1fs6sJU975rVq0EIFmFnAvSgon2r-2fEEv4OrHC0uxqJD3gFVk8u_leOuzys6f-fXx957lCibeoU9QYTAssT5K8RfugIjWeBFYzpiG-YIijDN2WoLmnN7RWQkuyBojNtSoBggR_wc5-i4_LytjguQxo8nFEPM_sN7mRdf_-E_AN7KQIzfAWzLk-RDZvyz0W5EGPjV9-5juIagjtWhbh_bfAkdFDtq-zgD61EZWyb4wIYO7LbRAL8m7XnB9RWzm1K-sVxByUoxlLIJTIpHSvo7053QIBvKxUccQp4-chRxKFqKnvBTnwkCSsPgsY5wSbxsgXanyhuZap5HNPRJLrA8RO1KLbMoMku6xJQXQ6lMNAlTRCDC13oUTxGSDixDHT7Z0xYcWadqJMFgm6QLvyq9ea2-p54CR2m5ZppK8jnWWDDzMU_m2wB4P5BV_Jttr0RaQn5HVqF9mq5TIQs6p0CAiD8WQEkW-jBedMdx8WWe9EXD7WejaFM1E60GoGk4gr5ZUfUS_mc5HcOx_LgB-00JMhBqTpRyAsW8NGJfkL2yXFRh6eo_sZCjCnZpJCCFIldQv7izKco94U46eD9kOSzNeVibLL0HR7TAvYDY8IDerQt3bvLhHbOwH7psJ5fPQ7DcqUEYnX2=w1236-h927-no",
    "https://lh3.googleusercontent.com/58zTo9rU5mKK1uz6DZZNBvUn7mMwkDqM3d43okGcNe5WHD4cdFYaBupFzXogSpiRY5F8ShoekE61Wh_v0FxpoLWuk-kPgOg8VonAfoAK3h3X8ubB9lhNjKWNtvPule0PBSoegVAkzumOA2cK_usLZ15NqNtDQxP_VSCC4njfxO-rQKLaaD4FiwRbmHLQ4-rzrYneCz27ksEiKvXUHHkxvwnriEubdpqzljzbrUElKWJQOqNZMASlEDg1uHssdYlPS48Bdw5u4rFv4g-HyiIL30u4irsQ9_UFaPmIg3_uzXfjklPGJrT7_9A43bSqJJ4sd7_pgEDRG0YeySXFV91-mzG3uyEitzYDlQZchftfv8SMQuhtB92zntBcQCybxvEY-HOzW9eDsN0gvCbk5fC9h5j9GoNPqTyE4bYknN9464U1cSkWkGnm-Xrztz472aSSoI5rHPpwRM57LdKdh4jnNvRCkS304esapzL1ta-ASrbKJHhXgfcdtIcrMiwP7hOGdTAkqana917bKbodDuqHTNcuNfIrSh7eiKKAJAzZVNv5-yg-Vd2MIxmJWUR6ZTHF5oljLv4-nYHXcJKfvlp2naHINRatIYMaBaBLpE3RAIM0rElpbzvPINacUuILW_ffsBumNGv2ivb7trino2huxAYLGcqzw2_U=w1236-h927-no",
    "https://lh3.googleusercontent.com/d6-SkOdXt-DoiPKmiQNF0n3-QqOnH5pl6RbEUi4RjHt6JnrxNu798NkJwY9k8W0PI2XtdM23HcHXyOt9Bzjq7B3ObNRArJiJSgL2fQP7BMknmSw4WvFS-us-IIACZhgci4aeNxlV9Tfb5xF46JwapPd3MixXVqQz7_5_gW8g36aAVV_qfQRHaTLbQ9pWmKneHs2ujjqAiNGVB-jaodMSzEwuEKIYTkGbS9_9vH7a6Y3cEtbcKI6nVZyjzBNyAW3PUIttTnCnx2h7jdE3Wnk-IWk_hAF-Wtx3pLhpIkfIYbXSO25NyYdULoJsWXeySh7f1sVl6Th1SGJqf_9Vi-J_7S_BA9ylZq1hBiYaQyYAbDuoYCi3wNxMQ5KzSH2eaVE6GIR10eUhyh75RVNQMfhd2J7zXpu2i8rJIL_c4P11-brfv4PKJonZnMMfl3QQ0s3eZbs8IO2WeI_Gv2a5mA-cthk2kIFbMfYOEQeDC1GVFBtmBSh4WDtsmsHMHzrafVYhj3hNHW-4XWjvgILZMrnO0tSXOLkNuA7CfqIZriEnfjW_K8ejaXH8WPNKBlAxirYBs2-NA30QKAH154Wwto0QdmIzgKYpkZx9I_nfNl96bTbnelh50hMFM70zj3CuP9SGeTHPMlykQbvPKMvWJge5Y9QA3pcG7lTj=w1236-h927-no",
    "https://lh3.googleusercontent.com/q03n1yovwPZK-v3zKVztn5CL0t_JwmRBFktA11QSXbjjQNHsEQaQQ5QIlIGPR57DUUSL4ZbQzPNoGcWXKNDVItNjJzI_mRjZe7SMa5HrLS2_MhydecD0acNstUTgn81Dw1dnz-1HsquQGkvsNceSKeZLl545WEDCkGLX4TBpuVTtyvpfJa371W7OOviJJ_OwdVB-XdFLL9h4VfgM48SJltYrNGTYRK8EkGu8oxz43FjNMKJYJLGecOm4iVRzKlIjltVI_JkcDeHmbL-fP1FtMs0buNHrxTfs6i9lQY1eHjyBVDyj0s7_qVE7nC_t5247GbB3yN8d5O-ra1n4cCeYgmfdj12iZY8v93a8jpKKvufQl90XikAdzVhe2XZsC-GuW3UgmRHQXq0TEXz6p1RbEbr7CTTXOESW6fOKQDqs_MI_GyOdjF7CPmzwNV9wtyIivn_vwaXA7aM7YE6rpsU2L-Nh2NEK_NKdfxdGq38lcXW5lgkrNjyOQqYZgBo1jn_e-nb3VqKabZHU8bXBIs-7ZK84t6QRKecPofR8PEGNAbm5l72mJJtiUMuzbcn6-EZNHBEUbKbjYc-TLtnDkcs4-5PAeqxLFCJdHZfGdpkJToTP-UOW6ROlhDRSXitL6zg_VHimo2RV7IW4vHP7sK5MylckO8ilP8YZ=w1236-h927-no",
    "https://lh3.googleusercontent.com/ieqnVyxrIn43cC9Ynj2PJuQzpYSqrXlFr4ImuB_0muG5rlxZ9g2G0dVjj3MkjvaeV2_hZGxzXOji6lFSOXpzYMjgK-Uv39T0RjTP2PaESnEU8TYX14WdXmIl74iDeY66RaOrzzDzMgvjo_-jZcL3xYhfuTPwBO4xztRv8F5gR_1C8x4dkhX_ZPaU0lmV33ww5ZjMMjuJwmzmxfqg-G6AGgVHi8eNBXrKW1MDMHPVhO27au_sZsFceP8DRQKvjVBjXplmNffgBcIwEaXUqfijPTrX3f7tMUQRKMoqZHz-XKi1F7Dmn7hFZOE6_ekXTqKQ8rz-F0W7HOVROhDJNoZSskwlgtBm69gQFpEtCruwdfawd3jRra-N1HLT3kaBIN8eXea0DgRjMZknA84NHyTbw706dBLAZfd-DDz3GvfPERQSvP4XPPIyyivccMVsPSW1dDiVqxEXlGnhNxHhhQyCwf5ugefITQ38XgwHeL7DOq9413BLC8hCi44YHaTO-rFYZJUqVRJbzYWZhDjHqBFs3HCtb-iUZqnOuklIC-26INhXLeEaQhPwGIl0ElJWkuMPk0FxaLY1ZO5hGdAne2gAOdiaDzzTZCubBwU-CqvPWSYoetBVGF1uPuzsqxmhdjZkt9tlHN_pgin_5BvTLhYS5y5hdxtqxDGv=w1236-h927-no",
    "https://lh3.googleusercontent.com/q03n1yovwPZK-v3zKVztn5CL0t_JwmRBFktA11QSXbjjQNHsEQaQQ5QIlIGPR57DUUSL4ZbQzPNoGcWXKNDVItNjJzI_mRjZe7SMa5HrLS2_MhydecD0acNstUTgn81Dw1dnz-1HsquQGkvsNceSKeZLl545WEDCkGLX4TBpuVTtyvpfJa371W7OOviJJ_OwdVB-XdFLL9h4VfgM48SJltYrNGTYRK8EkGu8oxz43FjNMKJYJLGecOm4iVRzKlIjltVI_JkcDeHmbL-fP1FtMs0buNHrxTfs6i9lQY1eHjyBVDyj0s7_qVE7nC_t5247GbB3yN8d5O-ra1n4cCeYgmfdj12iZY8v93a8jpKKvufQl90XikAdzVhe2XZsC-GuW3UgmRHQXq0TEXz6p1RbEbr7CTTXOESW6fOKQDqs_MI_GyOdjF7CPmzwNV9wtyIivn_vwaXA7aM7YE6rpsU2L-Nh2NEK_NKdfxdGq38lcXW5lgkrNjyOQqYZgBo1jn_e-nb3VqKabZHU8bXBIs-7ZK84t6QRKecPofR8PEGNAbm5l72mJJtiUMuzbcn6-EZNHBEUbKbjYc-TLtnDkcs4-5PAeqxLFCJdHZfGdpkJToTP-UOW6ROlhDRSXitL6zg_VHimo2RV7IW4vHP7sK5MylckO8ilP8YZ=w1236-h927-no",
    "https://lh3.googleusercontent.com/ieqnVyxrIn43cC9Ynj2PJuQzpYSqrXlFr4ImuB_0muG5rlxZ9g2G0dVjj3MkjvaeV2_hZGxzXOji6lFSOXpzYMjgK-Uv39T0RjTP2PaESnEU8TYX14WdXmIl74iDeY66RaOrzzDzMgvjo_-jZcL3xYhfuTPwBO4xztRv8F5gR_1C8x4dkhX_ZPaU0lmV33ww5ZjMMjuJwmzmxfqg-G6AGgVHi8eNBXrKW1MDMHPVhO27au_sZsFceP8DRQKvjVBjXplmNffgBcIwEaXUqfijPTrX3f7tMUQRKMoqZHz-XKi1F7Dmn7hFZOE6_ekXTqKQ8rz-F0W7HOVROhDJNoZSskwlgtBm69gQFpEtCruwdfawd3jRra-N1HLT3kaBIN8eXea0DgRjMZknA84NHyTbw706dBLAZfd-DDz3GvfPERQSvP4XPPIyyivccMVsPSW1dDiVqxEXlGnhNxHhhQyCwf5ugefITQ38XgwHeL7DOq9413BLC8hCi44YHaTO-rFYZJUqVRJbzYWZhDjHqBFs3HCtb-iUZqnOuklIC-26INhXLeEaQhPwGIl0ElJWkuMPk0FxaLY1ZO5hGdAne2gAOdiaDzzTZCubBwU-CqvPWSYoetBVGF1uPuzsqxmhdjZkt9tlHN_pgin_5BvTLhYS5y5hdxtqxDGv=w1236-h927-no",
    "https://lh3.googleusercontent.com/E-B8-SHYxqH7Iks8yn0Flrs8t5199wwc6b3TpTN8Ua6g948nKsU69AV3_Padd6lU1NAEyHPC2kz5yCOqFQcQGCnna5xpzJY8md9oMqmQZpFn_fyxRTAuRwupg6uHrtUBN73TlBrmmaMNWUWW7QBiigBcu9yuScQcutcisBrZJOusx4D9HrXCE0oNkwqUxoYXXRrzVrCQPNZfHE1jolCQ-btGBiIWHC1XDIoSpSHLgE3QKkdunCBFdqRGWzEyzgjS0XSS6YvsKEaCyWQ2qTuQJ_g6JVeZZMp1s0BBXlis9N6bMdq6JEJ-roOTpuhAvJJFcI4mKrRBDijPuyA2Uigw7nyrbcnIKYfUdLnko2vwhtkMf5X3C5MaCx5UNNtMg9CSfpijjXLzLGrhN4F2mP8X--_U-nF6F2q8XQLyEfpcwFVnkOD35YEYvJulBvyClNqgM5ZHbtz3c9vbv0evio7zR7ojPD4l6bS26hrc-O9doK9ZVUMLP5D86OQbM470Qh-zrk2oX9qG8J1eZ9CYqvfSN_GPnXFt-kxIf_eLGYPFJGsW6-2m3jBnZwtbPDdKHGYJ7tm7DbPduDP486MxISM1cSinQr8d1PvlwkyEcMx_9Cc5uQDBOpE8rBf0E9NgyLo49d4FJvLZayupjqRZRB2s6KMrIpWZR157=w696-h927-no",
    "https://lh3.googleusercontent.com/37WfuwG9RdRdfFqwHOgnyyXFMTEyX6-fYUccoYrh3pSrM8A8Ffea7aCUMmyUstBnd47xBhMY5zc_BiUCJf9nb23mDNZ5VvRlguv4PG8vU-YgBxI992iz77YJij5OTPA-d-5osreSCZygP1UThC9JXkrx8jGxiL_6UYjbG7WMCgqUu5uEPs7MtxU3DkF0jYj0xPEZUen-tNdMQat8nFupvwAU-S5la4q4LGdxPZyajvbsl_AkicyPzQrGiqjsZrYEhM1WANVAHoxR6goGG4Adrl6r-PdvW0gx11rWG-jgHZ9B5rzS-RMAxEyMJ6giGa3ivcAQeB-FfN_6Qulr13hd7nIdyzkGim-_gbsWKc5rAdbIfwzOYLOg-lIx2ZYPbCBoEL65kb2QhKj9rwbp0mHgvqqu1JjB4dGIOOpTAVemJAVL9Ipmbb9Pk4mSM1GhkiQ39E-4OJZxXfDhireEn7bFpm7NprzLo9VWl_eqnZ6F7ND3a9x5ZUCsXJipdNjQWYxyB7eJa9aiop1CyWvfTFDIIjVI-e5oMUW3TrATJcDSLzFH56vzTlI6JUeUFaqDtGhp49tDgx5My9FBBLTaFfu_JAwYojle1hPs8IBo_WTy_Ep1TnWujaOO87LIJaGpZQ3fKVM91o4Ai4JZRvligrUdgACKkGcrMbWQ=w1236-h927-no",
    "https://lh3.googleusercontent.com/X3tVbHAZnMGDJeTSW6P3f0nsfWk4_pMVDrWpM5zp5Bm0kkIL8Fuu08KZdil3sOpHK5i3_r0kFlVc9-QITSK3mH7-rvgp8ll4OhlF_RKnwM-01R1G00XYd7HlgjgNkiqSZZnZOl0b8PdjcQSJMe6ZOb7zL67WRY-OmoUF49nqjc0sSDrwaVbpkIfUYiOeFr90nqQbn_vB81FHCwAWFPdF5Ch5M18qVKN7d8uxePwZp6p_5z3k5EwyRtc7_APqAkFx5UDJD2ld0rAUrz3s7nGX2gm_9AqX8z9hIW_Y4IZrNobv7gegXoSAKBT7NGXN3hhHMo5fKp_gdm4y_E5uLbghfCbXAPtiDQSQLPzVN0898kypAtGmK81uAq1oZl4WqiywMffZoLKchqu5xAee9ashEbdAY_lcEALPuUD692S_nODPk2uOmNl36z6OnGMBzYLDALy44_xcCmZ2krlzNFhIjkwjKucLu47K0l9G3CHxFnIG3aJEGwL-_w3Mqdwe0w1mh8U5Ck0m0-mqRDw1a24n855DAfJVV44ohri0TT5D3NLLW9yU6PpOIEwEn7pCZrResxGLg95zJTRW0cB2xCvrdgB4X0SX2ayyhtLicbm6QHB-nKliWzsEbMg_vLVTiG92xd14bDkCbWnCSH11NfnyMOLhxowvGOnq=w1236-h927-no",
    "https://lh3.googleusercontent.com/rNAtlbCT4_CxozV7I3evFSZ4KWz0SY6W3scY6s5df0jCEIqitKPqOIspLzprCNk4El88MYAVOw8-Ys8Vt_ppa0F9yHHGcq8K7KHUTXd2D2_qFizxdPWAKDiJMc5MtYzLrnAees16B_rPaDFKtcMN6LCZ0iL2la3npEo21qN1WFljWfapy5ZKpJeQgRuuyhbLWNq5-1a1Ai6-hSIuNT-ohXp6SRqZdAwRPIh-tIJWZDV5Nx8Ws3vOlHyO0T3mlt2xWwbqhXiFjGfbI6McXb0j3EsJLALAUSBRJsRHcfmqwj5ykReGmzjO2gUar0vEosrphkEk5gnyCbZbriIStUZH82TK7i3Pln0MwH21BJqIxYk39-lx9QeXizaNFS6tREmaYE3FJxSMdA-DIovZ_LoNS2HwTH6NarS1PvEtfu62YfjfMOmrvYC1dGBCEmz7JVl5G1lsqEmZrwBVpFYU_oCzM6pG-9TQGRD1P4wWwLMg86SU2G6xDDONNcBL2M2moIBiKn3eT1VubVbtbfKdvakkc32M-pGhos7dIMvdIunG7vNfMg9AT9cq0tJiZeiYCZu6PeBoa0RfR2OdxQr-2-b5FvYmdQUqLx-uWNvwWJJs6Tbr3tF_yvmMMbxRNK2qwK6jTDQAftfortdR36U8VsStLsCXjQ6N_uB-=w1236-h927-no",
    "https://lh3.googleusercontent.com/8xAiXGbeTzWDp1qKjU1tlwDM0bqPHG_lKlTG78OOVDnKMoF_MD1rZ56IFm3i0MU-oUFFsti4L0T-FyTRo0MzLdH_Du55FSdq-5MiGQnC8AKSHOjQGsqGtKFXn67Vyt8wjrnWclk53vPZzxTE7d5FypwnZ5UmKlTXBe05nGrE3a8GIUnVebthHH6avjkEDWC2AIHWI_aA_gleTJkdADuhXURs0OwB9fIow1U4O11cLBVlJfPHvJbFcc65k-99DiHxdfQABFsbydnPbRNzypm-qvMCF6FyJSQfrwfmAHbH_Zjb8n5deGDUsDsr8Hwf_PjSdR2_GvH55iyOlNYQKYSf_mbQ7gIhRjaIZjSoHUhPK3-8ST_yDHjJVQo6xKyCrq-HQgPYoVWn-KmV5ATb8nRr5TGW1Ev7qxC0bp6N7sUNGDy5HDTM9obYRemDjJAV-HMBw2ovTIWxhhxlASdYUoOBG6UpgxvN-CTty9rH_IUqtz7to5yFVU_4LJLasF82PIiqs2suPznQSsa5NAiErEw2ns7_Y_5T0kLUbWuDtmrzXhuPXGThZkAo3V3JMfouAQldt4lqx5cHVWIqtkvlJ06mr_2NR6FPYR_ki2ocmxX8t72Ymm0qnfMI9PajRVmYCUbJc5D9uuiDtKeobICDJ5_imcPwyes8feeq=s250-k-rw-no",
    "https://lh3.googleusercontent.com/nSX_TuBEF555q7o5mEu3kSD5VH-j3vYeDI7_117ewA_FfRcwxIy3kcT-8jvTiUbVG6FsDBXa9WfnNWcCBl9pEHVUDDRyRRzKdFmvwKtl_-PUIWAu-UUM0hC2qscgXs7UrMFv5VVtw3CdAF-3gXSxDBTX1ASxxXQxUXmmCaMHbv7U716ryDMwBg3j3_mwXUrGbPInqpIR1iTAsmIKl5LOo3i0w9BeCrld1rUH5UD2xSjoyXJX0mlM4ywG0hC2whXCwl-gVutEkH6N3GmnMKrFfj5W5pHQ6Qbq1dGVDINOAX2UlIUuVVnuw7z-Gd9nY_oySE00nmexGALM4ffXl5qpktnB3nvyOLUeGenZqEfStR0bCOF9XXF3FgxyRW6IRCDSbvEemFVHxjHGdITXLPEdZRnEfwcbBmjacn4G77nhiNf5HeciNP3ym2qmSs9gbRouuPESeacvCZYY8zR-LLUIPfQ75XJH_vb8aZNZn_lkrz3BiSC8KU-8fRj0xRB66lCd-9tnrRfziv3w6XYKrrsoaMGe1sd-ISnqbysHMnGJAVsNBIZ9KQZfKVXYQBgydRTpsKK3j3EcMWLV737zOw5-BxCftMlnM9r7Gfhbqvvd6Bxv-POSrumfkiewmjFxDXar4xFqHcngeCMt5zxMFAIrl3WdRkxy6vx6=w1236-h927-no",
    "https://lh3.googleusercontent.com/fzNVAa0PgwMsDBEL_rLAoDDsmzzNqE0Uy1eXw4W3Qzvq2EYti7FxEYBLa5Y45vREbWqx90VtYw_2rxnbAtvKZOC8szRFM_cQr5NHJyH79Qtor_D4Uli9h62_JYhW_I9-kIkMjrqOpIooKMT_I3hlLbIaxf0RxVNUsdQQjkAghcDgvYFOcXTrNLM3KnRYRZOOsEGaq5Oj-lllabjz6FuK7ftX2XZT0pQlzHeN_wAy5SWDcYecO55UldtX8hvVzFbU-oo-ru_jZ3Owq2IJ0NhITKHpBg9EaGsl5RJczMpKtVrIX9d8d0cnyVWyqA7oRHREmPRmaq-JYQGWVeB8YmHZ8HhHCJcocvbFtDEcctCqY5adPvs8sOvw0-EFkNoY2gtryIw1kLkdUofzRUsVcCdgW8EBTmvepUWkx3ydi5PppyuHtxwk2LZHte3MvGU3YzMhRT3GfuzGrtx2TnOOQz6cfC4i_NCa9XHefECYzt0wZr7LoPjWu5Iz5HhJRh_ghv-JGOByt_FgplEfxArEntzseSvFi99-T7lC1kEcCDD_xTLQMN3Pckv7Vb8Ev1xKVSmeqHOiKG4W0YYdEU3BAIBTDYTnacmMsGxPK_FhsvCLFnhBVl2tTXxtMRix25r-cb0bkt7TRV_9O-z9IEXFMuDOGIUdekDceAoX=w1236-h927-no",
    "https://lh3.googleusercontent.com/sHYUlSEkv8AiBD09xK4hVo0qQr3SQ7VK-sBHBKP7GnRGeq0WoAUD1bRbIuG0-l4IIKSZlMg6hTeeHomdz9bUinzXg92SZ293L7dfiOcdAA7L6cJ1PQ2EZvq1ao6thpT_XAZkx_6sxl0jUf5SiSj1UC0XYLARpOjT8eAjH6iBYO5z0bNHMThBMyiRAH4Q0GNFGIzr0_uQPQKGl9pAAZzoI79Jb18zYJSMNKSrD9QYJ2QNt21G2ndNcRmZmqp6F_O6ZVxjFUrnPVF8ng2AQU9z65j9xwsBSTq6nWjT0bfFUII_dFKlRd93NhdLJ58f9Nyhggj8Ra60GQliJ1_1-SHJGbpmyF-JPWJJuyXAGdEmNSpK5LlgJNbR5JC32VysFkClYkbj_WLuG1I2cC40SsFW-7lI9Av9ELdImrSQX-BWEFF6Ht4V1RWYDh_IvwsdZFM7BwCoSsDoM008xmR7G_0kaAqauGXXfRd5Pmq7LLiTND3LItK2kG6wBIulMQ0v3MVLMk6RfuMFScYDTeM_U3tTU1rCKbHQkobHaFoeexXmTm5RwHTJDfOXKsERy-MOUd7bwUOM6WWdyop0dhSkCSZKoahE3h4zqplAuHi-7x1g0DrcUbLR-UQ7VehJxQyb_Rpw6jAlMS5vG7zm7npyvlSwO3Qci7jfrbhz=w1236-h927-no",
];

export const ourImages = [
    ...ourGoogleImagesHack
];