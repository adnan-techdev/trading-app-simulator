export default function MarketFilter({ value, onChange }) {
  return <div className="filter-wrapper"><label htmlFor="market-filter">Filter</label><select id="market-filter" value={value} onChange={(e) => onChange(e.target.value)}><option>All</option><option>Crypto</option><option>Stock</option></select></div>;
}
