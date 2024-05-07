// @ts-check

/** @typedef {number&{_tag: 'TSmilliSeconds'}} TSmilliSeconds */
/** @typedef {number&{_tag: 'TSseconds'}} TSseconds */
/** @typedef {number&{_tag: 'TScounts'}} TScounts */

/** @param {number} value */
const TScounts = (value) => /** @type TScounts */(value);

/** @param {number} value */
const TSseconds = (value) => /** @type TSseconds */(value);

/** @param {number} value */
const TSmilliSeconds = (value) => /** @type TSmilliSeconds */(value);

/*
    Unfortunately the JSDoc parser does not ask the JavaScript compiler for info.
    So we have to add special wrapper functions to global function declared in
    other files just for this purpose. 
    Not a big job, but totally unnecessary.
    I will name them "TSoldName".

    Or? Maybe something like this instead:

      // @ts-ignore
      const mkElt = globalThis.mkElt;

    https://stackoverflow.com/questions/78436085/how-can-i-make-jsdoc-typescript-understand-javascript-imports

    const testDiv = mkEltTS("div");
    console.log({ testDiv });
*/

// const mkElt = globalThis.mkElt;
// const mkElt = window.mkElt;
// @ts-ignore
const TSmkElt = mkElt;
// @ts-ignore
const TSerrorHandlerAsyncEvent = errorHandlerAsyncEvent;
// @ts-ignore
const TSdebounce = debounce;
// const TSimport = import;
// @ts-ignore
const TSimport = async (url) => { return import(url); }
// @ts-ignore
const TSwait4mutations = wait4mutations;

const STORING_PREFIX = "MOVLIN-";

// if (location.href != "http://localhost:8080/temptest/test-moving-lines.html") throw Error("run http-server . in firebase-r10m1h");
// if (location.href != "http://localhost:8080/br-timer/moving-lines.html") throw Error("run http-server . in firebase-r10m1h");

