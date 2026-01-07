interface GraphNodeProps {
  x: number
  y: number
  radius: number
  fill: string
  stroke: string
  strokeWidth: number
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  year?: number
  citations?: number
  scale: number
}

export function GraphNode({
  x,
  y,
  radius,
  fill,
  stroke,
  strokeWidth,
  onClick,
  onMouseEnter,
  onMouseLeave,
  year,
  citations,
  scale
}: GraphNodeProps) {
  return (
    <g className="cursor-pointer transition-all duration-300">
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="hover:fill-indigo-600 transition-colors"
      />
      {year && (
        <text
          x={x}
          y={y - radius - 10}
          textAnchor="middle"
          fontSize={14 * scale}
          fill="#374151"
          className="pointer-events-none"
        >
          {year}
        </text>
      )}
      {citations !== undefined && (
        <text
          x={x}
          y={y + radius + 20}
          textAnchor="middle"
          fontSize={12 * scale}
          fill="#6b7280"
          className="pointer-events-none"
        >
          {citations} цит.
        </text>
      )}
    </g>
  )
}
