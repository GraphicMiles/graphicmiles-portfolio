function Chrome({ label, state }: { label: string; state: string }) {
  return <div className="project-visual__chrome"><span>{label}</span><span>{state}</span></div>
}

function Avatar({ tone }: { tone: string }) {
  return <span className={`preview-avatar preview-avatar--${tone}`} />
}

function ForgeAI() {
  return (
    <div className="project-visual project-visual--forge" aria-hidden="true">
      <Chrome label="forgeai / local.session" state="offline" />
      <div className="forge-screen">
        <div className="forge-tabs"><span className="is-active">main.cpp</span><span>SKILL.md</span></div>
        <div className="forge-code">
          <div><i>01</i><b>#include</b> <em>&lt;llama.h&gt;</em></div>
          <div><i>02</i><b>#include</b> <em>"jni.h"</em></div>
          <div className="muted"><i>03</i>// inference stays on device</div>
          <div><i>04</i><strong>JNIEXPORT</strong> <em>jstring</em></div>
          <div><i>05</i><span>streamToken</span>(prompt) {'{'}</div>
          <div className="indent"><i>06</i><em>return</em> tokenStream;</div>
          <div className="active"><i>07</i><b>ready</b><small>14.2 tok/s</small></div>
        </div>
      </div>
      <div className="visual-caption"><span>GGUF / JNI / RAG</span><span>Android</span></div>
    </div>
  )
}

function Nearspace() {
  return (
    <div className="project-visual project-visual--nearspace" aria-hidden="true">
      <Chrome label="nearspace / nearby" state="24 in range" />
      <div className="nearspace-screen">
        <div className="nearspace-grid">{['s6v2', 's6v3', 's6v8', 's6v9', 's6w1', 's6w2', 's6w7', 's6w8', 's6x3', 's6x4', 's6x9', 's6y1'].map((cell) => <span key={cell}>{cell}</span>)}</div>
        <svg className="nearspace-map" viewBox="0 0 640 360" fill="none" preserveAspectRatio="none">
          <path d="M-20 105 78 67l86 28 85-46 92 38 97-35 93 43 95-33 87 35M-20 214l105-38 88 28 93-70 99 38 89-25 98 59 109-28M-15 339l110-63 97 20 89-99 104 57 93-32 78 45 105-45" />
          <path d="M96 380 145 271l-14-96 98-71 94 15 78-103M296 380l-8-120 76-76 104 18 88-92M524 380l-40-87 39-103 99-30" />
          <circle cx="350" cy="190" r="38" />
          <circle cx="350" cy="190" r="8" className="map-center" />
          <circle cx="180" cy="131" r="7" className="map-person" />
          <circle cx="510" cy="251" r="7" className="map-person" />
          <circle cx="430" cy="89" r="7" className="map-person" />
        </svg>
        <div className="nearspace-card"><Avatar tone="orange" /><span><b>Femi A.</b><small>3.2 km away</small></span><b>↗</b></div>
        <div className="nearspace-count"><b>24</b><span>creators nearby</span></div>
      </div>
    </div>
  )
}

function Chan() {
  return (
    <div className="project-visual project-visual--chan" aria-hidden="true">
      <Chrome label="chan / room_042" state="synced" />
      <div className="chan-screen">
        <div className="chan-video"><span>Everything Everywhere</span><b>▶</b><i /></div>
        <div className="chan-people"><Avatar tone="indigo" /><Avatar tone="green" /><Avatar tone="amber" /><hr /><span>+</span></div>
      </div>
      <div className="visual-caption"><span>4 people watching</span><span>03:42 / 09:18</span></div>
    </div>
  )
}

export const ProjectVisuals = { ForgeAI, Nearspace, Chan }
