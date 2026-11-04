// SVG icons used across the site, as one sprite (<use href="#i-name">), plus Google's "G" for the rating badge.

export const sprite = `<svg class="sprite" aria-hidden="true" focusable="false">
  <symbol id="i-arrow" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 12h15M13 6l6 6-6 6"/></symbol>
  <symbol id="i-phone" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M5 3.5h3.2l1.6 4.2-2 1.4a11 11 0 0 0 7.1 7.1l1.4-2 4.2 1.6V19a1.8 1.8 0 0 1-1.9 1.8A16.4 16.4 0 0 1 3.2 5.4 1.8 1.8 0 0 1 5 3.5z"/></symbol>
  <symbol id="i-mail" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/></g></symbol>
  <symbol id="i-pin" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></g></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="m5 12.5 4.5 4.5L19 7.5"/></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 5v14M5 12h14"/></symbol>
  <symbol id="i-spark" viewBox="0 0 24 24"><path fill="currentColor" d="M12 1.5c.6 5.4 2.9 8 8.5 8.5-5.6.6-7.9 3.2-8.5 8.5-.6-5.3-2.9-7.9-8.5-8.5 5.6-.5 7.9-3.1 8.5-8.5z"/></symbol>
  <symbol id="i-drag" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M9 6 3 12l6 6M15 6l6 6-6 6"/></symbol>
  <symbol id="i-quote" viewBox="0 0 48 48"><path fill="currentColor" d="M20 10C10.6 13.2 5 20.4 5 29.5 5 35.4 8.6 39 13.3 39c4.3 0 7.4-3.1 7.4-7.3 0-4-2.9-6.9-6.6-7.2.8-4.4 4.2-8.3 9.2-10.4L20 10zm21 0c-9.4 3.2-15 10.4-15 19.5 0 5.9 3.6 9.5 8.3 9.5 4.3 0 7.4-3.1 7.4-7.3 0-4-2.9-6.9-6.6-7.2.8-4.4 4.2-8.3 9.2-10.4L41 10z"/></symbol>
  <symbol id="i-users" viewBox="0 0 24 24"><g fill="currentColor"><circle cx="9" cy="8" r="3.4"/><path d="M2.5 19c.6-3.6 3.3-5.6 6.5-5.6s5.9 2 6.5 5.6z"/><circle cx="16.8" cy="9" r="2.6"/><path d="M15.6 13.5c3 .1 5.3 1.9 5.9 5.5h-4.2c-.3-2.2-.8-3.9-1.7-5.5z"/></g></symbol>
  <symbol id="i-user" viewBox="0 0 24 24"><g fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 20.5c.7-4.3 3.9-6.6 8-6.6s7.3 2.3 8 6.6z"/></g></symbol>
  <symbol id="i-cal" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke-linecap="round"/></g><g fill="currentColor"><rect x="7" y="13" width="3" height="3" rx=".8"/><rect x="14" y="13" width="3" height="3" rx=".8"/></g></symbol>
  <symbol id="i-box" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.6 20.5 7v10L12 21.4 3.5 17V7zM6 8l6 3.2L18 8l-6-3.1zm-.6 2v6l5.6 2.9v-6z"/></symbol>
  <symbol id="i-clock" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></g></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M4 8h16M4 16h16"/></symbol>
  <symbol id="i-close" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6 6 18"/></symbol>
  <symbol id="i-chev" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6"/></symbol>
  <symbol id="i-instagram" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/></g><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/></symbol>
  <symbol id="i-facebook" viewBox="0 0 24 24"><path fill="currentColor" d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z"/></symbol>
  <symbol id="i-tiktok" viewBox="0 0 24 24"><path fill="currentColor" d="M16.6 3c.4 2.2 1.8 3.7 4 3.9v3.1a7.4 7.4 0 0 1-4-1.2v6.3A5.9 5.9 0 1 1 10.7 9v3.2a2.8 2.8 0 1 0 2.8 2.9V3h3.1z"/></symbol>
  <symbol id="i-youtube" viewBox="0 0 24 24"><path fill="currentColor" d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z"/></symbol>
</svg>`;

// Icons the panel offers for the cards behind the chameleon
export const cardIcons = ['users', 'user', 'cal', 'mail', 'box', 'clock', 'phone', 'pin', 'check', 'spark'];

export const googleG = `<svg class="grating__g" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>`;