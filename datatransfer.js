// データ引継ぎ機能 - QRコードとテキストコード対応
const DataTransfer = (() => {
  const encodeData = (data) => {
    const json = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(json)));
  };

  const decodeData = (encoded) => {
    try {
      const json = decodeURIComponent(escape(atob(encoded)));
      return JSON.parse(json);
    } catch (e) {
      console.error('データデコードエラー:', e);
      return null;
    }
  };

  const generateTransferCode = () => {
    const data = SaveSystem.data;
    const timestamp = Date.now();
    const checksum = calculateChecksum(JSON.stringify(data));
    
    const transferData = {
      v: 1,
      t: timestamp,
      c: checksum,
      d: data
    };

    return encodeData(transferData);
  };

  const calculateChecksum = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  };

  const validateTransferCode = (code) => {
    const data = decodeData(code);
    if (!data || data.v !== 1) return false;
    
    const checksum = calculateChecksum(JSON.stringify(data.d));
    return checksum === data.c;
  };

  const restoreFromCode = (code) => {
    if (!validateTransferCode(code)) {
      throw new Error('無効な引継ぎコードです');
    }

    const transferData = decodeData(code);
    const restoredData = transferData.d;

    SaveSystem.data = restoredData;
    SaveSystem.save();
    window.markGameDirty();

    return true;
  };

  const generateQRCode = (text, size = 200) => {
    const encodedText = encodeURIComponent(text);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}`;
    return qrCodeUrl;
  };

  const showTransferUI = () => {
    const transferCode = generateTransferCode();
    const qrCodeUrl = generateQRCode(transferCode, 300);

    const modal = document.createElement('div');
    modal.id = 'dataTransferModal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 15px;
      max-width: 500px;
      text-align: center;
      font-family: Arial, sans-serif;
    `;

    content.innerHTML = `
      <h2 style="margin-bottom: 20px; color: #333;">データ引継ぎコード</h2>
      <div style="margin-bottom: 20px;">
        <img src="${qrCodeUrl}" alt="QRコード" style="width: 200px; height: 200px; border: 2px solid #ddd; padding: 5px;">
      </div>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; word-break: break-all; font-size: 12px; font-family: monospace; margin-bottom: 20px;">
        ${transferCode}
      </div>
      <div style="font-size: 14px; color: #666; margin-bottom: 20px;">
        <p>🔗 このコードを別の端末で入力して、データを引き継ぎできます</p>
        <p>📸 QRコードを撮影して読み込むこともできます</p>
      </div>
      <button id="copyCodeBtn" style="
        padding: 10px 20px;
        margin-right: 10px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
      ">コードをコピー</button>
      <button id="closeTransferBtn" style="
        padding: 10px 20px;
        background: #999;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
      ">閉じる</button>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    document.getElementById('copyCodeBtn').addEventListener('click', () => {
      navigator.clipboard.writeText(transferCode).then(() => {
        alert('コードをコピーしました');
      }).catch(() => {
        alert('コピーに失敗しました');
      });
    });

    document.getElementById('closeTransferBtn').addEventListener('click', () => {
      modal.remove();
    });
  };

  const showRestoreUI = () => {
    const input = prompt('引継ぎコードを入力してください:');
    if (!input) return false;

    try {
      restoreFromCode(input);
      alert('データを復元しました！ページを再読込してください。');
      window.location.reload();
      return true;
    } catch (e) {
      alert('エラー: ' + e.message);
      return false;
    }
  };

  return {
    generateTransferCode,
    generateQRCode,
    validateTransferCode,
    restoreFromCode,
    showTransferUI,
    showRestoreUI,
    encodeData,
    decodeData
  };
})();
