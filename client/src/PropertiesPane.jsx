function PropertiesPane({ data }) {
  if (!data) return null
  const sections = Object.keys(data).filter(
    (k) => k !== 'coordinates' && k !== 'vertices'
  )
  return (
    <div>
      <h2>Properties</h2>
      {sections.map((section) => (
        <div key={section}>
          <h3>[{section}]</h3>
          <pre>{JSON.stringify(data[section], null, 2)}</pre>
        </div>
      ))}
    </div>
  )
}

export default PropertiesPane
