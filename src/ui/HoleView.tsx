import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Cone, HoleSpec, Point } from '../sim/types'
import { corridorHalf, greenCentre } from '../sim/geometry'
import { aimFrame } from '../sim/resolve/shot'
import { HALF_WIDTH, RUNOUT, project, totalDepth, viewBox, windowFrom } from './scale'
import {
  DEEP_BAND, DEEP_BEYOND, ROUGH_BAND, TREES_BAND,
  holeEdgeBand, holeEdgeCorridor, holeEdgeEllipse, obEdge, scatterInEllipse,
} from './holeArt'

function corridorPath(hole: HoleSpec): string {
  const step = 20
  const left: string[] = []
  const right: string[] = []
  for (let d = 0; d <= hole.length + 20; d += step) {
    const h = corridorHalf(hole, d)
    const l = project({ down: d, side: -h }, hole)
    const r = project({ down: d, side: h }, hole)
    left.push(`${l.x.toFixed(1)},${l.y.toFixed(1)}`)
    right.push(`${r.x.toFixed(1)},${r.y.toFixed(1)}`)
  }
  return `M ${left.join(' L ')} L ${right.reverse().join(' L ')} Z`
}

const FILL: Record<string, string> = {
  water: 'var(--water)', bunker: 'var(--sand)', trees: 'var(--trees)',
  rough: 'var(--rough)', deep: 'var(--rough)',
}

/**
 * The cone, drawn in the SAME yard-space viewBox as the hole itself AND
 * along the same ball→pin direction the shot actually travels. If these
 * two ever disagree the preview is lying, which P8 forbids.
 *
 * The cone is exempt from art styling (GRAPHICS-PROPOSAL.md §3.4): both
 * looks draw this exact shape, and it always sits above the terrain.
 *
 * DEPTH IN THE PICTURE (DEPTH-DECISION.md): the wedge stays the wedge, but
 * its far edge is now the PITCH BAND — carry ± the same jitter resolution
 * rolls, drawn solid and darker; the band water and OB read. A shot with
 * run-out grows a lighter hatched TAIL — the pitch band displaced by the
 * roll; the band the crust, the green and the collar read. No roll, no
 * tail. Two tones only, both var(--cone) — the glance test is unchanged:
 * is any part of the trouble inside anything shaded?
 */
function coneGeom(hole: HoleSpec, from: Point, cone: Cone) {
  const { dir, perp } = aimFrame(hole, from)
  const o = cone.aimOffset
  const at = (fwd: number, lat: number): Point => ({
    down: from.down + dir.down * fwd + perp.down * lat,
    side: from.side + dir.side * fwd + perp.side * lat,
  })
  // one edge arc per depth: full lateral width — a ball pitching short still
  // scatters the full spread, so the bands are strips, not a narrowing wedge
  const edge = (fwd: number) => ({
    l: project(at(fwd, o - cone.spread), hole),
    r: project(at(fwd, o + cone.spread), hole),
  })
  const arc = (sweep: 0 | 1) => `A ${cone.spread} ${cone.spread * 0.35} 0 0 ${sweep}`
  // strip between two depths, arced like the classic far edge on both sides
  const strip = (nearFwd: number, farFwd: number) => {
    const n = edge(nearFwd), f = edge(farFwd)
    return `M ${n.l.x},${n.l.y} ${arc(1)} ${n.r.x},${n.r.y} ` +
      `L ${f.r.x},${f.r.y} ${arc(0)} ${f.l.x},${f.l.y} Z`
  }
  const apex = project(from, hole)
  const wedge = (fwd: number) => {
    const e = edge(fwd)
    return `M ${apex.x},${apex.y} L ${e.l.x},${e.l.y} ${arc(1)} ${e.r.x},${e.r.y} Z`
  }
  return { at, edge, arc, strip, apex, wedge }
}

