import type { SimulationSummary } from "../simulation/types";
import { clamp } from "../simulation/random";

export function PlanetVisual({ summary, compact = false }: { summary: SimulationSummary; compact?: boolean }) {
  const { surface, atmosphere, interior } = summary.state;
  const water = clamp(surface.oceanCoverage);
  const ice = clamp(surface.ice);
  const life = clamp(summary.totalBiomass / 0.2);
  const heat = clamp((surface.temperatureC + 30) / 130);
  const atmosphereOpacity = clamp(Math.log1p(summary.state.atmospherePressureBar) / 4, 0.08, 0.72);
  const coreColor = interior.coreActivity > 0.55 ? "#ff9a4b" : interior.coreActivity > 0.25 ? "#d66d42" : "#70474a";
  const oceanColor = surface.temperatureC < 0 ? "#a5d9e8" : `hsl(${205 - heat * 28} 62% ${28 + water * 12}%)`;
  const landColor = life > 0.08 ? `hsl(${95 + life * 20} 38% ${25 + life * 12}%)` : `hsl(${34 - heat * 12} 32% ${32 + heat * 10}%)`;
  const radiation = clamp(surface.radiation);
  const stellarHue = summary.state.params.starTemperatureK < 3900 ? "#ff906a" : summary.state.params.starTemperatureK > 6200 ? "#b8d8ff" : "#ffe6a3";

  return (
    <div className={compact ? "planet-visual compact" : "planet-visual"} aria-label="Planetary system visualization">
      <div className="star-orbit" style={{ opacity: 0.5 + clamp(summary.habitableZoneFlux / 2) * 0.4, background: stellarHue, color: stellarHue }} />
      <div className="scan-reticle"><i/><i/><i/></div>
      <svg viewBox="0 0 520 520" role="img" aria-label={`Planet at ${surface.temperatureC.toFixed(1)} degrees Celsius with ${(water * 100).toFixed(0)} percent modeled ocean coverage`}>
        <defs>
          <radialGradient id="spaceGlow"><stop offset="0" stopColor="#153c35" stopOpacity=".34"/><stop offset="1" stopColor="#07110f" stopOpacity="0"/></radialGradient>
          <radialGradient id="coreGlow"><stop offset="0" stopColor="#fff0a7"/><stop offset=".45" stopColor={coreColor}/><stop offset="1" stopColor="#4b2328"/></radialGradient>
          <clipPath id="planetClip"><circle cx="260" cy="260" r="158"/></clipPath>
          <filter id="blur"><feGaussianBlur stdDeviation="8"/></filter>
        </defs>
        <circle cx="260" cy="260" r="240" fill="url(#spaceGlow)" />
        <g className="orbital-rings" fill="none">
          <ellipse cx="260" cy="260" rx="236" ry="102" stroke="#6edbc6" strokeOpacity=".12" strokeDasharray="2 8" transform={`rotate(${summary.state.params.axialTiltDeg} 260 260)`}/>
          <circle cx="260" cy="260" r="214" stroke="#bc9bea" strokeOpacity=".1" strokeDasharray="34 12"/>
          <path d="M260 38 V78 M260 442 V482 M38 260 H78 M442 260 H482" stroke="#bceade" strokeOpacity=".26"/>
        </g>
        <circle cx="260" cy="260" r={177 + atmosphereOpacity * 18} fill="none" stroke={radiation > .5 ? "#ff8f69" : "#6ddbc1"} strokeOpacity={atmosphereOpacity} strokeWidth={10 + atmosphereOpacity * 18} filter="url(#blur)" />
        <circle cx="260" cy="260" r="160" fill="#1e2a2a" stroke="#9ad9cc" strokeOpacity=".28" strokeWidth="2" />
        <g clipPath="url(#planetClip)">
          <rect x="100" y="100" width="320" height="320" fill={landColor} />
          <path d="M82 190 C150 144 208 196 260 164 C324 124 387 175 444 142 L444 340 C380 306 330 347 272 325 C198 298 146 358 82 328Z" fill={oceanColor} opacity={0.35 + water * 0.65} />
          <path d="M120 260 C166 215 202 238 232 216 C268 190 300 220 330 200 C367 175 401 204 432 185 L438 292 C394 278 365 312 320 296 C270 278 242 310 194 301 C160 295 132 312 100 304Z" fill={oceanColor} opacity={water * .78} />
          <path d="M130 164 C172 115 224 109 270 125 C314 140 365 123 397 165 C355 154 324 181 282 172 C234 161 195 189 130 164Z" fill="#d8edf0" opacity={ice * .94} />
          <path d="M129 360 C190 389 235 372 279 390 C328 410 372 392 400 355 C362 371 326 346 278 360 C221 376 184 344 129 360Z" fill="#d8edf0" opacity={ice * .84} />
          <ellipse cx="210" cy="214" rx="72" ry="30" fill="#e8fbff" opacity={atmosphere.h2o * .72} transform="rotate(-12 210 214)" />
          <ellipse cx="326" cy="283" rx="88" ry="25" fill="#e8fbff" opacity={atmosphere.h2o * .55} transform="rotate(11 326 283)" />
          {life > 0.01 && <g fill="#83f1a9" opacity={0.3 + life * .55}><circle cx="183" cy="281" r={3 + life * 6}/><circle cx="303" cy="199" r={2 + life * 5}/><circle cx="343" cy="330" r={3 + life * 5}/><circle cx="238" cy="355" r={2 + life * 4}/></g>}
          <ellipse cx="205" cy="172" rx="115" ry="150" fill="#fff" opacity=".08" transform="rotate(24 205 172)" />
        </g>
        <g className="planet-cutaway">
          <path d="M260 260 L408 315 A158 158 0 0 1 277 417 Z" fill="#8b5637" opacity=".82" />
          <path d="M260 260 L348 292 A94 94 0 0 1 269 354 Z" fill="url(#coreGlow)" />
          <path d="M260 260 L408 315" stroke="#f9d3a5" strokeOpacity=".3" />
          <path d="M260 260 L277 417" stroke="#f9d3a5" strokeOpacity=".3" />
        </g>
        <circle cx="260" cy="260" r="158" fill="none" stroke="#d5fff5" strokeOpacity=".22" strokeWidth="2" />
        <g className="telemetry-labels" fill="#8ba9a0" fontSize="9" letterSpacing="1.1">
          <text x="28" y="74">ATMOSPHERIC COLUMN</text><text x="28" y="88" fill="#d8f5ed">{summary.state.atmospherePressureBar.toFixed(3)} BAR</text>
          <text x="364" y="442">ESCAPE VELOCITY</text><text x="364" y="456" fill="#d8f5ed">{summary.observables.escapeVelocityKmS.toFixed(2)} KM/S</text>
          <text x="366" y="72">STELLAR SPECTRUM</text><text x="366" y="86" fill={stellarHue}>{summary.state.params.starTemperatureK.toFixed(0)} K</text>
          <text x="28" y="442">LIQUID SOLVENT</text><text x="28" y="456" fill="#79cfff">{(surface.liquidWater * 100).toFixed(1)} INDEX</text>
        </g>
      </svg>
      <div className="planet-caption"><span>Surface</span><strong>{surface.temperatureC.toFixed(1)}°C</strong><span>Core activity</span><strong>{interior.coreActivity.toFixed(2)}</strong><span>Radiation</span><strong>{surface.radiation.toFixed(2)}</strong></div>
    </div>
  );
}
