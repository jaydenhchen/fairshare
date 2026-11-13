const paths = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  chores:
    '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M8 10l2 2 4-4m-6 9h8"/>',
  wallet:
    '<path d="M20 8V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v11H5a3 3 0 0 1-3-3V6"/><path d="M20 12h-5v5h5m-3-2.5h.01"/>',
  people:
    '<path d="M15 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2m18 0v-2a4 4 0 0 0-3-3.87M15 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/>',
  heart:
    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-12 12a2 2 0 0 0 4 0"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
  sparkles:
    '<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3ZM20 2v4m-2-2h4"/>',
  basket: '<path d="m8 3-4 7m12-7 4 7M2 10h20l-3 11H5Zm7 4v3m6-3v3"/>',
  vacuum: '<path d="M5 21h14v-4H5Zm4-4V9a4 4 0 0 1 8 0v3m0 0h4v5h-4Z"/>',
  recycle:
    '<path d="m8 5 3-3 3 3m-3-3v12m7-4 4 1-1 4m1-4-11 6M6 11l-4 1 1 4m-1-4 11 6"/>',
  leaf: '<path d="M20 3C9 2 3 8 5 15c2 6 12 6 15-12Z"/><path d="M3 22 14 11"/>',
  wifi: '<path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0m-4 4h.01"/>',
  spray:
    '<path d="M10 3h7v4h-7V3ZM10 5H6m8 2v4m-4 0h7l3 10H7l3-10Zm9-7h2m-2 3 2 1"/>',
  pizza:
    '<path d="m4 3 16 16-17 2L4 3Zm0 0c6-1 15 7 16 16M7 3l-4 18m1-6 11 4"/><circle cx="8" cy="11" r="1"/><circle cx="11" cy="16" r="1"/>',
  message:
    '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  trend: '<path d="m3 17 6-6 4 4 8-10m-6 0h6v6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  logout: '<path d="M9 21H4V3h5m6 5 4 4-4 4m-7-4h11"/>',
};
export const icon = (name, className = "") =>
  `<svg class="icon ${className}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.chores}</svg>`;
export const logo = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" aria-hidden="true"><rect width="64" height="64" rx="19" fill="#2d6951"/><path d="M17 32c0-9 7-15 15-15v15H17Zm30 0c0 9-7 15-15 15V32h15ZM17 35h12v12c-7 0-12-5-12-12Zm30-6H35V17c7 0 12 5 12 12Z" fill="#e6f1bf"/></svg>`;

export function avatar(person, size = "", label = "") {
  const hair =
    person.id === "maya"
      ? '<path d="M17 33c-5-20 0-28 15-28s19 12 15 29l-6 10H22Z" fill="HAIR"/>'
      : person.id === "nina"
        ? '<path d="M17 34V21C17 1 48 0 48 22v19H17Z" fill="HAIR"/>'
        : '<path d="M18 23c-3-14 6-21 16-18 9-3 17 8 12 20l-7-7-19 9Z" fill="HAIR"/>';
  return `<span class="avatar ${size}" style="--avatar-bg:${person.color}" ${label ? `aria-label="${label}" role="img"` : 'aria-hidden="true"'}><svg viewBox="0 0 64 64"><rect width="64" height="64" fill="${person.color}"/>${hair.replaceAll("HAIR", person.hair)}<path d="M9 67c0-21 12-24 23-24s23 3 23 24" fill="${person.ink}"/><path d="M26 38h12v10c-3 5-9 5-12 0Z" fill="${person.skin}"/><ellipse cx="32" cy="27" rx="13" ry="16" fill="${person.skin}"/><path d="M18 22c-2-13 8-18 16-16 9 0 14 6 13 17-8-1-12-8-13-10-5 6-10 8-16 9Z" fill="${person.hair}"/><path d="M26 28h.1m12 0h.1" stroke="#3c332b" stroke-width="2.6" stroke-linecap="round"/><path d="M29 35q3 3 6 0" fill="none" stroke="#945f4e" stroke-width="1.5" stroke-linecap="round"/></svg></span>`;
}

