// src/api/gasClient.js
// Simple client wrapper for the GAS webapp. Replace BASE with your deployed web app URL.

const BASE = 'https://script.google.com/macros/s/REPLACE_DEPLOY_ID/exec';

async function request(queryParams = {}) {
  const q = new URL(BASE);
  for (const k in queryParams) if (queryParams[k] !== undefined) q.searchParams.set(k, queryParams[k]);
  const res = await fetch(q.toString(), {method: 'GET'});
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

export async function getPlayer(id) {
  return request({action: 'getPlayer', id});
}

export async function savePlayer(player){
  const res = await fetch(BASE, {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({action:'savePlayer', player})});
  if (!res.ok) throw new Error('save failed');
  return res.json();
}

export async function getRank(type='highscore', limit=100) {
  return request({action: 'rank', type, limit});
}

export async function getMyRank(id, type='highscore'){
  return request({action:'myRank', id, type});
}

export async function getPlayersCount(){
  return request({action:'metaPlayersCount'});
}

export async function backup(id){
  const res = await fetch(BASE, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:'backup', id})});
  if(!res.ok) throw new Error('backup failed');
  return res.json();
}

export async function restore(data){
  const res = await fetch(BASE, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:'restore', data})});
  if(!res.ok) throw new Error('restore failed');
  return res.json();
}
