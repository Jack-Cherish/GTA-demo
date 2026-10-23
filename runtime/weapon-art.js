"use strict";
(function () {
  // Original side-profile artwork: separate receiver, grips, barrels, sights,
  // magazines, screws and machining lines. Flat tonal fills, no gradients.
  const pistol = '<path class="metal" d="M47 28h135v24h-66l-13 12-6 36H63l8-46H47z"/>' +
    '<path fill="#555c60" d="M52 30h127v14H52zM75 56h26l-8 37H68z"/>' +
    '<path class="light" d="M54 28h124v5H54zM113 44h65v7h-65z"/>' +
    '<path class="edge" d="M103 56h20v12h-22m7-11-3 8"/>' +
    '<path class="fine" d="M60 35v7m5-7v7m5-7v7m5-7v7m5-7v7M82 67l11 3m-12 3 11 3m-12 3 11 3m-12 3 11 3M89 37h19"/>' +
    '<path class="dark" d="M170 23h6v5h-6M54 23h6v5h-6M88 36h19v7H88z"/>' +
    '<circle class="rivet" cx="103" cy="49" r="2"/><path class="fine" d="M74 96h18"/>';
  const smg = '<path class="metal" d="M73 33h102v31H76zM175 43h34v12h-34z"/>' +
    '<path class="dark" d="M210 42h13v14h-13M96 65h22v39H96z"/>' +
    '<path class="light" d="M76 33h96v6H76zM98 73h15v26H98z"/>' +
    '<path class="metal" d="M77 60h22l-10 29H74zM123 62h18l-5 19h-23l5-7h14l2-7h-14z"/>' +
    '<path class="edge" stroke-width="4" d="M73 43H37L15 56v15l22-13h36M38 43v15"/>' +
    '<path class="dark" d="M84 29h7v5h-7M158 25h8v8h-8M151 24h24v3h-24"/>' +
    '<path class="fine" d="M100 44h24v11h-24zM142 43v15m5-15v15m5-15v15m5-15v15m5-15v15M98 80h14m-14 6h14m-14 6h14M178 47h29M78 71l13 3m-16 5 13 3"/>' +
    '<circle class="rivet" cx="132" cy="46" r="2"/><circle class="rivet" cx="85" cy="45" r="2"/>';
  const rifle = '<path class="dark" d="M8 39h28l20 8v11L28 76H8z"/>' +
    '<path class="metal" d="M33 42h36v12H33zM68 32h69v28H68zM137 36h61v20h-61zM198 41h31v7h-31zM230 38h7v13h-7z"/>' +
    '<path class="light" d="M74 32h63v6H74zM138 35h58v5h-58z"/>' +
    '<path class="metal" d="M91 60h27l-2 35H95zM72 59h17l-8 31H68z"/>' +
    '<path class="edge" d="M85 60h10v15H83M106 26h31l8 7h-43z"/>' +
    '<path class="fine" d="M12 45h14v24H12zM79 43h22v10H79zM119 42h12m-12 6h12M145 44v8m8-8v8m8-8v8m8-8v8m8-8v8m8-8v8M99 69h14m-14 6h14m-14 6h14m-14 6h14M72 70l10 3m-12 4 10 3M201 43h26"/>' +
    '<path class="dark" d="M185 28h8v8h-8M78 24h5v8h-5"/><circle class="rivet" cx="109" cy="46" r="2"/>';
  const shotgun = '<path class="dark" d="M9 49l32-4 36 14-18 9-18 15H8z"/>' +
    '<path class="metal" d="M67 45h61v18H67zM123 34h109v7H123zM123 43h97v7h-97z"/>' +
    '<path fill="#71777a" d="M125 47h64v15h-64z"/>' +
    '<path class="light" d="M74 44h48v5H74zM126 35h101v2H126z"/>' +
    '<path class="edge" d="M84 64h18v13H82m7-11-2 6"/>' +
    '<path class="fine" d="M13 53v24M21 55l27 10M132 49v11m7-11v11m7-11v11m7-11v11m7-11v11m7-11v11m7-11v11m7-11v11M102 51h15v7h-15"/>' +
    '<path class="dark" d="M224 30h4v4h-4"/><circle class="rivet" cx="75" cy="53" r="2"/>';
  const minigun = '<path class="dark" d="M16 39h140v31H16z"/>' +
    '<path class="metal" d="M18 40h141v6H18zM18 50h141v7H18zM18 62h141v6H18z"/>' +
    '<ellipse class="metal" cx="12" cy="55" rx="6" ry="18"/>' +
    '<path class="dark" d="M29 37h7v36h-7M65 38h6v33h-6M105 38h6v33h-6M140 37h7v36h-7"/>' +
    '<path class="fine" d="M31 39v31m36-30v29m40-29v29m35-29v30M19 42h120m-120 11h120m-120 11h120"/>' +
    '<path class="metal" d="M151 32h42l12 7v32l-12 7h-42zM199 40h24v25h-24z"/>' +
    '<path class="light" d="M154 33h38l9 6h-47z"/>' +
    '<path class="dark" d="M173 32V19h32v6h-24v7zM210 66h12v23h-12zM168 77h12v26h-12z"/>' +
    '<path class="edge" d="M187 27v7M217 42h17v18h-11"/>' +
    '<path class="fine" d="M157 44h29v22h-29zM173 80h5m-5 6h5m-5 6h5m-5 6h5M212 74h8m-8 5h8"/>' +
    '<circle class="rivet" cx="192" cy="46" r="2"/><circle class="rivet" cx="192" cy="65" r="2"/><path class="edge" d="M12 44v7m0 4v7m0 3v3"/>';
  const launcher = '<path class="metal" d="M12 48h162v14H12zM173 44h24v23h-24z"/>' +
    '<path fill="#858c8d" d="M197 39h20l19 16-19 17h-20z"/>' +
    '<path class="light" d="M16 49h153v4H16zM202 42h12l12 11h-24z"/>' +
    '<path class="dark" d="M33 46h8v18h-8M109 62h12v27h-12M69 62h12v22H69zM163 46h8v18h-8"/>' +
    '<path class="metal" d="M56 47V30h20v6H63v11M123 61h20v17h-17v-4h12v-8h-15"/>' +
    '<path class="fine" d="M18 56h147M47 50v10m4-10v10m42-10v10m4-10v10M70 66h8m-8 6h8m-8 6h8M198 49v14M210 41v28"/>';
  const grenade = '<path class="metal" d="M103 16h33v17c13 9 18 20 18 35 0 24-12 35-34 35S87 92 87 68c0-15 4-26 16-35z"/>' +
    '<path class="dark" d="M104 14h29v9h-29M110 6h29l16 36-7 4-17-29h-21z"/>' +
    '<ellipse class="edge" cx="140" cy="16" rx="10" ry="9"/>' +
    '<path class="light" d="M97 43l10-9v59l-8-7z"/>' +
    '<path class="fine" d="M95 47h49m-54 13h58m-58 14h58m-55 13h49M106 36v61m15-61v64m15-64v58"/>';
  const fist = '<path class="metal" d="M76 61V34c0-12 17-13 18-1V23c0-13 18-12 18 0v4c0-12 18-12 18 1v7c1-12 17-11 18 1v34c0 12-8 22-18 29H97L69 77c-15-16-3-32 7-16z"/>' +
    '<path fill="#6c7275" d="M100 83h35l-5 13H99L74 75l3-5z"/>' +
    '<path class="edge" d="M94 35v25m18-30v29m18-22v23M76 60l19 18"/>' +
    '<path class="fine" d="M82 39v17m19-28v25m18-18v20m17-9v11M93 90h26"/>';
  const pin = '<path class="metal" d="M15 87 169 36l15 8-11 9-7-7L17 92z"/>' +
    '<path class="light" d="M26 83 164 38l3 3L28 86z"/>' +
    '<path class="metal" d="m178 39 12-18 14 5 8 17-13 11-12-7z"/>' +
    '<circle class="dark" cx="194" cy="36" r="5"/><path class="fine" d="m194 22-4 8m16-2-6 4m9 10-8-4m-11 12 2-7"/>' +
    '<path class="edge" d="m209 41 13-12m-13 13 13 12"/><circle class="light" cx="224" cy="28" r="3"/><circle class="light" cx="225" cy="55" r="3"/>';
  const sword = '<path class="metal" d="m17 94 149-63 30-5-19 20L23 101z"/>' +
    '<path class="light" d="m27 92 145-56 14-7-14 11L27 96z"/>' +
    '<path class="metal" d="m164 43 12 22 11-6-14-22zM178 57l37 24 6-10-35-22zM212 80l6 5 9-12-7-3z"/>' +
    '<path class="fine" d="m186 55-3 7m10-3-4 7m10-3-4 7m10-3-5 7M173 42l6 15"/>';
  const whip = '<path class="dark" d="M15 80h50v15H15z"/><path class="metal" d="M14 78h8v19h-8M59 78h8v19h-8"/>' +
    '<path class="edge" stroke-width="5" d="M68 87c34-2 20-55 62-55 44 0 68 40 36 46-31 5-31-30 3-46 29-15 52-2 61-22"/>' +
    '<path class="fine" d="M25 82v10m6-10v10m6-10v10m6-10v10m6-10v10m6-10v10"/>';
  const art = { pistol, "pistol-silenced":pistol+'<path class="dark" d="M182 30h48v20h-48z"/><path class="fine" d="M188 33h35m-35 4h35m-35 4h35m-35 4h35"/>',
    stun:'<path class="metal" d="M53 26h130v27h-65l-12 38H72l13-39H53z"/><path fill="#858c85" d="M58 31h119v17H58z"/><path class="dark" d="M82 55h25l-11 29H76zM183 32h12v16h-12M69 23h29v3H69z"/><path class="fine" d="M63 35h67m-65 6h53M144 32v14m6-14v14m6-14v14m6-14v14M109 55h13v12h-16"/>',
    smg, "smg-full":rifle.replace('M91 60h27l-2 35H95z','M91 60h18l-1 31H95z'), rifle,
    "rifle-ak":rifle.replace('M91 60h27l-2 35H95z','M91 60h27c3 16 7 26 13 35l-18 8c-11-15-16-28-22-43z'),
    shotgun,minigun,launcher,grenade,fist,pin,sword,whip };
  window.QingWeaponArt = function (name,attrs) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 120" class="weapon-art" aria-hidden="true" ' + (attrs||'') + '><g stroke="#151719" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round">' + (art[name]||art.pistol) + '</g></svg>';
  };
})();
