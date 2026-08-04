const SaveSystem = {
    data: {
        bestScore: 0, coins: 0, totalCoins: 0, rubies: 0,
        eqSkin: 'default', skins: ['default'],
        achieves: [], challenges: [], worldClassDone: false,
        level: 1, xp: 0, levelCap: 20, levelCapUnlockCount: 0
    },
    load() {
        // まずIndexedDBから読み込みを試みる
        if (typeof StorageSystem !== 'undefined' && StorageSystem.loadData) {
            StorageSystem.loadData().then(data => {
                if (data) {
                    this.restoreFromIndexedDB(data);
                    console.log('IndexedDBからデータを復元しました');
                    return;
                }
                // IndexedDBにデータがない場合はlocalStorageから読み込む
                this.loadFromLocalStorage();
            }).catch(err => {
                console.warn('IndexedDB読み込み失敗、localStorageにフォールバック:', err);
                this.loadFromLocalStorage();
            });
        } else {
            // StorageSystemが利用できない場合はlocalStorageから読み込む
            this.loadFromLocalStorage();
        }
    },
    
    loadFromLocalStorage() {
        this.data.bestScore = parseInt(localStorage.getItem('ajifry_bestScore')) || 0;
        this.data.coins = parseInt(localStorage.getItem('ajifry_coins')) || 0;
        this.data.totalCoins = parseInt(localStorage.getItem('ajifry_totalCoins')) || 0;
        this.data.rubies = parseInt(localStorage.getItem('ajifry_rubies')) || 0;
        this.data.eqSkin = localStorage.getItem('ajifry_eqSkin') || 'default';
        try {
            this.data.skins = JSON.parse(localStorage.getItem('ajifry_skins')) || ['default'];
            this.data.achieves = JSON.parse(localStorage.getItem('ajifry_achieves')) || [];
            this.data.challenges = JSON.parse(localStorage.getItem('ajifry_challenges')) || [];
            this.data.worldClassDone = localStorage.getItem('ajifry_worldClassDone') === '1';
        } catch(e) {
            this.reset();
        }
        
        if (this.data.level === undefined) this.data.level = 1;
        if (this.data.xp === undefined) this.data.xp = 0;
        if (this.data.levelCap === undefined) this.data.levelCap = 20;
        if (this.data.levelCapUnlockCount === undefined) this.data.levelCapUnlockCount = 0;
        
        this.data.level = parseInt(localStorage.getItem('ajifry_level')) || this.data.level;
        this.data.xp = parseInt(localStorage.getItem('ajifry_xp')) || this.data.xp;
        this.data.levelCap = parseInt(localStorage.getItem('ajifry_levelCap')) || this.data.levelCap;
        this.data.levelCapUnlockCount = parseInt(localStorage.getItem('ajifry_levelCapUnlockCount')) || this.data.levelCapUnlockCount;
    },
    
    restoreFromIndexedDB(data) {
        const keyMap = {
            'ajifry_bestScore': 'bestScore',
            'ajifry_coins': 'coins',
            'ajifry_totalCoins': 'totalCoins',
            'ajifry_rubies': 'rubies',
            'ajifry_eqSkin': 'eqSkin',
            'ajifry_skins': 'skins',
            'ajifry_achieves': 'achieves',
            'ajifry_challenges': 'challenges',
            'ajifry_worldClassDone': 'worldClassDone',
            'ajifry_level': 'level',
            'ajifry_xp': 'xp',
            'ajifry_levelCap': 'levelCap',
            'ajifry_levelCapUnlockCount': 'levelCapUnlockCount'
        };
        
        for (const [key, prop] of Object.entries(keyMap)) {
            if (key in data) {
                const value = data[key];
                if (key.includes('skins') || key.includes('achieves') || key.includes('challenges')) {
                    this.data[prop] = typeof value === 'string' ? JSON.parse(value) : value;
                } else if (key.includes('worldClassDone')) {
                    this.data[prop] = value === '1' || value === true;
                } else if (prop === 'bestScore' || prop === 'coins' || prop === 'totalCoins' || prop === 'rubies' || prop === 'level' || prop === 'xp' || prop === 'levelCap' || prop === 'levelCapUnlockCount') {
                    this.data[prop] = parseInt(value) || 0;
                } else {
                    this.data[prop] = value;
                }
            }
        }
    },
    
    save() {
        localStorage.setItem('ajifry_bestScore', this.data.bestScore);
        localStorage.setItem('ajifry_coins', this.data.coins);
        localStorage.setItem('ajifry_totalCoins', this.data.totalCoins);
        localStorage.setItem('ajifry_rubies', this.data.rubies);
        localStorage.setItem('ajifry_eqSkin', this.data.eqSkin);
        localStorage.setItem('ajifry_skins', JSON.stringify(this.data.skins));
        localStorage.setItem('ajifry_achieves', JSON.stringify(this.data.achieves));
        localStorage.setItem('ajifry_challenges', JSON.stringify(this.data.challenges));
        localStorage.setItem('ajifry_worldClassDone', this.data.worldClassDone ? '1':'0');
        localStorage.setItem('ajifry_level', this.data.level);
        localStorage.setItem('ajifry_xp', this.data.xp);
        localStorage.setItem('ajifry_levelCap', this.data.levelCap);
        localStorage.setItem('ajifry_levelCapUnlockCount', this.data.levelCapUnlockCount);
        
        // IndexedDBにも保存
        if (typeof StorageSystem !== 'undefined' && StorageSystem.saveData) {
            StorageSystem.saveData(this.data).catch(err => {
                console.warn('IndexedDB保存失敗:', err);
            });
        }
    },
    
    reset() {
        this.data = { bestScore:0, coins:0, totalCoins:0, rubies:0, eqSkin:'default', skins:['default'], achieves:[], challenges:[], worldClassDone: false, level: 1, xp: 0, levelCap: 20, levelCapUnlockCount: 0};
        this.save();
    }
};
SaveSystem.load();


// ver10 optimization patch
window.__saveDirty=false;
window.markGameDirty=function(){window.__saveDirty=true;}
setInterval(()=>{try{
 if(window.__saveDirty && window.SaveSystem?.save){
   window.SaveSystem.save();
   window.__saveDirty=false;
 }
}catch(e){}},10000);