const myGooglePhotos = [
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

/*
The window.requestAnimationFrame() method tells the browser you wish to perform an animation.
It requests the browser to call a user-supplied callback function before the next repaint.

The frequency of calls to the callback function will generally match the display refresh rate.
The most common refresh rate is 60hz, (60 cycles/frames per second), though 75hz, 120hz, and 144hz are also widely used.
*/
let numRedraw; // Protect about looping
// https://ourcodeworld.com/articles/read/1390/how-to-determine-the-screen-refresh-rate-in-hz-of-the-monitor-with-javascript-in-the-browser#google_vignette
const maxRedraw = 120 * 60; // FIX-ME: max 60 seconds 

// let secDuration = 19;
let settingDurationSeconds;
let settingDurationMinutes;
let settingDurationIsInSeconds;

let settingNumPatts;

let settingCountsPerSecond;
const minCountsPerSeconds = 80;
const maxCountsPerSeconds = 120;

let isRunning = false;

/**
 * 
 * @returns {boolean}
 */
function isRunningFun() { return document.documentElement.classList.contains("running"); }

/**
 * 
 * @param {boolean} on 
 */
function setStateRunning(on) {
    if (on) {
        document.documentElement.classList.add("running");
        isRunning = true;
        txtState = "Focus...";
    } else {
        document.documentElement.classList.remove("running");
        isRunning = false;
    }
}

let eltCanvas;
let ctxCanvas;
let eltFilter;
let useImage;
let modLocalSettings;
let ourLocalSetting;
let settingDawnFilter;
let settingSquare;
let settingYourPatt;

const breathPatterns = {
    "Awake": makeBreathPattern(6, 0, 2, 0),
    "Square": makeBreathPattern(4, 4, 4, 4),
    "Deep Calm": makeBreathPattern(4, 7, 8, 0),
    "Pranayama": makeBreathPattern(7, 4, 8, 4),
    "Ujjayi": makeBreathPattern(7, 0, 7, 0),
}
let settingPattern;


let currentPointY = 0;
let middleSecondsX;

const currentPointCanvas = {
    cX: -100,
    cY: -100,
}

let stopRedraw = false;
let numChecks = 0;
const textForParts = {
    holdLow: "Hold...",
    breathIn: "Inhale",
    holdHigh: "Hold...",
    breathOut: "Exhale",
}

function drawCurrentPoint(color) {
    const cX = currentPointCanvas.cX;
    const cY = currentPointCanvas.cY;
    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/ellipse
    // const cR = pattY2canvasY(0) / 20;
    const cR = currentPointCanvas.cR;
    ctxCanvas.beginPath();
    ctxCanvas.ellipse(cX, cY, cR, cR, 0, 0, 2 * Math.PI);
    ctxCanvas.strokeStyle = "darkgoldenrod";
    // ctxCanvas.strokeWidth = 2;
    ctxCanvas.lineWidth = cR * 2.0;
    ctxCanvas.fillStyle = color;
    ctxCanvas.stroke();
    ctxCanvas.fill();
}



// https://www.w3schools.com/tags/tryit.asp?filename=tryhtml5_canvas_textalign

// FIX-ME: aspect ratio and font size
function topTextFontSize() {
    return Math.min(eltCanvas.height, eltCanvas.width) / 5.2;
}
function clearTopText() {
    const size = topTextFontSize();
    ctxCanvas.clearRect(0, 0, eltCanvas.width, size);
}
function topText(txtTop) {
    if (!txtTop) return;
    ctxCanvas.strokeStyle = "yellow";
    ctxCanvas.strokeStyle = "black";
    ctxCanvas.fillStyle = "red";
    const clrPoint = () => {
        // if (useDawnFilter) { return "darkorange"; }
        if (settingDawnFilter.value) { return "darkorange"; }
        if (isRunning) { return "yellow"; }
        return "yellowgreen";
    }

    ctxCanvas.fillStyle = clrPoint();
    ctxCanvas.lineWidth = 1;
    // const size = eltCanvas.height / 5;
    const size = topTextFontSize();
    ctxCanvas.font = `bold ${size}px Arial`;
    // ctxCanvas.font = `40px Verdana`;
    ctxCanvas.textAlign = "center";
    ctxCanvas.fillText(txtTop, eltCanvas.width / 2, size);
    ctxCanvas.strokeText(txtTop, eltCanvas.width / 2, size);
}


function getAllPatternNames() {
    return [...Object.keys(breathPatterns), ...Object.keys(settingYourPatt.value)];
}
function findPatternValue(patt) {
    const jsonPatt = JSON.stringify(patt)
    const arrNames = getAllPatternNames();
    for (let i = 0, len = arrNames.length; i < len; i++) {
        const nameI = arrNames[i];
        const pattI = getPatternByName(nameI);
        const pattIpatt = pattI.patt;
        const jsonI = JSON.stringify(pattIpatt);
        console.log({ pattI, pattIpatt, jsonI, jsonPatt });
        if (jsonI == jsonPatt) {
            return nameI;
        }
    }
}


const cachedYourPatterns = {};

function getPatternByName(name) {
    const pattRec = breathPatterns[name];
    if (pattRec) { return pattRec; }

    const cy = cachedYourPatterns[name];
    if (cy) { return cy; }

    let yourRec = settingYourPatt.value[name];
    // makeBreathPattern(breathIn, holdHigh, breathOut, holdLow)
    if (!yourRec) {
        // debugger;
        return;
    }
    const p = yourRec.patt;
    const n = makeBreathPattern(
        parseFloat(p.breathIn),
        parseFloat(p.holdHigh),
        parseFloat(p.breathOut),
        parseFloat(p.holdLow)
    );
    cachedYourPatterns[name] = n;
    return n;
}

function tellCurrentPattern() {
    const divPatternInfo = document.getElementById("elt-pattern-info");
    if (!divPatternInfo) throw Error("Could not find 'elt-pattern-info'");
    // @ts-ignore
    divPatternInfo.style = `
                display: inline-flex;
                gap: 10px;
                flex-wrap: wrap;
                margin-right: 10px;
            `;
    divPatternInfo.textContent = "";
    const eltName = TSmkElt("span", undefined, settingPattern.value);
    eltName.style = `
                    font-weight: bold;
                `;
    divPatternInfo.appendChild(eltName);

    // const pattName = settingPattern.value;
    let pattRec = getPatternByName(settingPattern.value);
    // Check pattern exists
    if (!pattRec) {
        // settingPattern.value = settingPattern.defaultValue;
        settingPattern.value = getAllPatternNames()[0];
        pattRec = getPatternByName(settingPattern.value);
    }
    const strPatt = mkPattString(pattRec.patt);
    const eltPatt = TSmkElt("span", { id: "current-patt-parts" }, strPatt);
    // @ts-ignore
    divPatternInfo.appendChild(eltPatt);
}

function initCurrentPattern() {
    setStateRunning(false);
    tellInitialState();
    // @ts-ignore
    msStart = document.timeline.currentTime;
    console.log("msStart =, initCurrentPattern");
    redraw();
}


function mkBreathPatternsPattString(pattName) {
    // const patt = breathPatterns[pattName].patt;
    const pattRec = getPatternByName(pattName);
    return mkPattString(pattRec.patt);
}
function mkPattString(patt) {
    const eltBreathIn = TSmkElt("span", { class: "breathIn" }, patt.breathIn.toString());
    const eltHoldHigh = TSmkElt("span", { class: "holdHigh" }, patt.holdHigh.toString());
    const eltBreathOut = TSmkElt("span", { class: "breathOut" }, patt.breathOut.toString());
    const eltHoldLow = TSmkElt("span", { class: "holdLow" }, patt.holdLow.toString());
    const eltPatt = TSmkElt("span", undefined, [
        "(",
        eltBreathIn,
        "-",
        eltHoldHigh,
        "-",
        eltBreathOut,
        "-",
        eltHoldLow,
        ")",
    ]);
    return eltPatt;
}

async function dialogImages() {
    const modExtImages = await TSimport("external-images");
    modExtImages.setStoringPrefix(STORING_PREFIX);
    const url = await modExtImages.dialogImages(myGooglePhotos);
    if (url && url != "random") updateCanvasBackground(url);
}
async function dialogPattern() {
    const modMdc = await TSimport("util-mdc");
    const divPattList = TSmkElt("div");
    divPattList.style = `
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                `;
    const funHandleResult = () => {
        const rad =
            divPattList.querySelector("input[name=pattName]:checked")
            ||
            divPattList.querySelector("input[name=pattName]")
            ;
        return { pattName: rad.value };
    };

    const bdy = TSmkElt("div", { class: "colored-dialog" }, [
        TSmkElt("h2", undefined, "Breathing pattern"),
        divPattList,
    ]);
    bdy.id = "dialog-pattern";
    // const currentPattern = settingPattern.value;
    const builtinPn = Object.keys(breathPatterns).sort();
    builtinPn.forEach(pn => { addPn(pn); });

    // @ts-ignore
    divPattList.appendChild(mkElt("h3", undefined, "Your Own:"));
    const btnAddPatt = modMdc.mkMDCbutton("Add", "raised");
    const divBtnAddPatt = TSmkElt("div", undefined, btnAddPatt);
    divBtnAddPatt.style.marginTop = "-20px";
    divBtnAddPatt.addEventListener("click", TSerrorHandlerAsyncEvent(async evt => {
        dialogYourPatt();
    }));

    async function dialogYourPatt(existingPattName) {
        const action = existingPattName ? "Edit" : "Add";
        const bdy = TSmkElt("div", undefined, TSmkElt("h2", undefined, `${action} your own pattern`));
        bdy.classList.add("colored-dialog");
        let inpName, yourPatt;
        if (existingPattName) {
            yourPatt = getPatternByName(existingPattName);
            // eslint-disable-next-line no-debugger
            if (!yourPatt) debugger;

            const divNotReady = TSmkElt("p", undefined, "Not ready!");
            divNotReady.style = `
                        color: red;
                    `;
            bdy.appendChild(divNotReady);

            const eltName = TSmkElt("span", undefined, existingPattName);
            eltName.style = `
                        font-size: 1.6rem;
                        font-weight: bold;
                        font-style: italic;
                    `;
            const iconDelete = modMdc.mkMDCicon("delete_forever");
            const btnDelete = modMdc.mkMDCiconButton(iconDelete, "Delete");
            btnDelete.addEventListener("click", TSerrorHandlerAsyncEvent(async evt => {
                const ans = await modMdc.mkMDCdialogConfirm(`Delete pattern ${existingPattName}?`);
                if (ans) {
                    const yourPatts = settingYourPatt.value;
                    delete yourPatts[existingPattName];
                    // eslint-disable-next-line no-debugger
                    debugger;
                    settingYourPatt.value = yourPatts;

                    closeDialogViaButton("has result");
                }
            }));
            const divName = TSmkElt("div", undefined, [
                eltName,
                btnDelete,
            ]);
            divName.style = `
                        display: flex;
                        flex-direction: row;
                        gap: 10px;
                        flex-wrap: wrap;
                    `;
            bdy.appendChild(divName);
        } else {
            inpName = modMdc.mkMDCtextFieldInput();
            const tfName = modMdc.mkMDCtextFieldOutlined("Pattern name", inpName);

            const arrNames = getAllPatternNames();
            const checkInpName = () => {
                const newName = inpName.value.trim();
                let strValidity = "";
                if (newName.length == 0) {
                    strValidity = "Please input a name";
                }
                if (arrNames.includes(newName)) {
                    strValidity = `Name ${newName} is already used`;
                }
                inpName.setCustomValidity(strValidity);
                inpName.reportValidity();
                const valid = inpName.validity.valid;
                console.log(inpName.validity);
                console.log({ valid });
            }
            const debounceCheckInpName = TSdebounce(checkInpName, 500);
            inpName.addEventListener("input", evt => {
                debounceCheckInpName();
            });


            // @ts-ignore
            bdy.appendChild(mkElt("p", undefined, tfName));
        }

        let saveButton;
        const partsNewPatt = {}
        function getYourPatt() {
            return {
                breathIn: parseFloat(partsNewPatt.breathIn.value),
                holdHigh: parseFloat(partsNewPatt.holdHigh.value),
                breathOut: parseFloat(partsNewPatt.breathOut.value),
                holdLow: parseFloat(partsNewPatt.holdLow.value),
            }
        }

        const addPartInput = (pattPart, pattLabel) => {
            const val = yourPatt ? yourPatt.patt[pattPart] : 4;
            const inp = TSmkElt("input", {
                type: "number",
                min: 0,
                max: 8,
                value: val,
                // placeholder: "0 sec",
            });
            inp.style = `
                        width: 30px;
                    `;
            const lbl = TSmkElt("label", undefined, [inp, pattLabel]);
            const divAlt = TSmkElt("div", undefined, lbl);
            bdy.appendChild(divAlt);
            partsNewPatt[pattPart] = inp;
        }
        addPartInput("breathIn", "Inhale");
        addPartInput("holdHigh", "Hold (high)");
        addPartInput("breathOut", "Exhale");
        addPartInput("holdLow", "Hold (low)");

        const divOldPatt = TSmkElt("p", undefined, ".");
        divOldPatt.textContent = '\xa0';
        divOldPatt.style.color = "red";
        bdy.appendChild(divOldPatt);

        function currentValue() {
            const val = {};
            val.name = inpName ? inpName.value : existingPattName;
            val.patt = {};
            for (const pv in partsNewPatt) {
                val.patt[pv] = partsNewPatt[pv].value;
            }
            return JSON.stringify(val);
        }
        const initialValue = currentValue();
        const checkCanSave = () => {
            const hasNewInput = currentValue() != initialValue;
            // FIX-ME: check old names:
            // const hasNewName = inpName.value.trim() != "";
            const counts = Object.keys(partsNewPatt)
                .map(pn => parseFloat(partsNewPatt[pn].value))
                .reduce((acc, next) => acc + next);
            const patt = getYourPatt();
            const oldName = findPatternValue(patt);
            const inUse = oldName && oldName != existingPattName;
            if (inUse) {
                divOldPatt.textContent = `Pattern is used in ${oldName}`;
            } else {
                // divOldPatt.textContent = ".";
                // divOldPatt.textContent = ' ';
                divOldPatt.textContent = '\xa0';
            }
            const canSave = hasNewInput
                // && hasNewName
                && (existingPattName || inpName.validity.valid)
                && counts > 8
                && oldName == undefined
                ;
            saveButton.disabled = !canSave;
        }
        const debounceCheckCanSave = TSdebounce(checkCanSave, 1000);
        bdy.addEventListener("input", evt => {
            debounceCheckCanSave();
        });


        const funResult = () => {
            return "this si the result";
        };
        const funOkButton = (btn) => {
            saveButton = btn;
            saveButton.disabled = true;
        };
        // mkMDCdialogConfirm(body, titleOk, titleCancel, noCancel, funHandleResult, tellMeOkButton)
        // const res = await modMdc.mkMDCdialogConfirm(bdy, "Save", true, funResult, funOkButton);
        const dlg = modMdc.mkMDCdialogConfirm(bdy, "Save", true, funResult, funOkButton);
        let closeResult;
        function closeDialogViaButton(hasResult) {
            // eslint-disable-next-line no-debugger
            debugger;
            closeResult = hasResult;
            // dlg.mdc.close();
            saveButton.disabled = false;
            saveButton.click();
        }
        const res = await dlg;
        if (res != false || closeResult) {
            if (!closeResult) {
                const yourPns = settingYourPatt.value;
                const yourPattName = existingPattName || inpName.value.trim();
                const patt = getYourPatt();
                yourPns[yourPattName] = {};
                yourPns[yourPattName].patt = patt;
                settingYourPatt.value = yourPns;
                settingPattern.value = yourPattName;
                modMdc.mkMDCsnackbar(`Switching to new pattern ${yourPattName}`);
            }

            refreshYourList();
        }
    }


    divPattList.appendChild(divBtnAddPatt);

    const divYourList = TSmkElt("div");
    divYourList.style = `
                display: flex;
                flex-direction: column;
                NOgap: 10px;
            `;
    divPattList.appendChild(divYourList);
    refreshYourList();

    function refreshYourList() {
        divYourList.textContent = "";
        const yourPatterns = settingYourPatt.value;
        const yourPnames = Object.keys(yourPatterns).sort();
        yourPnames.forEach(pn => { addPn(pn, yourPatterns, divYourList); });
        chooseRadFromSetting();
    }
    function getActivePattern() {
        const yourPatterns = settingYourPatt.value;
        const arrNames = [...Object.keys(breathPatterns), ...Object.keys(yourPatterns)];
        const val = settingPattern.value;
        if (arrNames.includes(val)) { return val; }
        settingPattern.value = settingPattern.defaultValue;
        return settingPattern.value;
    }
    function chooseRadFromSetting() {
        const val = getActivePattern();
        const rad = divPattList.querySelector(`input[value="${val}"]`);
        rad.checked = true;
    }



    function addPn(pn, objPatts, divList) {
        // if (objPatts) debugger;
        const isYour = objPatts != undefined;
        objPatts = objPatts || breathPatterns;
        divList = divList || divPattList;
        console.log({ pn });
        const rad = TSmkElt("input", { type: "radio", name: "pattName", value: pn });
        // if (currentPattern == pn) rad.checked = true;
        if (settingPattern.value == pn) rad.checked = true;
        const eltName = TSmkElt("b", undefined, pn);
        eltName.style = `margin-right: 5px; margin-left: 5px;`;
        const patt = objPatts[pn].patt;
        const eltPatt = mkPattString(patt);
        const eltInfo = TSmkElt("span", undefined, [eltName, eltPatt]);
        const lbl = TSmkElt("label", undefined, [rad, eltInfo]);
        if (!isYour) {
            divList.appendChild(lbl);
        } else {
            const iconEdit = modMdc.mkMDCicon("edit");
            const btnEdit = modMdc.mkMDCiconButton(iconEdit);
            btnEdit.addEventListener("click", TSerrorHandlerAsyncEvent(async evt => {
                dialogYourPatt(pn);
            }));
            const row = TSmkElt("div", undefined, [btnEdit, lbl]);
            divList.appendChild(row);
        }
    }
    const { pattName } = await modMdc.mkMDCdialogConfirm(bdy, "Close",
        false,
        funHandleResult,
        // tellMeOkButton,
    );
    // settingPattern.value = pattName || currentPattern;
    if (pattName) settingPattern.value = pattName;
    tellCurrentPattern();
    initCurrentPattern();
}

/**
 * 
 * @param {number} breathIn 
 * @param {number} holdHigh 
 * @param {number} breathOut 
 * @param {number} holdLow 
 * @returns {{
 *      patt: any,
 *      countsWpatt: TScounts,
 *      pattPoints: any
 * }}
 */
function makeBreathPattern(breathIn, holdHigh, breathOut, holdLow) {
    const pattY = {
        breathIn: 0,
        holdHigh: 1,
        breathOut: 1,
        holdLow: 0,
    }
    const patt = {
        breathIn,
        holdHigh,
        breathOut,
        holdLow,
    }
    for (const k in patt) {
        const v = patt[k];
        if (isNaN(v)) throw Error(`Value for ${k} is not numeric: ${v}`);
        // if (v <= 0) throw Error(`Value for ${k} is not positive: ${v}`);
        if (v < 0) throw Error(`Value for ${k} is too small: ${v}`);
        if (v >= 10) throw Error(`Value for ${k} is too big: ${v}`);
    }

    /** @type {TScounts} */
    const countsWpatt = TScounts(Object.values(patt)
        .reduce((acc, next) => acc = acc + next, 0));

    const pattPoints = [];
    let pointY;
    let pointX = 0;
    for (const part in patt) {
        pointY = pattY[part];
        pattPoints.push({ pointX, pointY, part });
        const diffX = patt[part];
        pointX += diffX;
    }
    // console.log({ pattPoints });
    return {
        patt,
        countsWpatt,
        pattPoints
    };
}

/** @type {TSmilliSeconds} */
let msLastDraw;

let pxPerMs;

/** @type {TSmilliSeconds} */
let msStart;

/** @type {TSseconds} */
let secWCanvas;

let txtState;
let beforeStart;
function tellState(statePart) {
    const txtPart = textForParts[statePart];
    // beforeStart = !!!txtPart;
    beforeStart = !txtPart;
    txtState = txtPart || statePart;
    const eltCurrentParts = document.getElementById("current-patt-parts");
    if (eltCurrentParts) {
        for (const part in textForParts) {
            eltCurrentParts.classList.remove(part);
        }
        if (txtState != statePart) {
            eltCurrentParts.classList.add(statePart);
        }
    }
}
function tellInitialState() {
    tellState("");
}

const setCanvasSizes = () => {
    const bcrCanvas = eltCanvas.parentElement.getBoundingClientRect();
    eltCanvas.width = bcrCanvas.width;
    eltCanvas.height = bcrCanvas.height;
    eltFilter.style.height = `${bcrCanvas.height}px`;
}

/** @type {TSmilliSeconds} */
const msFocusLength = TSmilliSeconds(5 * 1000);

function drawPattern(patt, drawNumPatts) {
    if (!patt) return;

    ctxCanvas.clearRect(0, 0, eltCanvas.width, eltCanvas.height);

    if (txtState.length > 0) topText(txtState);

    const points = patt.pattPoints;
    if (!points) {
        // eslint-disable-next-line no-debugger
        debugger;
        return;
    }

    // canvasSec = patt.pattW * numPatt;
    secWCanvas = TSseconds((patt.countsWpatt * (100 / settingCountsPerSecond.value)) * drawNumPatts);
    expectNumber(secWCanvas, Object.keys({ secWCanvas }));
    function expectNumber(variable, varName) {
        if (Number.isNaN(variable)) {
            setStateRunning(false);
            throw Error(`Expected number: ${varName}`);
        }
    }

    // @ts-ignore
    msLastDraw = TSmilliSeconds(document.timeline.currentTime);

    middleSecondsX = drawNumPatts * patt.countsWpatt / 2;
    const middleCanvasX = pattX2canvasX(middleSecondsX); // FIX-ME:
    expectNumber(middleCanvasX, Object.keys({ middleCanvasX }));
    let middleY = 0.15;
    const p0 = points[0];



    ctxCanvas.strokeStyle = settingDawnFilter.value ? "darkorange" : "yellowgreen";
    ctxCanvas.lineWidth = 10;

    if (beforeStart) {
        ctxCanvas.beginPath();
        ctxCanvas.setLineDash([3, 5]);
        ctxCanvas.lineCap = "butt";
        const startY = pattY2canvasY(0);
        ctxCanvas.moveTo(middleCanvasX, startY);
        lineTo(p0);
        ctxCanvas.stroke();
    }

    ctxCanvas.beginPath();
    ctxCanvas.setLineDash([]);
    ctxCanvas.lineCap = "round"; // FIX-ME: does not work?? Bug???

    moveTo(p0);
    let protect = 0;
    let lastCanvasX = -100;
    let lastPoint;
    while (protect++ < 5 && lastCanvasX) {
        for (let i = 0, len = points.length; i < len; i++) {
            const pnt = points[i];
            const nextPoint = { ...pnt }
            nextPoint.pointX = pnt.pointX + (protect - 1) * patt.countsWpatt;

            const nextCanvasX = lineTo(nextPoint);
            if (!nextCanvasX) break;

            if (lastCanvasX < middleCanvasX && middleCanvasX <= nextCanvasX) {
                if (!lastPoint) {
                    middleY = 0;
                } else {
                    const lastY = lastPoint.pointY;
                    const nextY = nextPoint.pointY;
                    const part = (middleCanvasX - lastCanvasX) / (nextCanvasX - lastCanvasX);
                    middleY = lastY + (nextY - lastY) * part;
                    tellState(lastPoint.part);
                }
            }

            lastPoint = nextPoint;
            lastCanvasX = nextCanvasX;
        }
    }
    ctxCanvas.stroke();



    // currentPointCanvas.cX = pattX2canvasX(middleSecondsX);
    currentPointCanvas.cR = pattY2canvasY(0) / 30;
    currentPointCanvas.cX = middleCanvasX;
    currentPointY = middleY;
    currentPointCanvas.cY = pattY2canvasY(currentPointY);
    const clrPoint = isRunning ? "yellow" : "yellowgreen";
    drawCurrentPoint(clrPoint);



    function moveTo(pnt) {
        const pntCanvas = pnt2canvas(pnt);
        // @ts-ignore
        ctxCanvas.moveTo(pntCanvas.x, pntCanvas.y);
    }
    function lineTo(pnt) {
        // console.log("lineTo", pnt);
        const pntCanvas = pnt2canvas(pnt);
        if (!pntCanvas) return false;
        ctxCanvas.lineTo(pntCanvas.x, pntCanvas.y);
        if (pntCanvas.x < eltCanvas.width) {
            return pntCanvas.x; // So we don't have to calculate it again...
        }
        return false;
    }
    function pnt2canvas(pnt) {
        const sec = (msLastDraw - msStart - msFocusLength) / 1000;
        const secPointX = pnt.pointX * (100 / settingCountsPerSecond.value);
        // if (pnt.pointX > secondsDuration) { return; }
        if (secPointX > secondsDuration) { return; }
        // const x = pnt.pointX - sec + canvasSec / 2;
        const x = secPointX - sec + secWCanvas / 2;
        // if (x > secondsDuration) { return; }
        const pntC = {
            x: pattX2canvasX(x),
            y: pattY2canvasY(pnt.pointY),
        }
        // console.log({ pntC });
        return pntC;
    }
    function mkPxPerMs() {
        pxPerMs = eltCanvas.width / (patt.countsWpatt * drawNumPatts);
    }

    function pattX2canvasX(pattX) {
        mkPxPerMs();
        return pattX * pxPerMs;
    }
    function pattY2canvasY(pattY) {
        const bottom = eltCanvas.height * 0.15;
        const top = eltCanvas.height * 0.30;

        // const height = eltCanvas.height - top - bottom;
        const speedHeight = settingCountsPerSecond.value / maxCountsPerSeconds;
        const height = (eltCanvas.height - top - bottom) * speedHeight;

        const invertY = Math.abs(pattY - 1);
        return invertY * height + top;
    }
}



async function setCanvasBackgroundToCurrent() {
    const modExtImages = await TSimport("external-images");
    modExtImages.setStoringPrefix(STORING_PREFIX);
    useImage = modExtImages.getCurrentImageUrl(myGooglePhotos) || useImage;
    // eltCanvas.style.backgroundImage = `url(${useImage})`;
    updateCanvasBackground(useImage);
};

let usedImageOrVideo;
async function updateCanvasBackground(useImageOrVideo) {
    let eltVideo;
    let videoH, videoW;
    if (useImageOrVideo.startsWith("V")) {
        eltVideo = TSmkElt("video");
        eltVideo.muted = true;
        eltVideo.controls = false;
        eltVideo.loop = true;
        eltVideo.autoplay = true;
        await new Promise((resolve, reject) => {
            eltVideo.addEventListener("loadedmetadata", evt => {
                const targ = evt.target;
                videoH = targ.videoHeight;
                videoW = targ.videoWidth;
                resolve(undefined);
            });
            eltVideo.src = useImageOrVideo.slice(1);
        });
    }
    // eltVideo = undefined;
    usedImageOrVideo = useImageOrVideo;
    // eltCanvas.style.backgroundImage = `url(${useImage})`; return;
    const clsBg = "canvas-bg";
    const eltCanvas = document.getElementById("elt-canvas");
    // @ts-ignore
    const eltParent = eltCanvas.parentElement;
    // @ts-ignore
    const eltOldBg = eltParent.firstElementChild;
    if (eltOldBg?.classList.contains(clsBg)) eltOldBg.remove();
    let eltBg;
    if (settingSquare.value) {
        if (eltVideo) {
            // eslint-disable-next-line no-debugger
            debugger;
            eltBg = eltVideo;
            eltBg.style.width = "100%";
            showIt();
        } else {
            eltBg = TSmkElt("div");
            eltBg.style.width = "100%";
            eltBg.style.height = "100%";
            eltBg.style.backgroundPosition = "center";
            eltBg.style.backgroundSize = "cover";
            eltBg.style.backgroundRepeat = "no-repeat";
            eltBg.style.backgroundImage = `url(${useImageOrVideo})`;
            showIt();
        }
    } else {
        if (eltVideo) {
            // eslint-disable-next-line no-debugger
            debugger;
            eltBg = eltVideo;
            eltBg.style.maxWidth = "100%";
            eltBg.style.maxHeight = "100%";
            showIt();
        } else {
            eltBg = TSmkElt("img");
            eltBg.style.maxWidth = "100%";
            eltBg.style.maxWeight = "100%";
            eltBg.onload = () => { showIt(); }
            let testedTimout = false;
            eltBg.onerror = () => {
                // FIX-ME: There seems to be timeout errors. How to handle them?
                console.log("Could not load image", useImageOrVideo);
                if (!testedTimout) {
                    testedTimout = true;
                    setTimeout(() => eltBg.src = useImageOrVideo, 500);
                    return;
                }
                showIt();
            }
            eltBg.src = useImageOrVideo;
        }
    }
    eltBg.classList.add(clsBg);
    eltBg.style.borderRadius = "10px"; // FIX-ME:

    // @ts-ignore
    eltParent.insertBefore(eltBg, eltParent.firstElementChild);
    // if (bgStyleSquare) 
    if (settingSquare.value) {
        // @ts-ignore
        eltParent.style.aspectRatio = "1 / 1";
    } else {
        // @ts-ignore
        eltParent.style.aspectRatio = "unset";
    }
    async function showIt() {
        await TSwait4mutations(eltParent, 50, undefined, 1000);
        setCanvasSizes();

        // Needed for redraw:
        // @ts-ignore
        msStart = document.timeline.currentTime;
        console.log("msStart =, showIt");
        redraw();

        // @ts-ignore
        eltParent.closest("section").style.opacity = "1";
    }

}


function redraw() {
    const myPatt = getPatternByName(settingPattern.value);
    drawPattern(myPatt, settingNumPatts.value);
}


function setupCanvas(container) {
    const container4canvas = TSmkElt("div");
    container4canvas.id = "container-4-canvas";
    container4canvas.style = `
                position: relative;
                background-color: darkgoldenrod;
                NOoutline: 2px dotted darkgoldenrod;
                border-radius: 10px;
                width: 100%;
                NOaspect-ratio: 1 / 1;
                background-size: cover;
                background-position: center;
            `;
    container.appendChild(container4canvas);

    eltCanvas = document.createElement("canvas");
    eltCanvas.id = "elt-canvas";
    // @ts-ignore
    eltCanvas.style = `
                position: absolute;
                top: 0;
                left: 0;
                border-radius: 10px;
            `;

    const eltFilterFilter = TSmkElt("div");
    eltFilterFilter.id = "elt-filter-filter";
    eltFilterFilter.style.width = "inherit";
    eltFilterFilter.style.height = "inherit";
    eltFilterFilter.style.borderRadius = "inherit";

    const eltFilterColor = TSmkElt("div");
    eltFilterColor.id = "elt-filter-color";
    eltFilterColor.style.position = "absolute";
    eltFilterColor.style.top = "0";
    eltFilterColor.style.left = "0";
    eltFilterColor.style.width = "inherit";
    eltFilterColor.style.height = "inherit";
    eltFilterColor.style.borderRadius = "inherit";

    eltFilter = TSmkElt("div", undefined, [eltFilterColor, eltFilterFilter]);
    eltFilter.id = "elt-filter";
    eltFilter.style.width = "100%";
    eltFilter.style.position = "absolute";
    eltFilter.style.top = "0";
    eltFilter.style.left = "0";
    eltFilter.style.borderRadius = "10px";
    eltFilter.style.height = "100px";

    const filters = [];
    filters.push("brightness(0.6)");
    // filters.push("blur(1px)");
    filters.push("blur(0.5px)");
    eltFilterFilter.style.backdropFilter = filters.join(" ");

    eltFilterColor.style.backgroundColor = "#f503";

    container4canvas.appendChild(eltFilter);
    container4canvas.appendChild(eltCanvas);


    //// Images that can be used. Copyright??? Ask user?
    let srPreset;
    srPreset = "256x144";
    srPreset = "1012x576";
    srPreset = "512x288";
    const availableImages = {
        //////// SR generell
        // ?format=webp&preset=${srPreset}`,
        //// Flowers
        srRedFlower:
            `https://static-cdn.sr.se/images/2689/995b2007-ad8d-4b6f-8b6c-5fc105d84831.jpg?format=webp&preset=${srPreset}`,
        srYellowFlower:
            `https://static-cdn.sr.se/images/2689/8b2c6f4f-a143-4dd4-85c5-be23f5c26aad.jpg?format=webp&preset=${srPreset}`,

        //////// SR Veckans bild
        // https://sverigesradio.se/grupp/25727
        srFlowerAndBees:
            `https://static-cdn.sr.se/images/78/8d578df3-5bfa-4fad-9a72-44a99234f8ff.jpg?format=webp&preset=${srPreset}`,

        myOwn: "https://photos.app.goo.gl/jYiWHQ56oTDUfAcJA",
    };
    // useImage = availableImages.srYellowFlower;
    // useImage = availableImages.myOwn; // does not work, CORS
    // useImage = availableImages.srFlowerAndBees;
    // useImage = availableImages.srRedFlower;


    // useImage = myGooglePhotos[0];

    // setCanvasBackgroundToCurrent();
    ctxCanvas = eltCanvas.getContext("2d");
}
let secondsDuration;
async function setupControls(controlscontainer) {
    settingCountsPerSecond = new ourLocalSetting("counts-per-second", 100);
    settingDurationSeconds = new ourLocalSetting("duration-seconds", 9);
    settingDurationMinutes = new ourLocalSetting("duration-minutes", 1);
    settingDurationIsInSeconds = new ourLocalSetting("duration-is-in-seconds", false);
    settingNumPatts = new ourLocalSetting("num-patts", 1.5);
    const modMdc = await TSimport("util-mdc");
    // const modMdc = await import("http://localhost:8080/public/src/js/mod/util-mdc.js");
    const iconStart = modMdc.mkMDCicon("play_arrow");
    const btnStart = modMdc.mkMDCiconButton(iconStart, "Start");
    // btnStart.classList.add("icon-button-30");
    btnStart.id = "start-button";
    btnStart.addEventListener("click", evt => {
        secondsDuration = settingDurationIsInSeconds.value ?
            settingDurationSeconds.value
            :
            settingDurationMinutes.value * 60;

        // Whole patterns:
        // const pattRec = breathPatterns[settingPattern.value];
        const pattRec = getPatternByName(settingPattern.value);


        /** @type {TSseconds} */
        const secPatt = pattRec.countsWpatt;

        const rest = secondsDuration % secPatt;
        let repetitions = Math.floor(secondsDuration / secPatt);
        if (rest > 0.01) repetitions++;
        secondsDuration = repetitions * secPatt + 0.01;
        const secLow = pattRec.patt.holdLow;
        secondsDuration -= secLow;

        // debugger;

        setStateRunning(true);
        // @ts-ignore
        msStart = document.timeline.currentTime;
        console.log("msStart =, btnStart");
        numChecks = 0;
        numRedraw = 0;
        animateLines();
    });

    const iconReplay = modMdc.mkMDCicon("stop");
    const btnReplay = modMdc.mkMDCiconButton(iconReplay, "Stop");
    // btnReset.classList.add("icon-button-30");
    btnReplay.addEventListener("click", evt => {
        tellInitialState();
        initCurrentPattern();
    });
    btnReplay.id = "replay-button";

    function updateTimeNum() {
        const elt = document.getElementById("elt-show-duration");
        if (settingDurationIsInSeconds.value) {
            // @ts-ignore
            elt.textContent = `${settingDurationSeconds.value} sec`;
        } else {
            // @ts-ignore
            elt.textContent = `${settingDurationMinutes.value} min`;
        }
    }
    setTimeout(() => updateTimeNum(), 1000);
    const eltShowTimeNum = TSmkElt("span", undefined, "(time)");
    eltShowTimeNum.id = "elt-show-duration";
    eltShowTimeNum.style = `
                    background-color: #0004;
                    padding: 4px;
                    width: 50px;
                    text-align: center;
                `;

    const divProgress = TSmkElt("div", { id: "progress" },
        TSmkElt("div", { id: "current-progress" }));
    const divChangeTime = (() => {
        const iconLess = modMdc.mkMDCicon("expand_circle_down");
        const btnLess = modMdc.mkMDCiconButton(iconLess, "Shorter");
        btnLess.addEventListener("click", evt => {
            if (settingDurationIsInSeconds.value) {
                settingDurationSeconds.value--;
            } else {
                settingDurationMinutes.value--;
            }
            updateTimeNum();
        });

        // const iconMore = modMdc.mkMDCicon("expand_circle_up");
        // FIX-ME: For some reason the up version does not work??
        //    Using this workaround:
        const iconMore = modMdc.mkMDCicon("expand_circle_down");
        iconMore.style.transform = "rotate(180deg)";
        const btnMore = modMdc.mkMDCiconButton(iconMore, "Longer");
        btnMore.addEventListener("click", evt => {
            if (settingDurationIsInSeconds.value) {
                settingDurationSeconds.value++;
            } else {
                settingDurationMinutes.value++;
            }
            updateTimeNum();
        })

        const div = TSmkElt("div", { class: "mdc-card", id: "set-time" }, [
            btnLess, eltShowTimeNum, btnMore
        ]);
        div.style = `
                    background-color: rgba(255, 255, 0, 0.2);
                    NOdisplay: inline-flex;
                    flex-direction: row;
                    gap: 5px;
                    align-items: center;
                `;
        return div;
    })();

    // const iconSettings = modMdc.mkMDCicon("settings");
    // const iconSettings = modMdc.mkMDCicon("settings_heart");
    const iconSettings = modMdc.mkMDCicon("video_settings");
    const btnSettings = modMdc.mkMDCiconButton(iconSettings, "Start");
    // btnSettings.classList.add("icon-button-30");
    btnSettings.addEventListener("click", async evt => {
        /*
        Just useless. Impossible to get to work!
        // mkMDCslider(min, max, now, step, label, onChange, onInput) 
        // const eltSlider = await modMdc.mkMDCslider(0.8, 1.2, 1.0, 0.05, "Counts to seconds");
        const eltSlider = await modMdc.mkMDCslider(80, 120, 100, undefined, "Counts to seconds");
        const divSlider = TSmkElt("p", undefined, [
            "Counts to seconds:", eltSlider,
        ]);
        divSlider.style = `
            background-color: red;
        `;
        */


        // https://www.w3schools.com/howto/howto_js_rangeslider.asp

        // Looks like values should be integers.
        const inpSpeed = TSmkElt("input", {
            type: "range",
            // min: 80,
            min: minCountsPerSeconds,
            // max: 120,
            max: maxCountsPerSeconds,
            value: 100,
            class: "slider",
        });
        settingCountsPerSecond.bindToInput(inpSpeed);
        const eltOutSpeed = TSmkElt("span");
        const tellSpeed = () => {
            eltOutSpeed.textContent = `${inpSpeed.value}%`;
        }
        tellSpeed();
        inpSpeed.addEventListener("change", evt => {
            console.log("change inpRange", inpSpeed.value);
            tellSpeed();
        });

        const inpSpeedContainer = TSmkElt("div", undefined, inpSpeed);
        inpSpeedContainer.classList.add("slidecontainer");
        /*
        inpRange.addEventListener("input", evt => {
            console.log("input inpRange", inpRange.value);
        });
        */
        const divSpeed = TSmkElt("div", undefined, [
            TSmkElt("div", undefined, [
                "Speed, counts per seconds (",
                eltOutSpeed,
                ")"
            ]),
            inpSpeedContainer,
        ]);
        divSpeed.style = `
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                `;

        const inpNumPatts = modMdc.mkMDCtextFieldInput(undefined, "number");
        settingNumPatts.bindToInput(inpNumPatts);
        const tfNumPatts = modMdc.mkMDCtextFieldOutlined("Show num patts", inpNumPatts);
        const divNumPatts = TSmkElt("div", undefined, tfNumPatts);


        const btnCanvasBug = TSmkElt("button", undefined, "Set canvas bg color");
        btnCanvasBug.addEventListener("click", evt => {
            const c = document.documentElement.querySelector("canvas");
            // @ts-ignore
            c.style.backgroundColor = "white";
        });


        const inpMinOrSec = TSmkElt("input", { type: "checkbox" });
        // const settingDurationIsInSeconds = new ourLocalSetting("duration-is-in-seconds", false);
        settingDurationIsInSeconds.bindToInput(inpMinOrSec);
        const lblMinOrSec = TSmkElt("label", undefined, [
            inpMinOrSec, "Duration in seconds",
        ]);
        const divMinOrSec = TSmkElt("p", undefined, [
            // TSmkElt("div", undefined, "https://issues.chromium.org/issues/40830060"),
            // TSmkElt("div", undefined, btnCanvasBug),
            TSmkElt("div", undefined, lblMinOrSec),
        ]);

        const divNW = TSmkElt("p", undefined, ['Navigator Connection API not supported']);
        // @ts-ignore
        if (navigator.connection) {
            divNW.textContent = "";
            // @ts-ignore
            const nc = navigator.connection;
            // @ts-ignore
            const addRow = (str) => { divNW.appendChild(mkElt("div", undefined, str)); }
            addRow(`Effective network type: ${nc.effectiveType}`);
            addRow(`⚠ Network type: ${nc.type}`);
            addRow(`Downlink Speed: ${nc.downlink}Mb/s`);
            addRow(`⚠ Downlink Max Speed: ${nc.downlinkMax}Mb/s`);
            addRow(`Round Trip Time: ${nc.rtt}ms`);
            addRow(`Save data: ${nc.saveData}`);
        }

        const btnClearData = modMdc.mkMDCbutton("Reset", "raised");
        btnClearData.addEventListener("click", TSerrorHandlerAsyncEvent(async evt => {
            const bdy = TSmkElt("div", undefined, [
                TSmkElt("h2", undefined, "Clear all your choices"),
                TSmkElt("p", undefined, "Reset everything to default values"),
            ]);
            const ans = await modMdc.mkMDCdialogConfirm(bdy);
            if (ans) {
                // modMdc.mkMDCsnackbar("Clearing all your choices...");
                Object.keys(localStorage).forEach(k => {
                    // ourLocalSetting
                    if (k.startsWith(STORING_PREFIX)) {
                        localStorage.removeItem(k);
                    }
                });
                const div = btnClearData.parentElement;
                div.textContent = `
                            All your choices were reset to default values.
                            Restarting app now for this to take effect...
                        `;
                div.style = `
                            color: red;
                        `;
                // @ts-ignore
                await waitSeconds(3);
                location.reload();
            }
        }));
        const divClearData = TSmkElt("p", undefined, btnClearData);

        const divDebug = TSmkElt("div", undefined, [
            TSmkElt("h3", undefined, "Debug"),
            divMinOrSec,
            TSmkElt("h3", undefined, "Network"),
            divNW,
        ]);
        divDebug.style = `
                    background-color: yellow;
                    border: 3px solid red;
                    padding: 10px;
                `;

        const divDebugDetails = TSmkElt("details", undefined, [
            TSmkElt("summary", undefined, "Debug"),
            divDebug
        ]);
        const divColumn = TSmkElt("div", undefined, [
            divSpeed,
            divNumPatts,
            divClearData,
            divDebugDetails,
        ]);
        divColumn.style = `
                    display: flex;
                    flex-direction: column;
                    gap: 40px;
                `;
        const bdy = TSmkElt("div", { class: "colored-dialog" }, [
            TSmkElt("h2", undefined, "Play settings"),
            divColumn,
        ]);
        await modMdc.mkMDCdialogConfirm(bdy, "Close", false);
        initCurrentPattern();
    });
    btnSettings.id = "settings-button";

    // mkMDCfab(eltIcon, title, mini, extendTitle)
    const icoPatternSpa = modMdc.mkMDCicon("spa");
    icoPatternSpa.style.color = "greenyellow";
    const fabPattern = modMdc.mkMDCfab(icoPatternSpa, "Choose breathing pattern", true);
    fabPattern.addEventListener("click", evt => {
        if (isRunningFun()) { return; }
        dialogPattern();
    });
    fabPattern.style.backgroundColor = "orange";
    fabPattern.style.backgroundColor = "#ffa500a1";

    // const icoImages = modMdc.mkMDCicon("add_photo_alternative");
    const icoImages = modMdc.mkMDCicon("image_search");
    icoImages.style.color = "greenyellow";
    const fabImages = modMdc.mkMDCfab(icoImages, "Choose breathing pattern", true);
    fabImages.addEventListener("click", async evt => {
        // dialogPattern();
        if (isRunningFun()) { return; }
        dialogImages();
    });
    fabImages.style.backgroundColor = "orange";
    fabImages.style.backgroundColor = "#ffa500a1";


    const eltPatternInfo = TSmkElt("span", undefined, "Wait")
    eltPatternInfo.id = "elt-pattern-info";

    const eltPatternButtons = TSmkElt("span", undefined, [
        // fabImages,
        fabPattern,
    ]);
    eltPatternButtons.id = "pattern-buttons";
    eltPatternButtons.style = `
                display: inline-flex;
                gap: 5px;
            `;


    const divPattern = TSmkElt("p", undefined, [
        eltPatternButtons,
        eltPatternInfo,
    ]);
    divPattern.style = `
                display: flex;
                gap: 10px;
                margin-top: 40px;
            `;
    setTimeout(tellCurrentPattern, 100);

    tellInitialState();

    const divControlsPlay = TSmkElt("p", undefined, [
        btnStart,
        btnReplay,
        divChangeTime,
        btnSettings,
        divProgress
    ]);
    divControlsPlay.style = `
                display: flex;
                gap: 5px;
                align-items: center;
            `;

    const chkUseDawnFilter = TSmkElt("input", { type: "checkbox" });
    settingDawnFilter = new ourLocalSetting("use-dawn-filter", false);
    if (settingDawnFilter.value) { document.documentElement.classList.add("use-dawn-filter"); }
    settingDawnFilter.bindToInput(chkUseDawnFilter);
    chkUseDawnFilter.addEventListener("input", evt => {
        if (chkUseDawnFilter.checked) {
            document.documentElement.classList.add("use-dawn-filter");
        } else {
            document.documentElement.classList.remove("use-dawn-filter");
        }
        initCurrentPattern();
    });
    chkUseDawnFilter.style.marginRight = "7px";
    const lblUseFilter = TSmkElt("label", undefined, [chkUseDawnFilter, "Dawn"]);

    const chkSquare = TSmkElt("input", { type: "checkbox" });
    // settingSquare = new modLocalSettings.LocalSetting(STORING_PREFIX, "square-canvas", false);
    settingSquare = new ourLocalSetting("square-canvas", true);
    settingSquare.bindToInput(chkSquare);
    chkSquare.addEventListener("input", evt => {
        // bgStyleSquare = chkSquare.checked;
        updateCanvasBackground(usedImageOrVideo);
        setCanvasSizes();
    });
    chkSquare.style.marginRight = "7px";
    const lblSquare = TSmkElt("label", undefined, [chkSquare, "Square"]);

    fabImages.style.backgroundColor = "transparent";
    fabImages.style.color = "unset";

    const divControlImage = TSmkElt("div", undefined, [
        fabImages,
        lblUseFilter,
        // eltUseFilter,
        lblSquare
    ]);
    divControlImage.style = `
                NOdisplay: flex;
                align-items: center;
                gap: 20px;
                outline: 1px dotted red;
                outline: 1px solid #111;
                border-radius: 20px;
                min-height: 40px;
                background: black;
                padding: 0 15px 0 7px;
            `;
    divControlImage.id = "div-control-image";
    const divOuterControlImage = TSmkElt("div", undefined, divControlImage);
    divOuterControlImage.style = `
                display: flex;
                justify-content: center;
                NOoutline: 1px dotted yellow;
                margin-top: -20px;
                height: 40px;
                position: relative;
            `;

    controlscontainer.appendChild(divOuterControlImage);
    controlscontainer.appendChild(divPattern);
    controlscontainer.appendChild(divControlsPlay);
}
async function setupThings() {
    // @ts-ignore
    await thePromiseDOMready;
    modLocalSettings = await TSimport("local-settings");
    class OurLocalSetting extends modLocalSettings.LocalSetting {
        constructor(key, defaultValue) {
            super(STORING_PREFIX, key, defaultValue);
        }
    }
    ourLocalSetting = OurLocalSetting;
    // let currentPattern = "Pranayama";
    settingPattern = new ourLocalSetting("pattern", "Pranayama");
    settingYourPatt = new ourLocalSetting("your-patterns", {});


    const sectionContainer = TSmkElt("section");
    sectionContainer.style = `
                max-height: 100%;
                max-width: 100%;
                max-width: calc(100% - 40px);
                aspect-ratio: 1.0 / 1.4;
                NObackground: gray;
                margin: 20px auto;
                opacity: 0;
                transition: opacity 0.5s;
            `;
    document.body.appendChild(sectionContainer);
    setupCanvas(sectionContainer);
    await setupControls(sectionContainer);
    addInfoButton(sectionContainer);
    setCanvasSizes();
    const afterResize = () => {
        setCanvasSizes();
        if (!isRunning) initCurrentPattern();
    }
    const debounceAfterResize = TSdebounce(afterResize);
    addEventListener("resize", evt => { debounceAfterResize(); });
    setCanvasBackgroundToCurrent();
}
async function addInfoButton(container) {
    const modMdc = await TSimport("util-mdc");
    const iconInfo = modMdc.mkMDCicon("info");
    iconInfo.style.fontSize = "2.5rem";
    iconInfo.style.color = "mediumslateblue";
    const aInfo = TSmkElt("a", undefined, iconInfo);
    // const urlAbout = new URL(location);
    // urlAbout.pathname = "../../about.html";
    // @ts-ignore
    const urlAbout = new URL("../about.html", location);
    aInfo.href = urlAbout.href;
    // const btnInfo = modMdc.mkMDCiconButton(iconInfo, "About");
    const btnInfo = modMdc.mkMDCiconButton(aInfo, "About Link 2");
    btnInfo.style = `
                position: absolute;
                top: -5px;
                right: 5px;
                NOfont-size: 2.5rem !important;
            `;
    container.appendChild(btnInfo);

}