export const houseIllustration = `<svg class="house-illustration" viewBox="0 0 430 245" fill="none" aria-hidden="true">
  <path d="M38 217c91 10 231 12 355-3" stroke="#b7c9aa" stroke-width="1.5" stroke-linecap="round"/>
  <path d="m88 60 5-9m-15 5-9-5m10 19-12 1M365 70l7-9m-1 24 11-2" stroke="#52755c" stroke-width="2" stroke-linecap="round"/>
  <circle cx="325" cy="46" r="24" fill="#edd99f"/><path d="m325 9 1-6m26 16 5-5m6 32h7m-69-25-5-6" stroke="#c8b57f" stroke-width="1.7" stroke-linecap="round"/>
  <path d="M125 105h162v112H125Z" fill="#fbf6df" stroke="#47735c" stroke-width="2" stroke-linejoin="round"/>
  <path d="m110 106 96-77 96 77H110Z" fill="#d58c70" stroke="#47735c" stroke-width="2" stroke-linejoin="round"/>
  <path d="m110 106 96-77 96 77M130 97l76-60 77 60" stroke="#47735c" stroke-width="2" stroke-linecap="round"/>
  <path d="M259 70V39h18v45" fill="#fbf6df" stroke="#47735c" stroke-width="2"/>
  <path d="M255 39h26v-8h-26Z" fill="#d9bca1" stroke="#47735c" stroke-width="2"/>
  <path d="M189 217v-52a20 20 0 0 1 40 0v52" fill="#9eb59a" stroke="#47735c" stroke-width="2"/>
  <circle cx="218" cy="188" r="2.3" fill="#47735c"/>
  <path d="M143 124h31v38h-31Zm100 0h26v38h-26Z" fill="#ecd598" stroke="#47735c" stroke-width="2"/>
  <path d="M158 124v38m-15-19h31m82-19v38m-13-19h26" stroke="#47735c" stroke-width="2"/>
  <path d="M139 165h39v6h-39Z" fill="#d58c70" stroke="#47735c" stroke-width="1.5"/>
  <path d="M143 165c-4-7-1-15 4-15 5 0 5 7 8 7s6-8 11-8c5 0 9 9 7 16" fill="#668b60"/>
  <circle cx="206" cy="96" r="15" fill="#edd99f" stroke="#47735c" stroke-width="2"/><path d="M206 81v30m-15-15h30" stroke="#47735c" stroke-width="2"/>
  <path d="M93 216v-60m0 25c-22 0-29-18-27-25 15-1 27 10 27 25Zm0-17c19-2 27-17 24-23-14-1-24 10-24 23Zm0 37c21-3 25-14 24-22-17 0-24 10-24 22Z" fill="#9aae7b" stroke="#47735c" stroke-width="1.5"/>
  <path d="M74 203h38l-7 20H81Z" fill="#d7a181" stroke="#47735c" stroke-width="1.5"/>
  <path d="M327 212V117m0 48c-23 0-35-20-31-30 21-2 31 13 31 30Zm0-20c20 0 35-21 28-34-21 4-28 17-28 34Zm0 45c22 0 37-17 31-29-18-1-31 13-31 29Z" fill="#6d8d66" stroke="#47735c" stroke-width="1.5"/>
  <path d="M308 195h40l-6 28h-28Z" fill="#e8cf8b" stroke="#47735c" stroke-width="1.5"/>
  <path d="m358 211 8-16 9 16m-10-10h-7m6 0h10" stroke="#6c8b65" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M179 221h62m-57 5h52" stroke="#8da580" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M57 104c-7-9-16-1-11 5l11 10 11-10c5-6-4-14-11-5Z" fill="#d58c70"/>
  <path d="m354 97 3-6 3 6 6 3-6 3-3 6-3-6-6-3Z" fill="#f8f7e8" stroke="#789168" stroke-width="1.5"/>
  <path d="M159 202c-2-7-11-8-14-2-3 7 6 14 14 15 8-1 16-8 14-15-3-6-12-5-14 2Z" fill="#d58c70" opacity=".8"/>
</svg>`;
