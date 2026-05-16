import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

/* ─── DATA ───────────────────────────────────────────────── */

const ENTRIES = [
  { id: 'al', country: 'Albania',        artist: 'Alis',                             song: 'Nân' },
  { id: 'au', country: 'Australia',      artist: 'Delta Goodrem',                    song: 'Eclipse' },
  { id: 'at', country: 'Austria',        artist: 'Cosmó',                            song: 'Tanzschein' },
  { id: 'be', country: 'Belgium',        artist: 'Essyla',                           song: 'Dancing on the Ice' },
  { id: 'bg', country: 'Bulgaria',       artist: 'Dara',                             song: 'Bangaranga' },
  { id: 'hr', country: 'Croatia',        artist: 'Lelek',                            song: 'Andromeda' },
  { id: 'cy', country: 'Cyprus',         artist: 'Antigoni',                         song: 'Jalla' },
  { id: 'cz', country: 'Czechia',        artist: 'Daniel Žižka',                     song: 'Crossroads' },
  { id: 'dk', country: 'Denmark',        artist: 'Søren Torpegaard Lund',            song: 'Før vi går hjem' },
  { id: 'fi', country: 'Finland',        artist: 'Linda Lampenius & Pete Parkkonen', song: 'Liekinheitin' },
  { id: 'fr', country: 'France',         artist: 'Monroe',                           song: 'Regarde !' },
  { id: 'de', country: 'Germany',        artist: 'Sarah Engels',                     song: 'Fire' },
  { id: 'gr', country: 'Greece',         artist: 'Akylas',                           song: 'Ferto' },
  { id: 'il', country: 'Israel',         artist: 'Noam Bettan',                      song: 'Michelle' },
  { id: 'it', country: 'Italy',          artist: 'Sal Da Vinci',                     song: 'Per sempre sì' },
  { id: 'lt', country: 'Lithuania',      artist: 'Lion Ceccah',                      song: 'Sólo quiero más' },
  { id: 'mt', country: 'Malta',          artist: 'Aidan',                            song: 'Bella' },
  { id: 'md', country: 'Moldova',        artist: 'Satoshi',                          song: 'Viva, Moldova!' },
  { id: 'no', country: 'Norway',         artist: 'Jonas Lovv',                       song: 'Ya Ya Ya' },
  { id: 'pl', country: 'Poland',         artist: 'Alicja',                           song: 'Pray' },
  { id: 'ro', country: 'Romania',        artist: 'Alexandra Căpitănescu',            song: 'Choke Me' },
  { id: 'rs', country: 'Serbia',         artist: 'Lavina',                           song: 'Kraj Mene' },
  { id: 'se', country: 'Sweden',         artist: 'Felicia',                          song: 'My System' },
  { id: 'ua', country: 'Ukraine',        artist: 'Leléka',                           song: 'Ridnym' },
  { id: 'gb', country: 'United Kingdom', artist: 'Look Mum No Computer',             song: 'Eins, Zwei, Drei' },
];

const TIERS = [
  { id: 'S', min: 9,   color: '#FFD700', bg: '#1C1600', glow: '#FFD70070' },
  { id: 'A', min: 8,   color: '#E879F9', bg: '#1A0020', glow: '#E879F970' },
  { id: 'B', min: 6,   color: '#38BDF8', bg: '#001422', glow: '#38BDF870' },
  { id: 'C', min: 4,   color: '#4ADE80', bg: '#001A08', glow: '#4ADE8070' },
  { id: 'D', min: 2,   color: '#FB923C', bg: '#1C0800', glow: '#FB923C70' },
  { id: 'F', min: 1,   color: '#A0AEC0', bg: '#0A0A14', glow: '#A0AEC070' },
];

const ISO_NUMERIC = {
  al:'8',  au:'36',  at:'40',
  be:'56', bg:'100', hr:'191', cy:'196', cz:'203',
  dk:'208',fi:'246', fr:'250',
  de:'276',gr:'300', il:'376', it:'380',
  lt:'440',mt:'470', md:'498',
  no:'578',pl:'616', ro:'642',
  rs:'688',se:'752', ua:'804', gb:'826',
};

const numToEntry = {};
ENTRIES.forEach(e => {
  const n = ISO_NUMERIC[e.id];
  if (n) { numToEntry[n] = e; numToEntry[n.padStart(3,'0')] = e; }
});