function ConeShape({ hole, from, cone }: { hole: HoleSpec; from: Point; cone: Cone }) {
  const geo = coneGeom(hole, from, cone)
  const o = cone.aimOffset
  const a = geo.apex
  const mid = project(geo.at(cone.carry, o), hole)
  const near = project(geo.at(cone.carry * 0.94, o), hole)
  const { edge, arc, strip } = geo
  const pn = edge(cone.pitchNear)
  const pf = edge(cone.pitchFar)
  const hasTail = cone.restFar > cone.pitchFar
  return (
    <g className="cone">
      {hasTail && (
        <defs>
          <pattern id="coneHatch" patternUnits="userSpaceOnUse" width="6" height="6"
            patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--cone)" strokeWidth="1.8"
              opacity="0.55" />
          </pattern>
        </defs>
      )}
      {/* run-out tail — under the bands, so its overlap with the pitch band
          hides and only the honest extension shows (the Stinger's long skid) */}
      {hasTail && (
        <path d={strip(cone.restNear, cone.restFar)} fill="url(#coneHatch)"
          stroke="var(--cone)" strokeWidth="1" vectorEffect="non-scaling-stroke"
          strokeOpacity=".45" />
      )}
      {/* the wedge body, up to the shortest the ball can pitch */}
      <path
        d={`M ${a.x},${a.y} L ${pn.l.x},${pn.l.y} ${arc(1)} ${pn.r.x},${pn.r.y} Z`}
        fill="var(--cone)" fillOpacity="0.34"
      />
      {/* pitch band — solid and darker: every depth the ball can pitch at */}
      <path d={strip(cone.pitchNear, cone.pitchFar)}
        fill="var(--cone)" fillOpacity="0.55" stroke="var(--cone)"
        strokeWidth="1.2" vectorEffect="non-scaling-stroke" strokeOpacity=".9" />
      {/* the wedge silhouette, dashed as it always was, out to the far pitch */}
      <path
        d={`M ${a.x},${a.y} L ${pf.l.x},${pf.l.y} ${arc(1)} ${pf.r.x},${pf.r.y} Z`}
        fill="none" stroke="var(--cone)"
        strokeWidth="1.6" strokeDasharray="7 5" vectorEffect="non-scaling-stroke"
      />
      <line x1={a.x} y1={a.y} x2={near.x} y2={near.y}
        stroke="var(--cone)" strokeWidth="1.2" strokeDasharray="4 6"
        vectorEffect="non-scaling-stroke" opacity=".8" />
      <circle cx={mid.x} cy={mid.y} r="3.5" fill="var(--cone)" opacity=".9" />
    </g>
  )
}

/**
 * BAIL OUT, IN THE PICTURE. When the armed technique carries ignoreHazards,
 * resolve/shot.ts reads any water or OB the ball finds as ROUGH — so the
 * water and OB the cone covers are painted rough here, clipped to exactly the
 * shape the cone draws. Nothing outside the cone changes: the lake is still a
 * lake everywhere you could still find it, which is the honest reading of the
 * card. Display only — no geometry, no resolution, no sim.
 *
 * Both looks. The tape's wobbled shapes reuse the same feature seeds as
 * TapeCourse, so the tint lands on the drawn shoreline, not beside it.
 */
