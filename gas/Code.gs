// gas/Code.gs
// Google Apps Script skeleton for azifly ver12 backend using a Spreadsheet.
// Replace SPREADSHEET_ID with your spreadsheet id and deploy as Web App (Execute as: me, Who has access: Anyone)

const SPREADSHEET_ID = 'REPLACE_SPREADSHEET_ID';
const SHEET_NAME = 'players';

function doGet(e) {
  const action = e.parameter.action || e.parameter["action"];
  try {
    if (action === 'getPlayer') return jsonOutput(getPlayer(e.parameter.id));
    if (action === 'rank') return jsonOutput(getRank(e.parameter.type, Number(e.parameter.limit) || 100));
    if (action === 'myRank') return jsonOutput(getMyRank(e.parameter.id, e.parameter.type));
    if (action === 'metaPlayersCount') return jsonOutput({count: getPlayersCount()});
    return jsonOutput({error: 'unknown action'});
  } catch (err) {
    return jsonOutput({error: err.message});
  }
}

function doPost(e) {
  const raw = e.postData && e.postData.contents;
  const payload = raw ? JSON.parse(raw) : {};
  const action = payload.action || (e.parameter && e.parameter.action);
  try {
    if (action === 'savePlayer') return jsonOutput(savePlayer(payload.player));
    if (action === 'backup') return jsonOutput(backupPlayer(payload.id));
    if (action === 'restore') return jsonOutput(restorePlayer(payload.data));
    return jsonOutput({error: 'unknown action'});
  } catch (err) {
    return jsonOutput({error: err.message});
  }
}

// Utility: return JSON response
function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Ensure sheet exists
function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = ['id','name','level','coins','highscore','total_play_time_sec','created_at_iso','last_logout_iso','total_jumps','total_plays','total_coins_earned','highest_level','title','updated_at_iso'];
    sheet.getRange(1,1,1,headers.length).setValues([headers]);
  }
  return sheet;
}

function getAllPlayers() {
  const sheet = getSheet();
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const data = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const obj = {};
    for (let j = 0; j < headers.length; j++) obj[headers[j]] = row[j];
    data.push(obj);
  }
  return data;
}

function findRowIndexById(id) {
  const sheet = getSheet();
  const values = sheet.getRange(2,1,sheet.getLastRow()-1,1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) return i + 2; // absolute row
  }
  return -1;
}

function getPlayer(id) {
  if (!id) return {error: 'id required'};
  const sheet = getSheet();
  const rowIndex = findRowIndexById(id);
  if (rowIndex === -1) return {error: 'not_found'};
  const row = sheet.getRange(rowIndex,1,1,sheet.getLastColumn()).getValues()[0];
  const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  const obj = {};
  for (let j = 0; j < headers.length; j++) obj[headers[j]] = row[j];
  return obj;
}

function savePlayer(player) {
  if (!player || !player.id) return {error: 'player.id required'};
  const sheet = getSheet();
  const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  const rowIndex = findRowIndexById(player.id);
  if (rowIndex === -1) {
    // append
    const row = headers.map(h => player[h] || '');
    row[headers.indexOf('created_at_iso')] = player.created_at_iso || new Date().toISOString();
    row[headers.indexOf('updated_at_iso')] = new Date().toISOString();
    sheet.appendRow(row);
    return {result: 'created'};
  } else {
    // update
    const current = sheet.getRange(rowIndex,1,1,sheet.getLastColumn()).getValues()[0];
    const updated = headers.map((h,i)=> player[h] !== undefined ? player[h] : current[i]);
    updated[headers.indexOf('updated_at_iso')] = new Date().toISOString();
    sheet.getRange(rowIndex,1,1,updated.length).setValues([updated]);
    return {result: 'updated'};
  }
}

function getRank(type, limit) {
  limit = limit || 100;
  const players = getAllPlayers();
  const key = (type === 'level') ? 'level' : (type === 'play_time' ? 'total_play_time_sec' : (type === 'coins' ? 'total_coins_earned' : 'highscore'));
  players.sort((a,b)=> Number(b[key] || 0) - Number(a[key] || 0));
  const sliced = players.slice(0, limit).map((p, idx) => ({rank: idx+1, id: p.id, name: p.name, value: Number(p[key]||0)}));
  return {type, limit, results: sliced};
}

function getMyRank(id, type) {
  const players = getAllPlayers();
  const key = (type === 'level') ? 'level' : (type === 'play_time' ? 'total_play_time_sec' : (type === 'coins' ? 'total_coins_earned' : 'highscore'));
  players.sort((a,b)=> Number(b[key] || 0) - Number(a[key] || 0));
  for (let i = 0; i < players.length; i++) {
    if (String(players[i].id) === String(id)) return {rank: i+1, id: id, value: Number(players[i][key]||0)};
  }
  return {error: 'not_found'};
}

function getPlayersCount() {
  const sheet = getSheet();
  return Math.max(0, sheet.getLastRow() - 1);
}

// Simple backup: return row JSON for id
function backupPlayer(id) {
  const p = getPlayer(id);
  if (p.error) return {error: 'not_found'};
  // Return JSON string — client may compress/encode
  return {data: p};
}

function restorePlayer(data) {
  if (!data || !data.id) return {error: 'invalid'};
  return savePlayer(data);
}