// Entries shown in map inlay (geographically off the Europe-centered map)
const INLAY_IDS = new Set(['au', 'il']);
const INLAY_ENTRIES = ENTRIES.filter(e => INLAY_IDS.has(e.id));

/* ─── HELPERS ────────────────────────────────────────────── */

function getTier(rating) {
  if (rating == null) return null;
  for (const t of TIERS) if (rating >= t.min) return t;
  return null;
}

function scoreLabel(n) {
  if (n == null) return '—';
  return String(n);
}

/* ─── FLAG IMAGE ─────────────────────────────────────────── */

function Flag({ id, size = 52 }) {
  const [err, setErr] = useState(false);
  const h = Math.round(size * 2 / 3);
  if (err) return (
    <div style={{ width: size, height: h, background: '#1E1E2E', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#444', flexShrink: 0, fontFamily: 'monospace' }}>
      {id.toUpperCase()}
    </div>
  );
  return (
    <img
      src={`https://flagcdn.com/w80/${id}.png`}
      alt={id}
      style={{ width: size, height: h, objectFit: 'cover', borderRadius: 2, border: '1px solid #2A2A3A', flexShrink: 0, display: 'block' }}
      onError={() => setErr(true)}
    />
  );
}

/* ─── SCORE SLIDER ──────────────────────────────────────── */

function ScoreSlider({ rating, onRate, onClear }) {
  const tier = getTier(rating);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <input
        type="range"
        min="1"
        max="10"
        step="0.1"
        value={rating ?? 1}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          onRate(val);
        }}
        style={{
          flex: 1,
          height: 6,
          borderRadius: 3,
          background: tier ? `linear-gradient(90deg, ${tier.color}, ${tier.bg})` : '#1A1A28',
          cursor: 'pointer',
          appearance: 'none',
          WebkitAppearance: 'none',
        }}
      />
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${tier ? tier.color : '#555'};
          cursor: pointer;
          border: 2px solid ${tier ? tier.bg : '#1A1A28'};
          box-shadow: ${tier ? `0 0 8px ${tier.glow}` : 'none'};
          transition: all 0.15s;
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${tier ? tier.color : '#555'};
          cursor: pointer;
          border: 2px solid ${tier ? tier.bg : '#1A1A28'};
          box-shadow: ${tier ? `0 0 8px ${tier.glow}` : 'none'};
          transition: all 0.15s;
        }
      `}</style>
      <div style={{
        padding: '0 10px', minWidth: 60, height: 40, flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700,
        color: tier ? tier.color : '#AAA',
        fontFamily: "'IBM Plex Mono', monospace",
        textShadow: tier ? `0 0 10px ${tier.glow}` : 'none',
        border: `2px solid ${tier ? tier.color + '45' : '#1A1A28'}`,
        borderRadius: 10,
        background: tier ? tier.bg : '#0C0C14',
      }}>
        <div style={{ fontSize: 14, fontWeight: 900 }}>{rating != null ? rating.toFixed(1) : '—'}</div>
        <div style={{ fontSize: 10, marginTop: 2, color: tier ? tier.color : '#777' }}>{tier ? tier.id : '·'}</div>
      </div>
      {rating != null && (
        <button
          type="button"
          onClick={onClear}
          title="Clear rating"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: '1px solid #333',
            background: '#0B0B12',
            color: '#AAA',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >✕</button>
      )}
    </div>
  );
}


/* ─── RATE VIEW ──────────────────────────────────────────── */

function RateView({ ratings, onRate }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(315px, 1fr))', gap: 10 }}>
      {ENTRIES.map(e => {
        const rating = ratings[e.id];
        const tier = getTier(rating);
        return (
          <div key={e.id} style={{
            background: tier ? `linear-gradient(135deg, ${tier.bg}, #0C0C14)` : '#0C0C14',
            border: `1px solid ${tier ? tier.color + '30' : '#1A1A28'}`,
            borderRadius: 10, padding: '10px 12px',
            display: 'flex', alignItems: 'flex-start', gap: 10,
            transition: 'border-color 0.2s, background 0.25s',
          }}>
            <Flag id={e.id} size={58} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 2, color: tier ? tier.color : '#555', fontFamily: "'Cinzel', serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {e.country.toUpperCase()}
              </div>
              <div style={{ fontSize: 9.5, color: '#AAAABC', fontFamily: "'IBM Plex Mono', monospace", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {e.artist}
              </div>
              <div style={{ fontSize: 8.5, color: '#444', fontFamily: "'IBM Plex Mono', monospace", fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                "{e.song}"
              </div>
              <div style={{ marginTop: 10 }}>
                <ScoreSlider rating={rating} onRate={(val) => onRate(e.id, val)} onClear={() => onRate(e.id, null)} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── TIER VIEW ──────────────────────────────────────────── */

function TierView({ ratings }) {
  const unrated = ENTRIES.filter(e => ratings[e.id] == null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {TIERS.map(tier => {
        const entries = ENTRIES
          .filter(e => getTier(ratings[e.id])?.id === tier.id)
          .sort((a, b) => ratings[b.id] - ratings[a.id]);
        return (
          <div key={tier.id} style={{ display: 'flex', minHeight: 82, borderRadius: 10, overflow: 'hidden', border: `1px solid ${tier.color}22` }}>
            <div style={{
              width: 64, minWidth: 64, flexShrink: 0,
              background: `linear-gradient(180deg, ${tier.bg}, ${tier.color}18)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, fontWeight: 900, color: tier.color,
              fontFamily: "'Cinzel', serif",
              textShadow: `0 0 22px ${tier.glow}`,
              borderRight: `2px solid ${tier.color}22`,
            }}>{tier.id}</div>
            <div style={{ flex: 1, background: tier.bg, padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center' }}>
              {entries.length === 0 && <span style={{ color: '#252535', fontSize: 11, fontFamily: 'monospace' }}>—</span>}
              {entries.map(e => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#FFFFFF06', border: `1px solid ${tier.color}22`, borderRadius: 7, padding: '4px 10px 4px 6px' }}>
                  <Flag id={e.id} size={36} />
                  <div>
                    <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: 1.5, color: tier.color, fontFamily: "'Cinzel', serif" }}>{e.country.toUpperCase()}</div>
                    <div style={{ fontSize: 7.5, color: '#555', fontFamily: 'monospace', fontStyle: 'italic' }}>"{e.song}"</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: tier.color, fontFamily: 'monospace', marginLeft: 4, opacity: 0.85 }}>{ratings[e.id]}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {unrated.length > 0 && (
        <div style={{ display: 'flex', minHeight: 60, borderRadius: 10, overflow: 'hidden', border: '1px solid #181826', marginTop: 4 }}>
          <div style={{ width: 64, minWidth: 64, flexShrink: 0, background: '#0C0C14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #181826', color: '#252535', fontSize: 7.5, fontFamily: 'monospace', letterSpacing: 1, gap: 2 }}>
            <span style={{ fontSize: 15 }}>?</span>UNRATED
          </div>
          <div style={{ flex: 1, background: '#09090F', padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
            {unrated.map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#FFFFFF03', border: '1px solid #161622', borderRadius: 6, padding: '3px 8px 3px 5px', opacity: 0.45 }}>
                <Flag id={e.id} size={28} />
                <div style={{ fontSize: 7.5, color: '#2A2A3A', fontFamily: "'Cinzel', serif", letterSpacing: 1 }}>{e.country.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── RANKING VIEW ───────────────────────────────────────── */

function RankingView({ ratings }) {
  const sorted = ENTRIES.filter(e => ratings[e.id] != null).sort((a, b) => ratings[b.id] - ratings[a.id]);
  const unratedCount = 35 - sorted.length;
  if (sorted.length === 0) return (
    <div style={{ textAlign: 'center', color: '#252535', padding: '80px 32px', fontFamily: 'monospace', letterSpacing: 2, fontSize: 11 }}>
      No songs rated yet.<br /><span style={{ color: '#1E1E2E', fontSize: 10 }}>Go to RATE ALL to begin.</span>
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {sorted.map((e, i) => {
        const rating = ratings[e.id];
        const tier = getTier(rating);
        const medal = i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#252535';
        return (
          <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: `linear-gradient(90deg, ${tier.bg}, #0C0C14 65%)`, border: `1px solid ${tier.color}1A`, borderRadius: 9, padding: '9px 14px' }}>
            <div style={{ fontSize: i < 3 ? 18 : 12, fontWeight: 900, color: medal, fontFamily: "'Cinzel', serif", minWidth: 24, textAlign: 'right', textShadow: i < 3 ? '0 0 10px currentColor' : 'none' }}>{i + 1}</div>
            <Flag id={e.id} size={52} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 2, color: tier.color, fontFamily: "'Cinzel', serif" }}>{e.country.toUpperCase()}</div>
              <div style={{ fontSize: 9, color: '#666', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.artist} — <em>"{e.song}"</em></div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: tier.color, fontFamily: 'monospace', textShadow: `0 0 10px ${tier.glow}`, minWidth: 32, textAlign: 'center' }}>{rating}</div>
            <div style={{ width: 32, height: 32, flexShrink: 0, background: tier.bg, border: `2px solid ${tier.color}60`, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: tier.color, fontFamily: "'Cinzel', serif", textShadow: `0 0 8px ${tier.glow}`, boxShadow: `0 0 10px ${tier.glow}` }}>{tier.id}</div>
          </div>
        );
      })}
      {unratedCount > 0 && <div style={{ textAlign: 'center', padding: '10px', color: '#252535', fontSize: 9, fontFamily: 'monospace', letterSpacing: 2 }}>+ {unratedCount} UNRATED</div>}
    </div>
  );
}

/* ─── MAP VIEW ───────────────────────────────────────────── */

function InlayCard({ entry, rating }) {
  const tier = getTier(rating);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: tier ? `${tier.bg}CC` : '#0C0C14CC', border: `1px solid ${tier ? tier.color + '50' : '#1E1E2E'}`, borderRadius: 7, padding: '5px 9px' }}>
      <Flag id={entry.id} size={34} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.5, color: tier ? tier.color : '#444', fontFamily: "'Cinzel', serif", whiteSpace: 'nowrap' }}>{entry.country.toUpperCase()}</div>
        <div style={{ fontSize: 7, color: '#444', fontFamily: 'monospace', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }}>"{entry.song}"</div>
      </div>
      {rating != null && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, paddingLeft: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: tier?.color, fontFamily: 'monospace' }}>{rating}</span>
          <span style={{ fontSize: 10, fontWeight: 900, color: tier?.color, border: `1.5px solid ${tier?.color + '55'}`, borderRadius: 4, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cinzel', serif" }}>{tier?.id}</span>
        </div>
      )}
    </div>
  );
}

