// iPad / iPhone か（iPadOS の Safari は UA が Mac と同じなので、タッチ対応で見分ける）
export function isIOS(nav = globalThis.navigator) {
  if (!nav) return false
  if (/iPad|iPhone|iPod/.test(nav.userAgent ?? '')) return true
  return nav.platform === 'MacIntel' && (nav.maxTouchPoints ?? 0) > 1
}

// ファイルを端末に保存する。
// iOS では <a download> が「外部アプリケーションを開こうとしています」の確認を挟み、
// 許可するまでに blob URL が無効になって何も起きないことがあるため、共有シートを使う
// （共有シートの「"ファイル"に保存」で保存できる）。
// 戻り値: 'shared' | 'cancelled' | 'downloaded'
export async function saveFile(blob, filename, { nav = globalThis.navigator, doc = globalThis.document } = {}) {
  if (isIOS(nav) && typeof nav.share === 'function' && typeof File === 'function') {
    const file = new File([blob], filename, { type: blob.type })
    if (!nav.canShare || nav.canShare({ files: [file] })) {
      try {
        await nav.share({ files: [file] })
        return 'shared'
      } catch (e) {
        if (e?.name === 'AbortError') return 'cancelled'
        // 共有に失敗したら通常のダウンロードを試す
      }
    }
  }
  const url = URL.createObjectURL(blob)
  const a = doc.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  doc.body.appendChild(a)
  a.click()
  a.remove()
  // 直後に revoke すると、確認ダイアログを挟むブラウザでダウンロードが失敗する
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
  return 'downloaded'
}
