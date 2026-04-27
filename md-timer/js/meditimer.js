// @ts-check

export const MEDI_TIMER_VER = "1.0.025";
// @ts-ignore
window["logConsoleHereIs"](`here is moving-lines-1.js, module, ${MEDI_TIMER_VER}`);
if (document.currentScript) { throw "moving-lines-1.js is not loaded as module"; }

// @ts-ignore
const mkElt = window["mkElt"];

// @ts-ignore
const importFc4i = window["importFc4i"];

/** @type {IDBDatabase|null} */ let dbInstance = null;

const STORING_PREFIX = "MEDITIM-";
const modImages = await importFc4i("user-images");
// modSound.setStoringPrefix(STORING_PREFIX);
modImages.setStoringPrefix(STORING_PREFIX);

async function setExternalBackground() {
    console.log("---- setExternalBackground");
    const modPubImages = await import("public-images")
    const ourImages = modPubImages.ourImages;
    const numImages = modPubImages.ourImages.length;
    console.log({ numImages });
    let didIt = false;
    const setTried = new Set();
    let nLoop = 0;
    while (++nLoop < 50) {
        const iImage = Math.floor(Math.random() * numImages)
        console.log("trying iImage", iImage);
        if (setTried.has(iImage)) continue;
        setTried.add(iImage);
        const urlImage = ourImages[iImage];
        console.log({ urlImage });
        didIt = await setBackgroundImageWithRetry(document.documentElement, urlImage);
        if (didIt) return true;
    }
    console.log("could not load any external image");
    debugger;
    return false;
}

// Goals, per session and day
/** @type {number} */ let initialGoal = 20; // FIXME:
/** @type {number} */ let minGoal = 5; // FIXME:
/** @type {number} */ const dailySecondsGoal = 10 * 60;

// Done today?
/** @type {number} */ let secondsGoal;
/** @type {number} */ let secondsToday;
/** @type {number} */ let nFailToday = 0;
/** @type {number} */ let nSuccessToday = 0;



////////////////////////////////////////////
// images

/* Returns a random integer between min (inclusive) and max (exclusive) */
/**
 * 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let images = [
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


// After dom loading: FIXME: how does this work with the cache handler, do I get an "error"?
function preLoadImg() {
    const preloadImage = new Image();
    // FIXME: copy images by server
    const ourImg = new Image();
    let imgInt;
    return new Promise((resolve) => {

        preloadImage.addEventListener("load", evt => {
            console.log("preloadImage load", evt);
            resolve(preloadImage);
        });
        preloadImage.addEventListener("error", evt => {
            console.log("preloadImage error", evt);
            images.splice(imgInt);
            tryPreload();
        })
        tryPreload();
        // Image might not be cached so just try it.
        function tryPreload() {
            if (images.length === 0) {
                resolve(undefined);
                return;
            }
            imgInt = getRandomInt(0, images.length - 1);
            const imgUrl = images[imgInt];
            const a = document.createElement("a");
            a.href = imgUrl;
            const ourImgPath = "/img/" + a.hostname + a.pathname;
            preloadImage.src = imgUrl; // images[imgInt];
        }
    });
}

////////////////////////////////////////////
// Saving

function dumpLocalStorage() {
    for (var i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        console.log(key, localStorage.getItem(key));
    }
}
/**
 * 
 * @param {string} key 
 * @param {string} str 
 */
function setItemString(key, str) {
    console.log("setItemString", key, str);
    // docCookies.setItem(key, str, Infinity, "/");
    localStorage.setItem(key, str);
}
/**
 * 
 * @param {string} key 
 * @returns {string|null}
 */
function getItemString(key) {
    return localStorage.getItem(key);
}
/**
 * 
 * @param {string} key 
 * @returns {void}
 */
function removeItemString(key) {
    return localStorage.removeItem(key);
}