function MapView({ ratings }) {
  const svgRef = useRef(null);
  const worldRef = useRef(null);
  const ratingsRef = useRef(ratings);
  const [status, setStatus] = useState('loading');
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => { ratingsRef.current = ratings; }, [ratings]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!window.topojson) {
          await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js';
            s.onload = res; s.onerror = rej;
            document.head.appendChild(s);
          });
        }
        const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json');
        if (alive) { worldRef.current = world; setStatus('ready'); }
      } catch { if (alive) setStatus('error'); }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (status !== 'ready' || !svgRef.current || !worldRef.current) return;
    const svg = d3.select(svgRef.current);
    if (!svg.selectAll('path.country').empty()) return;

    const W = svgRef.current.getBoundingClientRect().width || 860;
    const H = 500;
    const projection = d3.geoMercator().center([17, 52]).scale(700).translate([W / 2, H / 2 + 30]);
    const path = d3.geoPath().projection(projection);
    const countries = window.topojson.feature(worldRef.current, worldRef.current.objects.countries);

    svg.selectAll('path.country')
      .data(countries.features)
      .join('path')
      .attr('class', 'country')
      .attr('d', path)
      .style('cursor', d => (numToEntry[String(d.id)] || numToEntry[String(d.id).padStart(3,'0')]) ? 'pointer' : 'default')
      .on('mouseover mousemove', function(event, d) {
        const key = String(d.id);
        const entry = numToEntry[key] || numToEntry[key.padStart(3,'0')];
        if (!entry || INLAY_IDS.has(entry.id)) { setTooltip(null); return; }
        const [x, y] = d3.pointer(event, svgRef.current);
        const r = ratingsRef.current[entry.id];
        setTooltip({ x, y, entry, rating: r, tier: getTier(r) });
      })
      .on('mouseout', () => setTooltip(null));
  }, [status]);

  useEffect(() => {
    if (status !== 'ready' || !svgRef.current) return;
    d3.select(svgRef.current).selectAll('path.country').each(function(d) {
      const key = String(d.id);
      const entry = numToEntry[key] || numToEntry[key.padStart(3,'0')];
      const isParticipant = !!entry && !INLAY_IDS.has(entry.id);
      const tier = isParticipant ? getTier(ratings[entry.id]) : null;
      d3.select(this)
        .attr('fill', tier ? tier.bg : isParticipant ? '#1A1A2C' : '#0F0F1A')
        .attr('stroke', tier ? tier.color + '80' : isParticipant ? '#2A2A44' : '#141422')
        .attr('stroke-width', tier ? 1.5 : isParticipant ? 0.8 : 0.4);
    });
  }, [status, ratings]);

  const svgW = svgRef.current?.getBoundingClientRect().width || 860;
  const ttLeft = tooltip ? Math.min(tooltip.x + 14, svgW - 172) : 0;

  return (
    <div style={{ position: 'relative' }}>
      {status !== 'ready' && (
        <div style={{ height: 500, borderRadius: 12, background: '#0C0C14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: status === 'error' ? '#FB923C' : '#252535', fontFamily: 'monospace', fontSize: 11, letterSpacing: 3 }}>
          {status === 'loading' ? 'LOADING MAP DATA…' : 'FAILED TO LOAD MAP'}
        </div>
      )}
      <svg ref={svgRef} style={{ display: 'block', width: '100%', height: 500, borderRadius: 12, background: 'linear-gradient(160deg, #080814, #0A0C18)', visibility: status === 'ready' ? 'visible' : 'hidden' }} />

      {/* Hover tooltip */}
      {tooltip && (
        <div style={{ position: 'absolute', left: ttLeft, top: Math.max(tooltip.y - 10, 8), background: '#0C0C1E', border: `1px solid ${tooltip.tier ? tooltip.tier.color + '55' : '#2A2A3A'}`, borderRadius: 9, padding: '8px 12px', pointerEvents: 'none', zIndex: 20, minWidth: 150, boxShadow: tooltip.tier ? `0 4px 20px ${tooltip.tier.glow}` : '0 4px 12px #00000060' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flag id={tooltip.entry.id} size={34} />
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 2, color: tooltip.tier ? tooltip.tier.color : '#777', fontFamily: "'Cinzel', serif" }}>{tooltip.entry.country.toUpperCase()}</div>
              <div style={{ fontSize: 8, color: '#555', fontFamily: 'monospace', fontStyle: 'italic' }}>"{tooltip.entry.song}"</div>
            </div>
          </div>
          <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 7 }}>
            {tooltip.rating != null ? (
              <>
                <span style={{ fontSize: 20, fontWeight: 900, color: tooltip.tier?.color, fontFamily: 'monospace' }}>{tooltip.rating}</span>
                <div style={{ width: 26, height: 26, background: tooltip.tier?.bg, border: `2px solid ${tooltip.tier?.color + '60'}`, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: tooltip.tier?.color, fontFamily: "'Cinzel', serif" }}>{tooltip.tier?.id}</div>
              </>
            ) : (
              <span style={{ fontSize: 9, color: '#333', fontFamily: 'monospace', letterSpacing: 1 }}>NOT RATED</span>
            )}
          </div>
        </div>
      )}

      {/* Inlay: non-European countries */}
      <div style={{ position: 'absolute', bottom: 14, right: 14, background: '#08080ECC', backdropFilter: 'blur(6px)', border: '1px solid #1E1E2E', borderRadius: 9, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5, minWidth: 180 }}>
        <div style={{ fontSize: 7, color: '#2A2A3A', fontFamily: 'monospace', letterSpacing: 2, marginBottom: 2 }}>NON-EUROPEAN ENTRIES</div>
        {INLAY_ENTRIES.map(e => <InlayCard key={e.id} entry={e} rating={ratings[e.id]} />)}
      </div>

      {/* Tier legend */}
      <div style={{ position: 'absolute', bottom: 14, left: 14, background: '#08080ECC', backdropFilter: 'blur(6px)', border: '1px solid #1E1E2E', borderRadius: 9, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 7, color: '#2A2A3A', fontFamily: 'monospace', letterSpacing: 2, marginBottom: 2 }}>TIER LEGEND</div>
        {TIERS.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 22, height: 22, borderRadius: 4, background: t.bg, border: `2px solid ${t.color + '60'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: t.color, fontFamily: "'Cinzel', serif" }}>{t.id}</div>
            <div style={{ fontSize: 8, color: '#555', fontFamily: 'monospace' }}>
              {t.id === 'S' ? '9.0 – 10.0' : t.id === 'A' ? '8.0 – 8.9' : t.id === 'B' ? '6.0 – 7.9' : t.id === 'C' ? '4.0 – 5.9' : t.id === 'D' ? '2.0 – 3.9' : '1.0 – 1.9'}
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 }}>
          <div style={{ width: 22, height: 14, borderRadius: 3, background: '#1A1A2C', border: '1px solid #2A2A44' }} />
          <div style={{ fontSize: 8, color: '#333', fontFamily: 'monospace' }}>participating, unrated</div>
        </div>
      </div>
    </div>
  );
}

/* ─── ROOT ───────────────────────────────────────────────── */

function getInitialRatings() {
  try {
    const saved = localStorage.getItem('eurovision2026_ratings');
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.warn('Failed to load ratings from localStorage:', e);
    return {};
  }
}

export default function Eurovision2026() {
  const [ratings, setRatings] = useState(getInitialRatings);
  const [view, setView] = useState('rate');

  // Save ratings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('eurovision2026_ratings', JSON.stringify(ratings));
    } catch (e) {
      console.warn('Failed to save ratings to localStorage:', e);
    }
  }, [ratings]);

  const onRate = (id, rating) => setRatings(prev => {
    if (rating == null) { const n = { ...prev }; delete n[id]; return n; }
    return { ...prev, [id]: rating };
  });

  const ratedCount = Object.keys(ratings).length;
  const progress = (ratedCount / 35) * 100;

  const TABS = [
    { id: 'rate',    label: 'RATE ALL' },
    { id: 'tiers',   label: 'TIER LIST' },
    { id: 'ranking', label: 'RANKING' },
    { id: 'map',     label: 'MAP' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#08080F', color: '#E8E8F0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=IBM+Plex+Mono:ital,wght@0,400;0,700;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #08080F; }
        ::-webkit-scrollbar-thumb { background: #1E1E2E; border-radius: 3px; }
      `}</style>

      <header style={{ background: 'linear-gradient(135deg, #0D0025 0%, #08080F 40%, #001A10 100%)', borderBottom: '1px solid #FFD70018', padding: '26px 24px 18px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% -20%, #FFD70015 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ fontSize: 9.5, letterSpacing: 8, color: '#FFD70055', marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>VIENNA 2026 · 70TH EDITION · 16 MAY</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: 6, color: '#FFD700', fontFamily: "'Cinzel', serif", textShadow: '0 0 40px #FFD70055' }}>EUROVISION</h1>
        <div style={{ fontSize: 10, letterSpacing: 5, color: '#9999BB60', marginTop: 4, fontFamily: "'Cinzel', serif" }}>SONG CONTEST SCORECARD</div>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
          <div style={{ width: 200, height: 3, background: '#1E1E2E', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #FFD700, #E879F9)', borderRadius: 2, transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontSize: 9.5, color: '#333', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1 }}>{ratedCount}/35</span>
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', background: '#0C0C14', borderBottom: '1px solid #181824' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setView(t.id)} style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: view === t.id ? '2px solid #FFD700' : '2px solid transparent', color: view === t.id ? '#FFD700' : '#383848', fontSize: 9.5, letterSpacing: 3, fontFamily: "'Cinzel', serif", fontWeight: 700, cursor: 'pointer', transition: 'all 0.18s', marginBottom: -1 }}>{t.label}</button>
        ))}
      </div>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px 60px' }}>
        {view === 'rate'    && <RateView    ratings={ratings} onRate={onRate} />}
        {view === 'tiers'  && <TierView    ratings={ratings} />}
        {view === 'ranking' && <RankingView ratings={ratings} />}
        {view === 'map'    && <MapView     ratings={ratings} />}
      </main>
    </div>
  );
}
