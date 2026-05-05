# Frontend - Call Tracking Snippet

## Files

- `ct-snippet.js` — core snippet for dynamic phone number swapping
- `demo.html` — demo page to test the snippet

## Quick Start

1. **Configure project ID**  
   In `ct-snippet.js` or in your HTML, set:
   ```html
   <script>
     window.CallTrackingConfig = {
       projectId: 'YOUR_PROJECT_UUID', // from Supabase projects table
       defaultPhone: '+1234567890'
     };
   </script>
   ```

2. **Include the snippet**  
   Add before `</body>`:
   ```html
   <script src="https://xc52y96c5mwkh4tkh9nx9s89.176.31.78.108.sslip.io/frontend/ct-snippet.js"></script>
   ```
   *(Or host it locally and adjust the path)*

3. **Mark phone elements**  
   ```html
   <!-- Text phone -->
   <span class="ct-phone" data-ct-phone="+7 (495) 123-45-67">+7 (495) 123-45-67</span>

   <!-- Link phone -->
   <a href="tel:+74951234567" class="ct-phone">+7 (495) 123-45-67</a>
   ```

4. **Test**  
   Open `demo.html` with UTM parameters:
   ```
   demo.html?utm_source=google&utm_medium=cpc&utm_campaign=test
   ```
   Open browser console to see logs: `[CT] ...`

## How it works

1. Reads UTM parameters from URL
2. Tries to get `ym_uid` from Yandex.Metrica (if available)
3. Sends POST to backend `/assign-number`
4. Replaces phone numbers in DOM with the assigned tracking number
5. Falls back to default phone if no tracking numbers are available

## Debugging

- Open browser console (F12)
- Look for `[CT]` log messages
- If you see `[CT] Could not get replacement number`, check:
  - Is `projectId` configured correctly?
  - Is the backend running? (`http://xc52y96c5mwkh4tkh9nx9s89.176.31.78.108.sslip.io/health`)
  - Are there active tracking numbers in Supabase for the project?

## TODO

- [ ] Implement `ym_uid` extraction from Yandex.Metrica cookie
- [ ] Add retry logic if backend is temporarily unavailable
- [ ] Add visual indicator when number is swapped (for debugging)
