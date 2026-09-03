import { useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import AssetCard from "../components/AssetCard";
import PageHeader from "../components/PageHeader";
import SearchBar from "../components/SearchBar";
import MarketFilter from "../components/MarketFilter";
import assets from "../data/assets";

export default function Market() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [favorites, setFavorites] = useState([]);
  const filtered = useMemo(() => assets.filter((asset) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || asset.name.toLowerCase().includes(query) || asset.symbol.toLowerCase().includes(query);
    return matchesSearch && (filter === "All" || asset.type === filter);
  }), [search, filter]);
  const toggleFavorite = (id) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  return <AppLayout><PageHeader eyebrow="MARKET" title="Market Overview" description="Search, filter and watch simulated assets." /><section className="market-controls"><SearchBar value={search} onChange={setSearch} /><MarketFilter value={filter} onChange={setFilter} /></section><div className="market-status"><span>Showing {filtered.length} assets</span><span>Watchlist: {favorites.length}</span></div>{filtered.length ? <section className="market-grid">{filtered.map((asset) => <AssetCard key={asset.id} asset={asset} isFavorite={favorites.includes(asset.id)} onToggleFavorite={toggleFavorite} />)}</section> : <div className="card empty-state"><h3>No assets found</h3><p>Try another search or filter.</p></div>}</AppLayout>;
}