function thisDay() {
    let d = new Date();
    return (
        d.getFullYear() +
        "-" +
        ("0" + (d.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + d.getDate()).slice(-2)
    );
}

function createRecord() {
    const secGoal = Math.floor(secondsGoal);
    const secToday = Math.floor(secondsToday);
    const when = thisDay();
    const parts = [secGoal, secToday, when, nFailToday, nSuccessToday];
    const record = parts.join(",");
    return record;
}
function saveTimerHistory() {
    const when = thisDay();
    setItemString("meditation-" + when, createRecord());
}
function putMeditationLength() {
    setItemString("meditation-length", createRecord());
}


////////////////////////////////////////////
// let runner;

// FIX-ME: correct??
/**
 * 
 * @param {number} min 
 * @param {number} max 
 * @param {number} start 
 * @param {number} end 
 * @returns {function}
 */
function mkEaseInOut(min, max, start, end) {
    if (isNaN(min)) throw `Parameter min=${min} is not a number`;
    if (isNaN(max)) throw `Parameter max=${max} is not a number`;
    if (isNaN(start)) throw `Parameter start=${start} is not a number`;
    if (isNaN(end)) throw `Parameter end=${end} is not a number`;
    if (!(min < max)) throw `Parameter min=${min} must be lower than parameter max=${max}`;
    if (!(start < end)) throw `Parameter start=${start} must be before parameter end=${end}`;
    return function (pos) {
        if (pos < start) throw `Parameter pos=${pos} must not be before InEaseOut start=${start}`;
        if (pos > end) throw `Parameter pos=${pos} must not be after InEaseOut end=${end}`;
        const len = end - start;
        const angle = ((pos - start) / len - 0.5) * Math.PI;
        // console.log("angle", angle)
        return min + (max - min) * 0.5 * (Math.sin(angle) + 1);
    }
}
let secEaseInOut = 12;
let secAlarmTime = 60;
let funEaseInOut = mkEaseInOut(0, 1, 0, secEaseInOut);

// Check middle step size:
let stepEaseInOut = secEaseInOut / 30; // 0.2;
{
    let stepChange = funEaseInOut(secEaseInOut / 2 + stepEaseInOut) - funEaseInOut(secEaseInOut / 2);
    if (stepChange > 0.1) throw `step ${stepEaseInOut} is too large`;
}

// var myAudio; // FIXME:

const imgMeditatorSrc = "img/wikimedia/Curious_Meditating_Cartoon_Man.svg";
// FIXME: img=> embed, https://stackoverflow.com/questions/41195669/images-in-svg-image-tags-not-showing-up-in-chrome-but-displays-locally/43526391
let imgMeditator1 = mkElt("embed", { "id": "meditator-on-btn", "src": imgMeditatorSrc });

//// Loading as module now
// thePromiseDOMready.then(() =>
{
    let promImg = preLoadImg();

    // let pVer = document.getElementById("version");
    // pVer.innerHTML = "(Version: " + MEDI_TIMER_VER + ")";

    function fillInFooter() {
        const footerVer = document.getElementById("footer-version");
        if (!footerVer) throw Error(`Could not find "footer-version"`);
        footerVer.innerHTML = " v" + MEDI_TIMER_VER;
        footerVer.addEventListener("click", evt => {
            footerVer.style.opacity = "1";
        })
        footerVer.style.opacity = "0.3";

        /*
        let footerQR = document.getElementById("footer-qr");
        let popQR;
        footerQR.addEventListener("click", async evt => {
            const modQrUrl = await import("qr-url");
            modQrUrl.popupShare(undefined, undefined, 10000);
            return;
            if (popQR) {
                popQR.close();
                popQR = undefined;
                return;
            }
            const metaThemeColor = document.querySelector("meta[name=theme-color]");
            const q = await import("qrjs2");
            const QRCode = q.default;
            const color = metaThemeColor.getAttribute("content");
            let s = QRCode.generateSVG(location.href,
                {
                    "textcolor": color,
                });
            const XMLS = new XMLSerializer();
            s = XMLS.serializeToString(s);
            s = "data:image/svg+xml;base64," + window.btoa(unescape(encodeURIComponent(s)));
            const dataUriSvgImage = mkElt("img");
            dataUriSvgImage.src = s;

            const btnCopy = mkElt("button", { "class": "popup-button copy-button" }, "Copy");
            btnCopy.addEventListener("click", evt => {
                copyToClipboardAndNotify(spanLoc, spanLoc.innerText);
            })
            const url = location.protocol + "//" + location.host;
            const spanLoc = mkElt("span", { "style": "display: inline-block;" },
                mkElt("a", { "href": url, "target": "_blank", "rel": "noreferrer" }, url));
            const locDiv = mkElt("div", null, [spanLoc, btnCopy]);
            const title = "QR Code for web address";
            const body = mkElt("div", null,
                [
                    mkElt("p", null, locDiv),
                    dataUriSvgImage
                ]
            );
            popQR = new Popup(title, body, null, true, "qr-popup");
            popQR.show();
        });
        */

        const footerShare = document.getElementById("footer-share");
        if (!footerShare) throw Error(`Could not find "footer-share"`);
        footerShare.addEventListener("click", evt => {
            const url = location.href;
            let texts = [
                "🧘 The link below goes to a simple mindfulness timer app. " +
                " (It is a web page app so you do not have to install anything.)",
            ]
            let shareRec = {
                "url": url,
                "title": document.title,
                "text": texts.join("\n\n") + "\n\n",
            };
            let promShare;

            if (navigator.share) {
                promShare = navigator.share(shareRec);
            } else {
                const header = "Copy the text below and share it where you want!";
                let textsP = texts.map(function (t) { return mkElt("p", null, t) });
                const body = mkElt("div", { "id": "share-body", "tabindex": "0" }, [
                    mkElt("p", null, mkElt("b", null, shareRec.title)),
                    mkElt("p", null, textsP),
                    mkElt("a",
                        {
                            "href": location.href,
                            "target": "_blank",
                            "rel": "noreferrer"
                        },
                        // old version: "https://medi-timer-81281.firebaseapp.com/")
                        location.href)
                ]);
                const pop = mkElt("dialog", undefined, [header, body]);
                document.body.appendChild(pop);
                pop.showModal();
                promShare = Promise.resolve();
            }
            promShare
                .then(ok => {
                    console.log("share ok");
                }).catch(err => {
                    // probably "Share cancelled"
                    console.log(err);
                });
        });

        const footerImage = document.getElementById("footer-image");
        if (!footerImage) throw Error(`Could not find "footer-image"`);
        footerImage.addEventListener("click", evt => {
            evt.stopPropagation();
            // alert("image"); // btnImage
            backgroundImageDialog();
        });


        const divAbout = document.getElementById("about");
        if (!divAbout) throw Error(`Did not find "about"`);
        const eltCloseAbout = mkElt("button", { class: "x-close" }, "✖");
        // eltCloseAbout.id = "close-about";
        divAbout.appendChild(eltCloseAbout);
        eltCloseAbout.addEventListener("click", evt => {
            evt.stopImmediatePropagation();
            setMdState("initial");
        });

        const footerAbout = document.getElementById("footer-about");
        if (!footerAbout) throw Error(`Did not find "footer-about"`);
        footerAbout.addEventListener("click", evt => {
            if (currentMdState == "about") {
                setMdState("initial");
            } else {
                setMdState("about");
            }
        });

        let deferredInstallPrompt;
        let userSeenInstalled = false;
        const footerInstall = document.getElementById("footer-install");
        if (!footerInstall) throw Error(`Did not find "footer-install"`);
        footerInstall.addEventListener("click", evt => {
            if (footerInstall.style.visibility === "hidden") return;
            if (!deferredInstallPrompt) return;
            userSeenInstalled = true;
            footerInstall.firstElementChild?.classList.remove("fa-spin");
            footerInstall.style.color = "";
            addToHomeScreen();
        });
        footerInstall.style.visibility = "hidden";

        // FIXME: https://love2dev.com/blog/beforeinstallprompt/
        window.addEventListener("beforeinstallprompt", function (e) {
            e.preventDefault();
            deferredInstallPrompt = e;
            footerInstall.title = "Do you wan't to install this PWA so you can use it offline?";
            if (!userSeenInstalled) {
                footerInstall.style.color = "yellow";
                footerInstall.firstElementChild?.classList.add("fa-spin");
            }
            footerInstall.style.visibility = "visible";
            // log the platforms provided as options in an install prompt 
            console.log(e.platforms); // e.g., ["web", "android", "windows"] 
            e.userChoice.then(function (outcome) {
                console.log(outcome); // either "accepted" or "dismissed"
            }, err => {
                console.log("beforeinstallprompt, some error", err);
            });
        });
        function addToHomeScreen() {
            deferredInstallPrompt.prompt();  // Wait for the user to respond to the prompt
            deferredInstallPrompt.userChoice
                .then(function (choiceResult) {

                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the A2HS prompt');
                    } else {
                        console.log('User dismissed the A2HS prompt');
                    }

                    deferredInstallPrompt = null;

                });
        }

    }
    fillInFooter();

    /** @type {string} */ let currentMdState;
    setMdState("initial");


    window["smsInitial"] = () => setMdState("initial");
    window["smsStarting"] = () => setMdState("starting-meditation");
    window["smsMeditating"] = () => setMdState("meditating");
    window["smsStopping"] = () => setMdState("stopping-meditation");
    window["smsAsking"] = () => setMdState("asking");


    /** @param {string} state */
    function setMdState(state) {
        currentMdState = state;
        const states = [
            "about",
            "initial",
            "starting-meditation",
            "meditating",
            "stopping-meditation",
            "asking",
            "replied",
        ];
        if (!states.includes(state)) {
            debugger;
            throw "Bad md state: " + state;
        }
        states.forEach(s => { document.documentElement.classList.remove(s); });
        document.documentElement.classList.add(state);
    }
    function formatSecondsMSS(sec) {
        const minutes = Math.trunc(sec / 60);
        const seconds = sec - minutes * 60;
        let strSec = ("0" + Math.trunc(seconds)).slice(-2);
        return minutes + ":" + strSec;
    }

    function startAlarms() {
        playReadySound();
        startVibrationTimer();
    }
    function stopAlarms() {
        objAudio.pause();
        stopVibrationTimer();
    }
    let vibrationTimer;
    function startVibrationTimer() {
        if (typeof navigator.vibrate !== "function") return;
        let startMs = new Date().getTime();
        // console.log("start vibrate", startMs)
        if (localStorage.getItem("use-vibration")) { useVibration = true; }
        function vibrate() {
            if (!useVibration) return;
            let nowMs = new Date().getTime();
            let maxMs = 200;
            let durMs = nowMs - startMs;
            let durSec = durMs / 1000;
            if (durSec > secAlarmTime) {
                clearInterval(vibrate, 3000);
                return;
            }
            let ms = maxMs;
            if (durSec < secEaseInOut) {
                ms = maxMs * funEaseInOut(durSec);
            }
            // console.log("vibrate 1", durSec, ms)
            navigator.vibrate(ms);
            setTimeout(() => {
                if (!useVibration) return;
                navigator.vibrate(ms);
                // console.log("vibrate 2");
            }, 500);
        }
        vibrationTimer = setInterval(vibrate, 3000);
    }
    function stopVibrationTimer() {
        useVibration = false;
        clearInterval(vibrationTimer);
    }
    /** @type {number} */ let sliderVolume;
    let intervalVolume;
    function playReadySound() {
        objAudio.currentTime = 0;
        // let strVol = docCookies.getItem("volume") || "100";
        let strVol = getItemString("volume") || "100";
        // console.log("strVol", strVol)
        volSlider.value = parseFloat(strVol);
        sliderVolume = volSlider.value / 100;
        setDisplaySound();
        // https://davidwalsh.name/javascript-volume
        // console.log("audio", audio, audio.volume); // volume = 1, 100%
        objAudio.volume = 0;
        objAudio.play()
            .then(() => {
                let dur = 0;
                function raiseVolume() {
                    // FIXME: use Date().getTime();
                    dur += stepEaseInOut;
                    if (dur > secEaseInOut) {
                        clearInterval(intervalVolume);
                        return;
                    }
                    if (soundOff) return;
                    objAudio.volume = sliderVolume * funEaseInOut(dur);
                }
                intervalVolume = setInterval(raiseVolume, stepEaseInOut * 1000);
            }).catch(err => {
                console.log("Probably just .pause(), see https://goo.gl/LdLk22");
            });
    }
    function getMeditationLength() {
        console.log("getMeditationLength")
        // let s = docCookies.getItem("meditation-length");
        let s = getItemString("meditation-length");
        // console.log("s", "'" + s + "'");
        if (!s) {
            secondsToday = 0;
            secondsGoal = initialGoal;
            // putMeditationLength(initialGoal); // FIXME:
            putMeditationLength(); // FIXME:
        } else {
            let thatDay;
            // s = s.trim(); console.log("s", "'" + s + "'");

            splitRecord(s);
            function splitRecord(s) {
                const sParts = s.split(",");

                secondsGoal = parseFloat(sParts[0]);
                if (isNaN(secondsGoal)) secondsGoal = initialGoal;

                secondsToday = parseFloat(sParts[1]);
                if (isNaN(secondsToday)) secondsToday = 0;

                thatDay = sParts[2];

                nFailToday = parseFloat(sParts[3]);
                if (isNaN(nFailToday)) nFailToday = 0;

                nSuccessToday = parseFloat(sParts[4]);
                if (isNaN(nSuccessToday)) nSuccessToday = 0;
            }

            // Check thatDay
            let d = new Date(thatDay);
            if (isNaN(d.getTime())) thatDay = thisDay();
            console.log("after split", secondsGoal, secondsToday, thatDay, nFailToday, nSuccessToday);
            thatDay = thatDay || thisDay();
            let toDay = thisDay();
            if (toDay === thatDay) {
                console.log("same day");
            } else {
                const date1 = new Date(toDay);
                const date2 = new Date(thatDay);
                const diffTime = Math.abs(date2.getTime() - date1.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                console.log("day diff", diffDays);
                secondsGoal *= Math.ceil(Math.pow(0.95, diffDays - 1));
                secondsToday = 0;
            }
            if (secondsGoal < minGoal) secondsGoal = minGoal;
        }
        // secondsGoal = 6; // FIXME:
        let eltGoal = mkElt(
            "span",
            null,
            "Duration " + formatSecondsMSS(secondsGoal) + " "
        );
        let sec2dailyGoal = dailySecondsGoal - secondsToday;
        let eltGoalInfo;
        if (sec2dailyGoal <= 0) {
            eltGoalInfo = mkElt("span", null, "(Your daily goal ✅)");
        } else {
            eltGoalInfo = mkElt(
                "div",
                null,
                "" + formatSecondsMSS(sec2dailyGoal) + " to goal 💛"
            );
        }
        eltGoalInfo.setAttribute("id", "goal-info");
        let div = mkElt("div", { "id": "time-goal-info", "class": "center-children" },
            mkElt("div", null, [eltGoal, eltGoalInfo])
        );
        return div;
    }
    // const soundReadyLink = makeAbsLink("./sounds/freesound.org/260881__trautwein__cat-purr-add9.mp3");
    const soundReadyLink = makeAbsLink("./sounds/freesound.org/cat-purr-full.mp3");
    let objAudio;
    const timerDiv = document.getElementById("div-timer");
    // let imgMeditator = imgMeditator1.cloneNode();

    const btnStart = mkElt(
        "button",
        { class: "NOpopup-button", id: "start-meditate" },
        [
            "Start",
        ]
    );
    const btnImage = mkElt(
        "button",
        { class: "NOpopup-button", id: "btn-image" },
        [
            "Image",
        ]
    );

    const divInitial = mkElt("div", { "id": "div-initial" }, [btnStart]);
    timerDiv.appendChild(divInitial);

    btnImage.addEventListener("click", async evt => {
        evt.stopPropagation();
        backgroundImageDialog();
    });

    btnStart.addEventListener("click", evt => {

        progressBar.max = secondsGoal;
        // document.documentElement.requestFullscreen();
        setMdState("starting-meditation");
        // timerDiv.classList.add("hero");
        const perSeconds = 25.0;
        // const interval = 1 / perSeconds;
        // const interval1000 = 1000 / perSeconds;
        function startRunner() {
            const startMs = Date.now();
            const endMs = startMs + 1000 * secondsGoal;
            updateRunner();
            function updateRunner() {
                const nowMs = Date.now();
                if (nowMs > endMs) {
                    setMdState("stopping-meditation");
                    setTimeout(() => { startAlarms(); askAttention(); }, 2000);
                    return;
                }
                progressBar.value = 0.001 * (nowMs - startMs);
                requestAnimationFrame(updateRunner);
            }
        }
        function startIt() {
            setMdState("meditating");
            setTimeout(startRunner, 2000);
        }
        // objAudio = objAudio || new Audio(soundReadyLink);
        if (!objAudio) {
            objAudio = new Audio();
            objAudio.onerror = (err) => {
                console.error("Error playing", soundReadyLink);
                throw Error(`Error playing "${soundReadyLink}`);
            }
            objAudio.src = soundReadyLink;
        }
        setTimeout(startIt, 2000);
    });

    const lengthDiv = getMeditationLength();
    divInitial.appendChild(lengthDiv);

    const progressBar = mkElt("progress", {
        id: "progress-bar",
        class: "uploading",
        // max: secondsGoal,
        value: 0
    });
    const divMeditating = mkElt("div", { "id": "div-meditating" }, progressBar);
    timerDiv.appendChild(divMeditating);


    let imgTimer = mkElt("img");
    // timerDiv.appendChild(imgTimer);

    promImg.then(img => {
        return;
        if (!img) return;
        // console.log("using image", img.src)
        let root = document.documentElement;
        // root.style.setProperty("--bg-image", "url(" + img.src + ")");
        // root.classList.add("hero");
        return;
        imgTimer = img;
        imgTimer.style.transitionDuration = secondsGoal + "s";
        timerDiv.appendChild(imgTimer);
    })

    let pAsk = mkElt("p", { "class": "after-med-info" }, [
        "Did you keep focus on your breath?"
    ]);
    let btnFail = mkElt("button",
        { class: "popup-button" },
        // "Lost attention"
        "No"
    );
    // btnFail.style.margin = "10px"; // FIXME:
    btnFail.addEventListener("click", evt => {
        handleReply(false);
    });
    let btnSuccess = mkElt(
        "button",
        { class: "popup-button" },
        // "Kept attention"
        "Yes"
    );
    btnSuccess.addEventListener("click", evt => {
        handleReply(true);
    });
    function handleReply(success) {
        setMdState("replied");
        // document.exitFullscreen();
        stopAlarms();

        if (success) { nSuccessToday++ } else { nFailToday++ }
        secondsToday += secondsGoal;
        // saveTimerHistory(secondsGoal, doneToday);
        saveTimerHistory(secondsGoal, secondsToday);

        const change = success ? 1.1 : 0.8;
        const newSecondsGoal = change * secondsGoal;
        secondsGoal = Math.ceil(newSecondsGoal);
        // putMeditationLength(newSecondsGoal, doneToday);
        // putMeditationLength(newSecondsGoal);
        putMeditationLength();
        // const secondsLeft = dailySecondsGoal - doneToday;
        let secondsLeft = dailySecondsGoal - secondsToday;
        let divpThanks;
        if (secondsLeft < 0) {
            divpThanks = mkElt("div", null,
                " 🌺 Today you have now done " +
                formatSecondsMSS(-secondsLeft) +
                " more than your goal!");
        } else {
            divpThanks = mkElt("div", null,
                [
                    "🌱 Done " +
                    formatSecondsMSS(secondsToday) +
                    " today.",
                    mkElt("br"),
                    "🧡 " +
                    formatSecondsMSS(secondsLeft) +
                    " more to your goal.",
                ]);
        }
        const pThanks = mkElt("p", { "class": "after-med-info" }, ["Thanks!", mkElt("br"), divpThanks]);
        // const btnRestart = mkElt("button", { "class": "popup-button" }, "Meditate again");
        // btnRestart.addEventListener("click", evt => { location.reload(); })
        const xClose = mkXclose(() => { location.reload(); });
        const divThanks = mkElt("div", { "id": "thanks" }, [
            pThanks,
            // mkElt("p", { "class": "buttons" }, btnRestart),
            xClose
        ]);
        timerDiv.appendChild(divThanks);
    }

    const divAsk = mkElt("div", { "id": "div-asking" }, [
        pAsk,
        mkElt("p", { "class": "buttons" }, [btnFail, btnSuccess]),
        // divAlarm
    ]);
    timerDiv.appendChild(divAsk);

    const volSlider = mkElt("input", { "type": "range", "min": 0, "max": 100, "value": 100, "id": "volume" });
    let spanSoundOn = mkElt("span");
    let spanSoundOff = mkElt("span");
    spanSoundOn.innerHTML = '<i class="fas fa-volume-up"></i>';
    spanSoundOff.innerHTML = '<i class="fas fa-volume-mute"></i>';
    const btnSound = mkElt("button", { "class": "popup-button sound-on-off" }, [spanSoundOff, spanSoundOn]);
    let soundOff = getItemString("sound-off") && true;
    function setDisplaySound() {
        if (!soundOff) {
            spanSoundOff.style.display = "none";
            spanSoundOn.style.display = "inline";
            volSlider.removeAttribute("disabled");
            removeItemString("sound-off");
            objAudio.volume = sliderVolume; // / 100;
        } else {
            spanSoundOff.style.display = "inline";
            spanSoundOn.style.display = "none";
            volSlider.setAttribute("disabled", true);
            setItemString("sound-off", "true");
            objAudio.volume = 0;
        }
    }
    btnSound.addEventListener("click", evt => {
        soundOff = !soundOff;
        setDisplaySound();
    })
    // const lblVolume = mkElt("label", null, [btnSound, mkElt("br"), volSlider]);
    const lblVolume = mkElt("label", null, [btnSound, volSlider]);
    lblVolume.style.marginBottom = "15px";
    const chkVibrate = mkElt("input", { "type": "checkbox" });
    const spanVibTxt = mkElt("span", null, "Vibrate:");
    const btnVibInfo = mkElt("button", { class: "btn-1-char" }, "i");
    const spanBtn = mkElt("span", undefined, btnVibInfo)
    const lblVibrate = mkElt("label", null, [spanVibTxt, chkVibrate, spanBtn]);
    lblVibrate.style.gap = "20px";

    btnVibInfo.addEventListener("click", evt => {
        evt.stopPropagation();
        function makeVibrationInstructions() {
            const title = mkElt('h2', { class: 'info-title' }, 'No vibration? Check Android settings');
            const settingsNote = mkElt('p', { class: 'info-row' }, [
                'Go to ',
                mkElt('code', {}, 'Settings → Sound & vibration → Vibrations & haptics'),
                ' and make sure both ',
                mkElt('code', {}, 'Use vibration and haptics'),
                ' and ',
                mkElt('code', {}, 'Touch feedback'),
                " are on.",
                " (Also check that ",
                mkElt("code", undefined, "Do Not Disturb"),
                " is off.)",
            ]);
            // const iosNote = mkElt('p', { class: 'info-row' }, 'iOS Safari does not support the Vibration API.');
            const supportedNote = mkElt('p', { class: 'info-row' },
                'Vibration is only support on Android. And only on newer mobiles.');
            return mkElt('div', { id: 'info-vibration' }, [
                title,
                settingsNote,
                // iosNote,
                supportedNote
            ]);
        }

        // document.body.appendChild(makeVibrationInstructions());
        const bdy = makeVibrationInstructions();
        // const xClose = mkElt("button", { class: "x-close" }, "✖");
        const xClose = mkXclose();
        const dlg = mkElt("dialog", undefined, [bdy, xClose]);
        document.body.appendChild(dlg);
        dlg.showModal();
    })

    // const canVibrate = typeof navigator.vibrate == "function";
    const canVibrate = true;
    if (!canVibrate) {
        lblVibrate.style.display = "none";
        spanVibTxt.innerHTML = "(No vibration)";
        lblVibrate.setAttribute("title", "Your browser does not support vibration.\nTry Chrome if you want it.");
        chkVibrate.setAttribute("disabled", true);
        chkVibrate.style.display = "none";
    }
    // const divMaxInfo = mkElt("div", null, "Max volume:");
    const alarmControls = mkElt("div", { "id": "alarm-controls" }, [lblVolume, lblVibrate]);
    const ourCat = mkElt("i", { "id": "the-cat", "class": "fas fa-cat" });
    const divAlarm = mkElt("div", { "id": "div-controls" }, [ourCat, alarmControls]);
    // timerDiv.appendChild(divAlarm);
    divAsk.appendChild(divAlarm);
    volSlider.addEventListener("input", evt => {
        // console.log("volslider input", evt, volSlider.value);
        clearInterval(intervalVolume);
        sliderVolume = volSlider.value / 100;
        objAudio.volume = sliderVolume; // / 100;
        // docCookies.setItem("volume", volSlider.value, Infinity, "/");
        setItemString("volume", volSlider.value);
    });
    let useVibration = false;
    chkVibrate.addEventListener("change", evt => {
        // console.log("evt change", evt);
        if (evt.target.checked) {
            useVibration = true;
            localStorage.setItem("use-vibration", true);
        } else {
            useVibration = false;
            localStorage.removeItem("use-vibration", true);
        }
    });
    if (localStorage.getItem("use-vibration")) {
        chkVibrate.checked = true;
        useVibration = true;
    }


    function askAttention() {
        setMdState("asking");
        // imgTimer.style.display = "none";
        divAsk.scrollIntoView();
    }


}
// );


function pickImage() {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.addEventListener('change', () => {
            resolve(URL.createObjectURL(input.files[0]));
        });
        input.click();
    });
}

