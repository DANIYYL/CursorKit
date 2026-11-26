import { useEffect, useRef, useState } from 'react'
import { initEngine } from './engine'
import { cssFor, htmlFor, jsFor } from './codegen'
import { EN, I } from './i18n'
import { MODES } from './modes'
import { GH } from './icons'
import { GITHUB_URL, RESUME_URL } from './config'

const FA = Object.fromEntries(MODES.map((m) => [m.mode, m.fa]))
const PICKABLE = MODES.filter((m) => m.mode !== 'default' && m.mode !== 'random')

export default function App() {
  const [lang, setLang] = useState('fa')
  const [tab, setTab] = useState('css')
  const [active, setActive] = useState(null) // { mode, cls, el }
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [point, setPoint] = useState(false)
  const engine = useRef(null)
  const linksRef = useRef(null)
  const t = I[lang]
  const nm = (mode) => (lang === 'en' ? EN[mode] : FA[mode])

  // The "on" and "hov" classes are toggled directly on the DOM (see engine.js),
  // so button classNames stay static and React never overwrites them.
  function pick(mode, cls, el) {
    engine.current.setMode(mode)
    document.querySelectorAll('.btn[data-mode]').forEach((b) => b.classList.toggle('on', b === el))
    setActive({ mode, cls, el })
  }

  function onMode(mode, cls, e) {
    if (mode === 'random') {
      let c
      do c = PICKABLE[(Math.random() * PICKABLE.length) | 0]
      while (c.mode === active?.mode)
      return pick(c.mode, c.cls, document.querySelector('.' + c.cls))
    }
    pick(mode, cls, e.currentTarget)
  }

  useEffect(() => {
    engine.current = initEngine()
    pick('ring', 'b1', document.querySelector('.b1'))
    return () => engine.current.destroy()
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr'
  }, [lang])

  // Built after render so the cloned button HTML already has the current language.
  useEffect(() => {
    if (!active) return
    const { mode, cls, el } = active
    setCode(
      mode === 'default' || mode === 'random'
        ? t.nocode
        : tab === 'html'
          ? htmlFor(el, mode)
          : tab === 'css'
            ? cssFor(mode, cls)
            : jsFor(mode, engine.current.SP),
    )
  }, [active, tab, lang])

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      const a = document.createElement('textarea')
      a.value = code
      a.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(a)
      a.select()
      try { document.execCommand('copy') } catch {}
      a.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function goLinks() {
    linksRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setPoint(false)
    setTimeout(() => {
      setPoint(true)
      setTimeout(() => setPoint(false), 3000)
    }, 700)
  }

  const stop = (e) => { if (e.currentTarget.getAttribute('href') === '#') e.preventDefault() }

  const grid = (set) =>
    MODES.filter((m) => m.set === set).map((m) => (
      <button key={m.mode} className={`btn ${m.cls}`} data-mode={m.mode} onClick={(e) => onMode(m.mode, m.cls, e)}>
        {m.icon && <span className="ic">{m.icon}</span>}
        {nm(m.mode)}
      </button>
    ))

  return (
    <>
      <header className="top">
        <div className="brand">Cursor<b>Kit</b></div>
        <nav className="tnav">
          <button className="btn hb" data-mode="default" onClick={(e) => onMode('default', null, e)}>{nm('default')}</button>
          <button className="btn hb" data-mode="random" onClick={(e) => onMode('random', null, e)}>{nm('random')}</button>
          <button className="btn hb go" onClick={goLinks}>
            <span>{t.go}</span><span className="dn">↓</span>
          </button>
        </nav>
        <button className="btn hb" onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}>{t.lang}</button>
      </header>

      <div className="wrap">
        <h1>CursorKit</h1>
        <p className="sub">{t.sub}</p>
        <div className="status">{t.st} <b id="label">{active && nm(active.mode)}</b></div>

        <h2 className="sec">{t.s1}</h2>
        <div className="stage"><div className="grid">{grid(1)}</div></div>

        <h2 className="sec">{t.s2}</h2>
        <div className="stage"><div className="grid">{grid(2)}</div></div>

        <section className="code" aria-live="polite">
          <div className="chead">
            <b>{t.ct}</b><span id="cname">{active && nm(active.mode)}</span>
            <div className="ctabs">
              {['html', 'css', 'js'].map((k) => (
                <button key={k} className="btn tab" data-act={tab === k ? '' : undefined} onClick={() => setTab(k)}>
                  {k.toUpperCase()}
                </button>
              ))}
              <button className="btn tab cp" onClick={copy}>{copied ? t.done : t.copy}</button>
            </div>
          </div>
          <pre dir="ltr"><code>{code}</code></pre>
        </section>

        <div className={`links${point ? ' point' : ''}`} ref={linksRef}>
          <a className="btn gh" href={GITHUB_URL} target="_blank" rel="noopener noreferrer" onClick={stop}>
            <GH />GitHub
          </a>
          <a className="btn cv" href={RESUME_URL} target="_blank" rel="noopener noreferrer" onClick={stop}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h8l6 6v14H6z" /><path d="M14 2v6h6M9 13h8M9 17h6" /></svg>
            {t.res}<span className="ar">{lang === 'fa' ? '←' : '→'}</span>
          </a>
        </div>
      </div>

      <div id="spot" />
      <canvas id="fx" />
      <div id="dot" />
      <div id="ring" />
    </>
  )
}
