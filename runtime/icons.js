"use strict";
(function () {
  // Original vector silhouettes; no remote icon font or image dependency.
  const shapes = {
    pistol: '<path d="M20 19h76v10H64l-8 9-4 23H33l6-30H20z"/><path d="M19 16h81v7H19zm31 15h15v14H53"/><path class="detail" d="M25 20h63M38 46h12"/>',
    smg: '<path d="M10 23h93v12H77l-2 10H56l-6 17H37l5-27H10z"/><path d="M103 26h16v5h-16M62 34h10v24H60zM17 20h10v3m58-6h6v6"/><path class="detail" d="M18 27h81m-50 11h9m6 8h6"/>',
    rifle: '<path d="M5 27l23-8 15 9h60v9H73l-7 23H53l6-23H41l-8 10-7-13H5zM102 29h23v5h-23M62 20h21v8H62z"/><path class="detail" d="M45 32h53m-32 10-4 12m1-29h17"/>',
    shotgun: '<path d="M6 28h23l12-6h65v10H47l-12 16H16l9-13H6zM103 23h22v6h-22M58 32h36v8H58z"/><path class="detail" d="M43 26h75m-51 8h18"/>',
    minigun: '<path d="M5 27h49V17h34v11h34v15H84v12H68V43H54v8H20V39H5zM68 15V9h16v6M23 26v-9h25v9"/><path class="detail" d="M86 31h35m-35 7h35M12 32h37m-25 9h22M72 46h9"/>',
    launcher: '<path d="M6 23h84l21-8 14 15-14 15-21-8H6zM48 37h14v22H46zM29 23v-9h29v9"/><path class="detail" d="M12 28h82m-82 4h82m10-10 9 9-9 7"/>',
    grenade: '<path d="M56 13h17v10c11 4 16 13 16 24 0 12-8 18-24 18s-24-6-24-18c0-11 5-20 15-24zM58 8h21l10 16-5 4-13-14H58z"/><path class="detail" d="M47 36h35M44 48h41M55 29v30m13-30v33m10-30v26"/>',
    fist: '<path d="M42 29V16c0-9 13-9 13-1V9c0-8 13-8 13 0v4c0-8 13-8 13 0v7c0-7 12-7 12 0v26c0 6-4 11-9 15H53L35 43c-10-11 0-21 7-14z"/><path class="detail" d="M55 16v17m13-20v20m13-13v13M45 35l15 9"/>',
    pin: '<path d="M15 48 92 19l13 6-9 11-9-6-69 23z"/><path d="m92 19 9-10 11 4 5 10-12 2M111 13l9-6 3 3-6 13"/><path class="detail" d="m23 46 64-24m13-1 9-4"/>',
    sword: '<path d="m10 52 73-38 26-5-16 20-71 36zM84 32l7 14 8-5-7-15M90 40l24 17 6-8-23-15"/><path class="detail" d="m25 55 68-35m9 17 10 14"/>',
    whip: '<path d="M9 51h32v11H9z"/><path fill="none" stroke-width="5" d="M40 56c16-2 19-34 41-33 25 1 25 30 6 26-18-4-10-25 10-29 13-3 19-1 22-12"/><path class="detail" d="M14 56h20"/>',
    cash: '<path d="M10 16h108v43H10zM17 10h94v6"/><ellipse cx="64" cy="37" rx="15" ry="14"/><path class="detail" d="M22 25h15m55 0h14M22 49h15m55 0h14M62 29v17m-5-13h11m-11 8h11"/>',
    car: '<path d="m28 17 13-9h46l13 9 7 22v17H95V45H33v11H21V39z"/><path class="detail" d="m39 17-7 18h66l-9-18zM26 40h12m52 0h12"/>',
    contact: '<circle cx="64" cy="19" r="13"/><path d="M37 63V46c0-20 54-20 54 0v17z"/><path class="detail" d="M48 42l16 13 16-13"/>',
    radio: '<path d="M28 22h72v41H28zM35 22 91 4"/><circle cx="48" cy="43" r="13"/><path class="detail" d="M73 34h19m-19 7h19m-19 7h19m-19 7h14"/>',
    shield: '<path d="m64 5 30 10v21c0 17-14 24-30 30-16-6-30-13-30-30V15z"/><path class="detail" d="M64 14v41M44 24h40"/>',
    alert: '<path d="M64 5 121 63H7z"/><path class="detail" stroke-width="6" d="M64 23v19m0 7v5"/>'
  };
  window.QingHudIcon = function (name, attrs) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 72" class="equipment-icon" aria-hidden="true" ' + (attrs || '') + '><g fill="#bdbdbd" stroke="#171717" stroke-width="2.3" stroke-linejoin="round">' + (shapes[name] || shapes.fist) + '</g></svg>';
  };
})();
