import { describe, it, expect, vi, afterEach } from 'vitest'
import { isIOS, saveFile } from './download.js'

const IPAD_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15'
const WIN_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'

describe('isIOS', () => {
  it('iPadOS (Mac と同じ UA でタッチ対応) を iOS とみなす', () => {
    expect(isIOS({ userAgent: IPAD_UA, platform: 'MacIntel', maxTouchPoints: 5 })).toBe(true)
  })
  it('iPhone の UA を iOS とみなす', () => {
    expect(isIOS({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', platform: 'iPhone', maxTouchPoints: 5 })).toBe(true)
  })
  it('タッチ非対応の Mac と Windows は iOS ではない', () => {
    expect(isIOS({ userAgent: IPAD_UA, platform: 'MacIntel', maxTouchPoints: 0 })).toBe(false)
    expect(isIOS({ userAgent: WIN_UA, platform: 'Win32', maxTouchPoints: 0 })).toBe(false)
  })
})

describe('saveFile', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  const blob = () => new Blob(['a,b\r\n'], { type: 'text/csv' })
  const ipad = (share) => ({ userAgent: IPAD_UA, platform: 'MacIntel', maxTouchPoints: 5, share, canShare: () => true })

  function mockUrl() {
    URL.createObjectURL ??= () => ''
    URL.revokeObjectURL ??= () => {}
    const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:x')
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    return { create, revoke }
  }

  it('iOS では共有シートにファイル名付きで渡す', async () => {
    const share = vi.fn().mockResolvedValue()
    expect(await saveFile(blob(), 'k.csv', { nav: ipad(share) })).toBe('shared')
    expect(share.mock.calls[0][0].files[0].name).toBe('k.csv')
  })

  it('iOS で共有をキャンセルしたらダウンロードしない', async () => {
    const { create } = mockUrl()
    const share = vi.fn().mockRejectedValue(Object.assign(new Error('x'), { name: 'AbortError' }))
    expect(await saveFile(blob(), 'k.csv', { nav: ipad(share) })).toBe('cancelled')
    expect(create).not.toHaveBeenCalled()
  })

  it('iOS 以外は <a download> で保存し、blob URL はすぐには無効にしない', async () => {
    vi.useFakeTimers()
    const { revoke } = mockUrl()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const share = vi.fn()
    const nav = { userAgent: WIN_UA, platform: 'Win32', maxTouchPoints: 0, share }
    expect(await saveFile(blob(), 'k.csv', { nav })).toBe('downloaded')
    expect(share).not.toHaveBeenCalled()
    expect(click).toHaveBeenCalledOnce()
    expect(revoke).not.toHaveBeenCalled()
    vi.advanceTimersByTime(60_000)
    expect(revoke).toHaveBeenCalledWith('blob:x')
  })
})
