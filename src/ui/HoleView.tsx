import type { Cone, HoleSpec, Point } from '../sim/types'
import { corridorHalf, greenCentre } from '../sim/geometry'
import { aimFrame } from '../sim/resolve/shot'
import { HALF_WIDTH, project, totalDepth, viewBox } from './scale'

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
 */
function ConeShape({ hole, from, cone }: { hole: HoleSpec; from: Point; cone: Cone }) {
  const { dir, perp } = aimFrame(hole, from)
  const at = (fwd: number, lat: number): Point => ({
    down: from.down + dir.down * fwd + perp.down * lat,
    side: from.side + dir.side * fwd + perp.side * lat,
  })
  const o = cone.aimOffset
  const a = project(from, hole)
  const l = project(at(cone.carry, o - cone.spread), hole)
  const r = project(at(cone.carry, o + cone.spread), hole)
  const mid = project(at(cone.carry, o), hole)
  const near = project(at(cone.carry * 0.94, o), hole)
  return (
    <g className="cone">
      <path
        d={`M ${a.x},${a.y} L ${l.x},${l.y} A ${cone.spread} ${cone.spread * 0.35} 0 0 1 ${r.x},${r.y} Z`}
        fill="var(--cone)" fillOpacity="0.34" stroke="var(--cone)"
        strokeWidth="1.6" strokeDasharray="7 5" vectorEffect="non-scaling-stroke"
      />
      <line x1={a.x} y1={a.y} x2={near.x} y2={near.y}
        stroke="var(--cone)" strokeWidth="1.2" strokeDasharray="4 6"
        vectorEffect="non-scaling-stroke" opacity=".8" />
      <circle cx={mid.x} cy={mid.y} r="3.5" fill="var(--cone)" opacity=".9" />
    </g>
  )
}

export function HoleView({
  hole, ball, cone, showCone,
}: { hole: HoleSpec; ball: Point; cone: Cone | null; showCone: boolean }) {
  const g = greenCentre(hole)
  const gp = project(g, hole)
  const bp = project(ball, hole)
  const depth = totalDepth(hole)

  return (
    <svg className="holeview" viewBox={viewBox(hole)} preserveAspectRatio="xMidYMin meet">
      {/* ground */}
      <rect x={-HALF_WIDTH} y="0" width={HALF_WIDTH * 2} height={depth} fill="var(--rough)" />

      {/* fairway corridor */}
      <path d={corridorPath(hole)} fill="var(--fairway)" />

      {/* yardage grid every 50 */}
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

      {/* cone */}
      {showCone && cone && <ConeShape hole={hole} from={ball} cone={cone} />}

      {/* pin */}
      <line x1={gp.x} y1={gp.y} x2={gp.x} y2={gp.y - 26}
        stroke="var(--ink)" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
      <polygon points={`${gp.x},${gp.y - 26} ${gp.x + 15},${gp.y - 20} ${gp.x},${gp.y - 14}`}
        fill="var(--pin)" />

      {/* ball */}
      <circle cx={bp.x} cy={bp.y} r="5" fill="#fff" stroke="var(--ink)"
        strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
