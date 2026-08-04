// データ引継ぎUI - ステータス画面に追加
function addDataShareButtons() {
  const statusScreen = document.getElementById('statusScreen');
  if (!statusScreen) return;

  const existingContainer = statusScreen.querySelector('.data-share-buttons');
  if (existingContainer) return;

  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'data-share-buttons';
  buttonContainer.style.cssText = `
    display: flex;
    gap: 10px;
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: center;
  `;

  const exportBtn = document.createElement('button');
  exportBtn.id = 'exportDataBtn';
  exportBtn.className = 'btn btn-blue';
  exportBtn.textContent = '📤 データ引継ぎ';
  exportBtn.style.flex = '1';
  exportBtn.style.minWidth = '140px';
  exportBtn.addEventListener('click', () => {
    DataTransfer.showTransferUI();
  });

  const importBtn = document.createElement('button');
  importBtn.id = 'importDataBtn';
  importBtn.className = 'btn btn-orange';
  importBtn.textContent = '📥 データ復元';
  importBtn.style.flex = '1';
  importBtn.style.minWidth = '140px';
  importBtn.addEventListener('click', () => {
    if (confirm('現在のデータを上書きしてよろしいですか?')) {
      DataTransfer.showRestoreUI();
    }
  });

  const backupBtn = document.createElement('button');
  backupBtn.id = 'backupDataBtn';
  backupBtn.className = 'btn btn-purple';
  backupBtn.textContent = '💾 バックアップ';
  backupBtn.style.flex = '1';
  backupBtn.style.minWidth = '140px';
  backupBtn.addEventListener('click', () => {
    if (typeof StorageSystem !== 'undefined') {
      StorageSystem.saveData(SaveSystem.data).then(() => {
        alert('バックアップを保存しました');
      }).catch(err => {
        alert('バックアップ保存に失敗しました: ' + err);
      });
    }
  });

  buttonContainer.appendChild(exportBtn);
  buttonContainer.appendChild(importBtn);
  buttonContainer.appendChild(backupBtn);

  const unlockCapBtn = statusScreen.querySelector('#unlockCapBtn');
  if (unlockCapBtn) {
    unlockCapBtn.parentNode.insertBefore(buttonContainer, unlockCapBtn);
  } else {
    statusScreen.appendChild(buttonContainer);
  }
}

// ステータス画面が表示される時にボタンを追加
function setupDataShareUI() {
  const statusOpenBtn = document.getElementById('statusOpenBtn');
  if (statusOpenBtn) {
    statusOpenBtn.addEventListener('click', () => {
      setTimeout(addDataShareButtons, 100);
    });
  }

  // ページロード時にも確認
  addDataShareButtons();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupDataShareUI);
} else {
  setupDataShareUI();
}
