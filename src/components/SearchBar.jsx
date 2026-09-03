export default function SearchBar({ value, onChange }) {
  return <div className="search-wrapper"><label htmlFor="asset-search">Search assets</label><input id="asset-search" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search by name or symbol..." /></div>;
}
