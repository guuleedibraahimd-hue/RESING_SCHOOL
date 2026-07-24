//readme_sms_setup.md
# Send SMS Feature — Setup Guide (Hormuud SMS API)

Waxaan kuu sameeyay 3 file:

1. **`Dashboard.jsx`** — Dashboard-kaaga oo lagu daray badhan "Send SMS" (welcome banner-ka dushiisa).
2. **`SendSmsModal.jsx`** — Modal-ka UI-ga (dooro Waalidiin/Macalimiin/Arday, qor fariinta, dir).
3. **`functions_sendSms.js`** — Cloud Function-ka backend-ka ah ee si ammaan ah u dirayo SMS-ga.

**Muhiim:** Username/password-ka Hormuud lama gelin karo React frontend-ka si toos ah — qof kasta oo dev tools furta ayaa ka soo qaadan kara oo lacagtaada ku dhammayn kara SMS been ah. Sidaas darteed waxaan u baahanahay **Cloud Function** oo kaydiya secrets-ka server-ka.

---

## Tallaabo 1 — Files-ka meesha la geliyo

```
src/admin/pages/Dashboard.jsx        ← beddel kan hore (waa file-ka aan kuu beddelay)
src/admin/components/SendSmsModal.jsx ← file cusub
functions/sendSms.js                  ← file cusub (Cloud Function)
```

## Tallaabo 2 — Haddii aadan haysan Cloud Functions weli

Terminal-ka geli project-kaaga folder-ka (RESING_SCHOOL), ka dibna:

```bash
npm install -g firebase-tools     # haddii aan horey loo rakibin
firebase login
firebase init functions
```

Marka la weydiiyo:
- Dooro **JavaScript**
- Dooro project-kaaga Firebase ee jira ("resing-school-erp" — sida sawirka Firestore ee aad soo dirtay)
- "ESLint?" → No (si loo fududeeyo)
- "Install dependencies now?" → Yes

Tani waxay abuureysaa folder `functions/` oo leh `index.js`.

## Tallaabo 3 — Ku dar package-yada loo baahan yahay

```bash
cd functions
npm install firebase-admin firebase-functions axios
```

## Tallaabo 4 — Geli koodka Cloud Function-ka

Copy garee content-ka `functions_sendSms.js` (file-ka aan kuu sameeyay) → geli `functions/index.js` (ama abuur `functions/sendSms.js` oo `index.js` ka soo `require` garee, sida qoraalka file-ka ku qoran yahay dhamaadkiisa).

## Tallaabo 5 — Geli xogta sirta ah ee Hormuud (secrets)

**Ha ku qorin koodka gudihiisa!** Waxaad ku qorataa terminal-ka:

```bash
firebase functions:secrets:set HORMUUD_USERNAME
firebase functions:secrets:set HORMUUD_PASSWORD
firebase functions:secrets:set HORMUUD_SENDERID
```

Mid kasta wuxuu ku weydiin doonaa inaad qorto qiimaha — halkaas ku qor:
- **HORMUUD_USERNAME** → username-kaaga Hormuud (ka https://business.hormuud.com/)
- **HORMUUD_PASSWORD** → API Password-kaaga (profile-kaaga account-ka ku qoran, sida documentation-ka lagu sheegay)
- **HORMUUD_SENDERID** → magaca ay ardayda/waalidiintu ku arki doonaan (tusaale: "RESING")

## Tallaabo 6 — Deploy garee Function-ka

```bash
firebase deploy --only functions
```

Marka ay guuleysato, waxaad ka arki doontaa Firebase Console function magaceedu yahay `sendBulkSms`.

## Tallaabo 7 — Frontend-ka: rakib firebase/functions

Haddii aanad horey u haysan `firebase/functions` oo la import garayo:

```bash
npm install firebase
```

(waa isla package-ka `firebase` ee horay loo isticmaalayay `firebase/firestore` — kuma baahnid wax cusub oo kale in aad rakibto).

## Tallaabo 8 — Ku dar `SendSmsModal.jsx` folder-ka components

Copy garee `SendSmsModal.jsx` → `src/admin/components/SendSmsModal.jsx`

## Tallaabo 9 — Dashboard.jsx — beddel

File-ka `Dashboard.jsx` aan kuu diyaariyay wuu ku jiraa:
- Import `SendSmsModal`
- State `smsModalOpen`
- Badhan "Send SMS" oo ku yaal welcome banner-ka (agagaarka "Explore Dashboard")
- Modal-ka oo furma marka la taabto badhanka

Kaliya copy garee file-kan oo beddel `src/admin/pages/Dashboard.jsx`.

---

## Sida ay u shaqeyso (functionality-ga)

Marka admin-ku taabto **Send SMS**:
1. Modal ayaa furma, wuxuuna dooran karaa:
   - **Dhamaan Waalidiinta** → wuxuu ka akhriyaa `students` collection-ka dhammaan `parentPhone` (mid kasta oo kaliya hal mar, si aan loo dirin waalid isku mid ah laba jeer haddii uu leeyahay carruur badan).
   - **Dhamaan Macalimiinta** → dhammaan `teachers` collection-ka.
   - **Macalin Gaar ah** → dropdown ayaa ka soo muuqda, dooro hal macalin.
   - **Dhamaan Ardayda** → dhammaan `studentPhone` fields-ka `students` collection-ka.
   - **Arday Gaar ah** → dropdown, dooro hal arday.
2. Qor fariinta, taabo **Dir SMS**.
3. Frontend-ku wuxuu u diraa audience-ka + fariinta → Cloud Function-ka `sendBulkSms`.
4. Cloud Function-ku:
   - Firestore ka soo akhriya lambarada saxda ah.
   - Hormuud ka soo helaa token (bearer token) isagoo isticmaalaya secrets-ka.
   - Mid kasta oo lambarada ah SMS u diraa.
   - Dib ugu soo celiyaa Dashboard-ka tirada guusha/fashilka.

## Fadhi la socod ah (Important notes)

- **Phone number format:** Documentation-ka Hormuud tusaalihiisu wuxuu isticmaalaa `"61xxxxxxx"` (lambarka la'aan +252 ama 0 hore). Haddii aad aragto in SMS-yadu ay ku fashilmayaan response code `207` (Wrong mobile number), waxaad u baahan tahay inaad `cleanPhone()` function-ka ku beddesho functions/sendSms.js si loogu daro ama looga saaro prefix-ka 252/0, sida Hormuud kuu sheego.
- **Kharashka (balance):** Hubi in account-kaaga Hormuud uu haysto lacag ku filan si SMS-yada loo diro — response code `204`/`205` waxay macnahoodu yahay balance-ku waa 0 ama aad u yar yahay.
- **Xogta u baahan Firestore:** Waxaan u malaynayaa in `teachers` collection-ku uu leeyahay field magaceedu yahay `phone`, `teacherPhone`, ama `mobile` — hubi field-kaaga saxda ah, haddii uu ku kaladuwan yahay beddel `functions/sendSms.js` gudihiisa `resolveRecipients()`.