/**
 * 
 * @param {HTMLElement} el 
 * @param {string} url 
 * @param {number} retries 
 * @param {number} delay 
 */
function setBackgroundImageWithRetry(el, url, retries = 0, delay = 1000) {
    // resolve
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            el.style.backgroundImage = `url(${url})`;
            resolve(true);
        };

        img.onerror = () => {
            if (retries > 0) {
                console.warn(`Failed, retrying... (${retries} left)`);
                setTimeout(() => {
                    setBackgroundImageWithRetry(el, url, retries - 1, delay * 2); // exponential backoff
                }, delay);
            } else {
                console.error('Gave up loading:', url);
                resolve(false);
            }
        };

        img.src = url;
    });
}

async function selectAndSaveFile() {
    try {
        // Ask user to pick a file
        const [handle] = await window.showOpenFilePicker();
        const file = await handle.getFile();
        // debugger;
        if (!file) {
            debugger;
            throw Error("SelectAndSaveFile: !file");
        }
        await saveBgFile(file);
        return true;
    } catch (err) {
        console.error('User cancelled or error:', err);
        return false;
    }
}

async function saveBgFile(fileBg) {
    const db = await getOurDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('images', 'readwrite');
        const store = tx.objectStore('images');
        const putRequest = store.put(fileBg, 'savedBg');
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

async function getSavedBg() {
    const db = await getOurDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('images', 'readonly');
        const store = tx.objectStore('images');
        const getRequest = store.get('savedBg');

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

/** * @param {boolean} useMy */
function setUseMyBackground(useMy) {
    setItemString("use-my-bg", useMy.toString());
}
function getUseMyBackground() {
    const strMy = getItemString("use-my-bg");
    if (strMy == "true") return true;
    return false;
}
// --- On page load, restore previous file ---
async function restoreFromLastSession() {
    console.log("++++++ restoreFromLastSession");
    if (!getUseMyBackground()) return false;
    const savedFileBlob = await getSavedBg();
    if (!savedFileBlob) return false;
    const url = URL.createObjectURL(savedFileBlob);
    document.documentElement.style.backgroundImage = `url(${url})`;
    return true;
}

// --- Background ---
setBackgroundImage();
async function setBackgroundImage() {
    const restore = await restoreFromLastSession();
    console.log("---------setBackgroundImage", { restore });
    if (!restore) {
        setExternalBackground();
    }
}

async function backgroundImageDialog() {
    const btnMy = mkElt("button", undefined, "Select");
    // const xClose = mkElt("button", { class: "x-close" }, "✖");
    const xClose = mkXclose();

    const chkMy = mkElt("input", { type: "checkbox" });
    chkMy.addEventListener("change", evt => {
        setUseMyBackground(chkMy.checked)
        setBackgroundImage();
    });
    const lblMy = mkElt("label", undefined, [
        chkMy,
        "Use my image",
    ]);
    lblMy.style = `
        display: inline-flex;
        gap: 5px;
        flex-wrap: wrap;
        align-items: center;
    `;
    if (!await getSavedBg()) {
        lblMy.inert = true;
        setUseMyBackground(false);
    }
    chkMy.checked = getUseMyBackground();


    const divMy = mkElt("p", undefined, [lblMy, btnMy]);
    divMy.style = `
        display: flex;
        gap: 35px;
    `
    const divInputs = mkElt("div", undefined, [
        divMy,
        xClose
    ]);
    const bdy = mkElt("div", undefined, [
        mkElt("h2", undefined, `Background image`),
        mkElt("p", undefined, `
            There are a number of background images
            that are randomly choosen for you.
            If you prefer your own image you can select
            it here.
            `),
        divInputs
    ]);
    // bdy.style.outline = "1px dotted red";
    // bdy.style.border = "1px dotted green";
    // bdy.style.padding = "20px";
    const dlg = mkElt("dialog", undefined, [
        bdy
    ]);

    // FIX-ME: delegate
    dlg.addEventListener("click", evt => {
        evt.stopPropagation();
        // bdy covers the whole <dialog>
        const target = evt.target;
        const currentTarget = evt.currentTarget;
        const onDialog = target == currentTarget;
        // console.log({onDialog});
        if (onDialog) dlg.close();
    });
    document.documentElement.appendChild(dlg);
    btnMy.addEventListener("click", async evt => {
        evt.stopPropagation();
        dlg.close();
        const newBg = await selectAndSaveFile();
        if (newBg) {
            setUseMyBackground(true);
            restoreFromLastSession();
        }
    });
    // xClose.addEventListener("click", evt => { evt.stopPropagation(); dlg.close(); });
    dlg.showModal();
}

// db.js - Single source of truth

// /** @type {IDBDatabase|null} */ let dbInstance = null;


/**
 * @returns {Promise<IDBDatabase>}
 * @throws
 */
async function getOurDatabase() {
    const DB_NAME = 'FileHandlesDB';
    const DB_VERSION = 7;
    return getDatabase(DB_NAME, DB_VERSION);
}



// FIX-ME: separate file?? Switch to idb.js?? (dexie? Not needed here, of course)
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
            if (!db.objectStoreNames.contains("images")) db.createObjectStore('images');
            if (db.objectStoreNames.contains("handles")) db.deleteObjectStore('handles');
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


/** @returns {void} */
function closeDatabase() {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
    }
}


/**
 * @param {function} [funClose]
 * @returns {HTMLButtonElement}
 */
function mkXclose(funClose) {
    const xClose = mkElt("button", { class: "x-close" }, "✖");
    xClose.addEventListener("click", evt => {
        evt.stopPropagation();
        debugger;
        if (funClose) {
            funClose();
            return;
        }
        (xClose.closest("dialog"))?.close();
    });
    return xClose;
}
