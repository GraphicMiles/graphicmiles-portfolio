const folderPalette = ['folder--stone', 'folder--sand', 'folder--blue', 'folder--rose']

export default function App() {
  return (
    <main className="folder-site" aria-labelledby="folder-site-title">
      <h1 className="sr-only" id="folder-site-title">Graphic Miles portfolio</h1>
      <div className="folder-collection" aria-label="Portfolio folders">
        {folderPalette.map((tone, index) => (
          <div className={`folder ${tone}`} key={tone} aria-label={`Portfolio folder ${index + 1}`} />
        ))}
      </div>
    </main>
  )
}