function SafeTint({ hole, from, cone, tape }: {
  hole: HoleSpec; from: Point; cone: Cone; tape: boolean
}) {
  const geo = coneGeom(hole, from, cone)
  const clip = `h${hole.num}-safe`
  const teeY = project({ down: 0, side: 0 }, hole).y
  return (
    <g className="safetint">
      <defs>
        {/* the union of the two drawn regions: the wedge body, and the band
            from the shortest pitch to the end of the run-out */}
        <clipPath id={clip}>
          <path d={geo.wedge(cone.pitchNear)} />
          <path d={geo.strip(cone.pitchNear, cone.restFar)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`} fill="var(--rough)" fillOpacity=".88">
        {hole.hazards.map((h, i) => {
          if (h.surface !== 'water') return null   // sand and trees still bite
          const c = project(h.at, hole)
          return tape
            ? <path key={i} d={holeEdgeEllipse(hole, 100 + i, h.at, h.rDown, h.rSide)} />
            : <ellipse key={i} cx={c.x} cy={c.y} rx={h.rSide} ry={h.rDown} />
        })}
        {/* OB: only the tape look paints the field beyond the trees (and the
            ground behind the tee) — in classic that ground is already rough */}
        {tape && (
          <>
            <path d={holeEdgeBand(hole, -1, TREES_BAND, 95)} />
            <path d={holeEdgeBand(hole, 1, TREES_BAND, 95)} />
            <rect x={-HALF_WIDTH} y={teeY} width={HALF_WIDTH * 2}
              height={Math.max(totalDepth(hole) - teeY, 0)} />
          </>
        )}
      </g>
    </g>
  )
}

/** Shared yardage grid — identical in both looks; only the tokens change. */
function YardGrid({ hole }: { hole: HoleSpec }) {
  return (
    <>
      {Array.from({ length: Math.floor(hole.length / 50) }, (_, i) => (i + 1) * 50).map(d => {
        const p = project({ down: d, side: 0 }, hole)
        return (
          <g key={d}>
            <line x1={-HALF_WIDTH} y1={p.y} x2={HALF_WIDTH} y2={p.y}
              stroke="var(--grid)" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity=".35" />
            <text x={-HALF_WIDTH + 4} y={p.y - 3} className="gridlabel">{d}</text>
          </g>
        )
      })}
    </>
  )
}

/** The original yardage-book rendering, untouched. This is the default. */
function ClassicCourse({ hole }: { hole: HoleSpec }) {
  const g = greenCentre(hole)
  const gp = project(g, hole)
  const depth = totalDepth(hole)
  return (
    <>
      {/* ground */}
      <rect x={-HALF_WIDTH} y="0" width={HALF_WIDTH * 2} height={depth} fill="var(--rough)" />

      {/* fairway corridor */}
      <path d={corridorPath(hole)} fill="var(--fairway)" />

      {/* yardage grid every 50 */}
      <YardGrid hole={hole} />

      {/* hazards */}
      {hole.hazards.map((h, i) => {
        const c = project(h.at, hole)
        return <ellipse key={i} cx={c.x} cy={c.y} rx={h.rSide} ry={h.rDown}
          fill={FILL[h.surface] ?? 'var(--rough)'} />
      })}

      {/* green — a full circle, because surfaceAt tests a full circle. The
          old ry×0.85 "perspective" squash drew the green two yards smaller
          than it played: a boundary that decides shots must be drawn where
          the sim believes it is (the terrain half of "the cone never lies"). */}
      <ellipse cx={gp.x} cy={gp.y} rx={hole.greenRadius} ry={hole.greenRadius}
        fill="var(--green)" stroke="var(--greenline)" strokeWidth="1.5"
        vectorEffect="non-scaling-stroke" />
    </>
  )
}

const TAPE_FILL: Record<string, string> = {
  water: 'var(--water)', bunker: 'var(--sand)', trees: 'var(--band-trees)',
  rough: 'var(--rough)', deep: 'var(--deep)',
}

/**
 * Sunday Tape rendering — GRAPHICS-PROPOSAL.md approach (a) in the direction
 * chosen 2026-08-24 (sunday-tape.css). Same sim truth, better clothes:
 *
 * - every fill is the true geometry, edges carry ≤1.5yd of deterministic
 *   hand-drawn wobble (holeArt.ts), decoration is clipped to the true shapes
 * - the two penalty boundaries are drawn CRISP at the exact sim edge: water
 *   gets a tube-ink outline on the true ellipse, OB gets a signal-red dashed
 *   line at exactly corridor+40 (signal red is spent on penalty only)
 * - the lie bands the sim already believes in (rough/deep/trees, and the
 *   all-deep zone past length+35) are finally drawn, where before they all
 *   rendered as undifferentiated rough
 */
function TapeCourse({ hole }: { hole: HoleSpec }) {
  const g = greenCentre(hole)
  const gp = project(g, hole)
  const depth = totalDepth(hole)
  const teeY = project({ down: 0, side: 0 }, hole).y
  const deepY = project({ down: hole.length + DEEP_BEYOND, side: 0 }, hole).y
  const fwEnd = hole.length + 20

  const art = useMemo(() => ({
    fairway: holeEdgeCorridor(hole),
    deepL: holeEdgeBand(hole, -1, ROUGH_BAND, DEEP_BAND),
    deepR: holeEdgeBand(hole, 1, ROUGH_BAND, DEEP_BAND),
    treesL: holeEdgeBand(hole, -1, DEEP_BAND, TREES_BAND),
    treesR: holeEdgeBand(hole, 1, DEEP_BAND, TREES_BAND),
    obL: holeEdgeBand(hole, -1, TREES_BAND, 95),
    obR: holeEdgeBand(hole, 1, TREES_BAND, 95),
    obLineL: obEdge(hole, -1),
    obLineR: obEdge(hole, 1),
    green: holeEdgeEllipse(hole, 50, greenCentre(hole), hole.greenRadius, hole.greenRadius),
  }), [hole])

  const obTeeHalf = corridorHalf(hole, 0) + TREES_BAND

  return (
    <>
      {/* base ground = the rough band (everything between corridor and deep) */}
      <rect x={-HALF_WIDTH} y="0" width={HALF_WIDTH * 2} height={depth} fill="var(--rough)" />

      {/* lie bands, exactly where surfaceAt puts them */}
      <path d={art.obL} fill="var(--ob-field)" />
      <path d={art.obR} fill="var(--ob-field)" />
      <path d={art.deepL} fill="var(--deep)" />
      <path d={art.deepR} fill="var(--deep)" />
      <path d={art.treesL} fill="var(--band-trees)" />
      <path d={art.treesR} fill="var(--band-trees)" />

      {/* past length+35 the sim calls everything deep, full width */}
      <rect x={-HALF_WIDTH} y="0" width={HALF_WIDTH * 2} height={Math.max(deepY, 0)} fill="var(--deep)" />

      {/* behind the tee is out of bounds, full width */}
      <rect x={-HALF_WIDTH} y={teeY} width={HALF_WIDTH * 2} height={Math.max(depth - teeY, 0)}
        fill="var(--ob-field)" />

      {/* fairway, with mowline banding clipped to its own drawn shape */}
      <defs>
        <clipPath id={`h${hole.num}-fw`}><path d={art.fairway} /></clipPath>
      </defs>
      <path d={art.fairway} fill="var(--fairway)" stroke="var(--tube)" strokeWidth="1"
        vectorEffect="non-scaling-stroke" />
      {Array.from({ length: Math.ceil(fwEnd / 60) }, (_, k) => k).map(k => {
        const a = k * 60 + 30
        const b = Math.min(k * 60 + 60, fwEnd)
        if (a >= b) return null
        const y1 = project({ down: b, side: 0 }, hole).y
        const y2 = project({ down: a, side: 0 }, hole).y
        return <rect key={k} x={-HALF_WIDTH} y={y1} width={HALF_WIDTH * 2} height={y2 - y1}
          fill="var(--bent)" opacity=".13" clipPath={`url(#h${hole.num}-fw)`} />
      })}

      {/* yardage grid — phosphor via scoped tokens */}
      <YardGrid hole={hole} />

      {/* hazards: wobbled fills, textures clipped to the TRUE ellipse,
          and every shape outlined in tube ink (outline rule, sunday-tape.css) */}
      {hole.hazards.map((h, i) => {
        const c = project(h.at, hole)
        const blob = holeEdgeEllipse(hole, 100 + i, h.at, h.rDown, h.rSide)
        const clipId = `h${hole.num}-hz${i}`
        if (h.surface === 'water') {
          return (
            <g key={i}>
              <defs>
                <clipPath id={clipId}><ellipse cx={c.x} cy={c.y} rx={h.rSide} ry={h.rDown} /></clipPath>
              </defs>
              <path d={blob} fill="var(--water)" />
              <g clipPath={`url(#${clipId})`}>
                <path d={holeEdgeEllipse(hole, 160 + i, h.at, h.rDown * 0.62, h.rSide * 0.62)}
                  fill="none" stroke="var(--ink)" strokeOpacity=".14" strokeWidth="1"
                  vectorEffect="non-scaling-stroke" />
                <path d={holeEdgeEllipse(hole, 190 + i, h.at, h.rDown * 0.32, h.rSide * 0.32)}
                  fill="none" stroke="var(--ink)" strokeOpacity=".14" strokeWidth="1"
                  vectorEffect="non-scaling-stroke" />
              </g>
              {/* water costs a stroke — its true edge is drawn crisp, exactly */}
              <ellipse cx={c.x} cy={c.y} rx={h.rSide} ry={h.rDown} fill="none"
                stroke="var(--tube)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
            </g>
          )
        }
        if (h.surface === 'bunker') {
          return (
            <g key={i}>
              <defs>
                <clipPath id={clipId}><ellipse cx={c.x} cy={c.y} rx={h.rSide} ry={h.rDown} /></clipPath>
              </defs>
              <path d={blob} fill="var(--sand)" stroke="var(--tube)" strokeWidth="1"
                vectorEffect="non-scaling-stroke" />
              <g clipPath={`url(#${clipId})`} fill="var(--tube)" opacity=".22">
                {scatterInEllipse(hole, 130 + i, h.at, h.rDown, h.rSide, 12, 0.4, 0.9, 0.75)
                  .map((p, k) => <circle key={k} cx={p.x} cy={p.y} r={p.r} />)}
              </g>
            </g>
          )
        }
        if (h.surface === 'trees') {
          const blobs = Math.max(8, Math.round((h.rDown * h.rSide) / 40))
          return (
            <g key={i}>
              <defs>
                <clipPath id={clipId}><ellipse cx={c.x} cy={c.y} rx={h.rSide} ry={h.rDown} /></clipPath>
              </defs>
              <path d={blob} fill="var(--band-trees)" stroke="var(--tube)" strokeWidth="1"
                vectorEffect="non-scaling-stroke" />
              <g clipPath={`url(#${clipId})`} fill="var(--fairway)" opacity=".28">
                {scatterInEllipse(hole, 220 + i, h.at, h.rDown, h.rSide, blobs, 3, 6.5, 0.95)
                  .map((p, k) => <circle key={k} cx={p.x} cy={p.y} r={p.r} />)}
              </g>
            </g>
          )
        }
        return <path key={i} d={blob} fill={TAPE_FILL[h.surface] ?? 'var(--rough)'}
          stroke="var(--tube)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      })}

      {/* green: bentgrass fill with edge character, true circle drawn crisp
          (full circle — surfaceAt tests a full circle; keep it that way) */}
      <path d={art.green} fill="var(--green)" />
      <ellipse cx={gp.x} cy={gp.y} rx={hole.greenRadius} ry={hole.greenRadius} fill="none"
        stroke="var(--tube)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      <circle cx={gp.x} cy={gp.y} r={hole.greenRadius * 0.55} fill="none"
        stroke="var(--tube)" strokeWidth="1" opacity=".18" vectorEffect="non-scaling-stroke" />

      {/* OB — two strokes. Signal red is spent here and nowhere decorative. */}
      <path d={art.obLineL} fill="none" stroke="var(--signal)" strokeWidth="1.4"
        strokeDasharray="7 5" vectorEffect="non-scaling-stroke" opacity=".85" />
      <path d={art.obLineR} fill="none" stroke="var(--signal)" strokeWidth="1.4"
        strokeDasharray="7 5" vectorEffect="non-scaling-stroke" opacity=".85" />
      <line x1={-obTeeHalf} y1={teeY} x2={obTeeHalf} y2={teeY}
        stroke="var(--signal)" strokeWidth="1.4" strokeDasharray="7 5"
        vectorEffect="non-scaling-stroke" opacity=".6" />
    </>
  )
}

/**
 * Full-hole locator strip, shown when the camera window (§2.3 of
 * MOBILE-PROPOSAL.md) has cropped the view. Same viewBox() and project()
 * as the main figure — one code path, two windows. It draws NO cone, so it
 * cannot violate the shared-scale contract: that contract binds the cone
 * to the ground it is drawn on, and the cone is only drawn on the main view.
 */
function MiniMap({ hole, ball, winDepth }: { hole: HoleSpec; ball: Point; winDepth: number }) {
  const g = greenCentre(hole)
  const gp = project(g, hole)
  const bp = project(ball, hole)
  return (
    <svg className="minimap" viewBox={viewBox(hole)} preserveAspectRatio="xMidYMid meet"
      aria-hidden="true">
      <rect x={-HALF_WIDTH} y="0" width={HALF_WIDTH * 2} height={totalDepth(hole)}
        fill="var(--rough)" />
      <path d={corridorPath(hole)} fill="var(--fairway)" />
      {hole.hazards.map((h, i) => {
        const c = project(h.at, hole)
        return <ellipse key={i} cx={c.x} cy={c.y} rx={h.rSide} ry={h.rDown}
          fill={FILL[h.surface] ?? 'var(--rough)'} />
      })}
      <ellipse cx={gp.x} cy={gp.y} rx={hole.greenRadius} ry={hole.greenRadius}
        fill="var(--green)" />
      {/* the bracket: what the main view is currently showing */}
      <rect x={-HALF_WIDTH + 2} y={1} width={HALF_WIDTH * 2 - 4} height={Math.max(winDepth - 2, 1)}
        fill="none" stroke="var(--cone)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
      <circle cx={bp.x} cy={bp.y} r="9" fill="#fff" stroke="var(--ink)" strokeWidth="1"
        vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

const ART_KEY = 'water-art'

function readArtFlag(): boolean {
  try {
    return window.localStorage.getItem(ART_KEY) === 'tape'
  } catch {
    return false
  }
}

function writeArtFlag(on: boolean): void {
  try {
    if (on) window.localStorage.setItem(ART_KEY, 'tape')
    else window.localStorage.removeItem(ART_KEY)
  } catch {
    /* storage unavailable — the toggle still works for this session */
  }
}

export function HoleView({
  hole, ball, cone, showCone, ignoreHazards = false,
}: {
  hole: HoleSpec; ball: Point; cone: Cone | null; showCone: boolean
  /** the armed plan carries Bail Out — water and OB inside the cone are rough */
  ignoreHazards?: boolean
}) {
  // Art toggle lives HERE, not in App: flip old/new live, default = classic.
  const [tape, setTape] = useState(readArtFlag)
  const toggle = () => setTape(t => {
    writeArtFlag(!t)
    return !t
  })

  const g = greenCentre(hole)
  const gp = project(g, hole)
  const bp = project(ball, hole)

  // The camera follows the BALL, never the staged cone — toggling a technique
  // must not move the ground under the preview (MOBILE-PROPOSAL.md §2.3).
  // On the tee this is the full hole, exactly today's view.
  const from = ball.down > 0 ? ball.down - 15 : undefined
  const lo = windowFrom(hole, from)
  const winDepth = hole.length + 30 - lo
  const windowed = lo > -RUNOUT

  // px per yard of the rendered figure, so markers and labels can hold a
  // fixed SCREEN size while everything geometric stays in yard space.
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [k, setK] = useState(1)
  useLayoutEffect(() => {
    const el = svgRef.current
    if (!el) return
    const update = () => {
      const w = el.clientWidth, h = el.clientHeight
      if (w > 0 && h > 0) setK(Math.min(w / (HALF_WIDTH * 2), h / winDepth))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [winDepth])

  // never smaller than ~4.5px on screen; never bigger than the classic look
  const ballR = Math.max(5, 4.5 / k)
  const mk = Math.max(1, 0.8 / k)
  const gridFs = Math.max(9, 10 / k)

  return (
    <div className={tape ? 'holewrap tape' : 'holewrap'}
      style={{ '--gridfs': `${gridFs.toFixed(1)}px` } as CSSProperties}>
      <svg ref={svgRef} className="holeview" viewBox={viewBox(hole, from)}
        preserveAspectRatio="xMidYMin meet">
        {tape ? <TapeCourse hole={hole} /> : <ClassicCourse hole={hole} />}

        {/* the lake the Bail Out has taken out of play, under the cone */}
        {showCone && cone && ignoreHazards
          && <SafeTint hole={hole} from={ball} cone={cone} tape={tape} />}

        {/* cone — identical in both looks, always above the terrain */}
        {showCone && cone && <ConeShape hole={hole} from={ball} cone={cone} />}

        {/* pin */}
        <line x1={gp.x} y1={gp.y} x2={gp.x} y2={gp.y - 26 * mk}
          stroke="var(--ink)" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
        <polygon points={`${gp.x},${gp.y - 26 * mk} ${gp.x + 15 * mk},${gp.y - 20 * mk} ${gp.x},${gp.y - 14 * mk}`}
          fill="var(--pin)" />

        {/* ball */}
        <circle className="ballmark" cx={bp.x} cy={bp.y} r={ballR} fill="#fff" stroke="var(--ink)"
          strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>

      {windowed && <MiniMap hole={hole} ball={ball} winDepth={winDepth} />}

      {/* broadcast furniture: one bug, the scanlines, the vignette — tape only */}
      {tape && <div className="scan" />}
      {tape && <div className="vig" />}
      {tape && <div className="tapebug">{`HOLE ${hole.num} · PAR ${hole.par} · ${hole.length}`}</div>}

      <button className="artbtn" type="button" onClick={toggle}
        title="Course art: classic yardage book / Sunday Tape broadcast">
        {tape ? 'TAPE' : 'CLASSIC'}
      </button>
    </div>
  )
}
