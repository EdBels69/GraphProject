interface Node {
  id: string
  name: string
  type: string
  degree: number
  betweenness: number
}

interface Edge {
  id: string
  source: string
  target: string
  type: string
  weight: number
}

interface PositionedNode extends Node {
  x: number
  y: number
}

export function calculateForceLayout(
  nodes: Node[],
  edges: Edge[],
  width: number,
  height: number,
  iterations: number = 100
): PositionedNode[] {
  const positionedNodes = nodes.map(node => ({
    ...node,
    x: (Math.random() - 0.5) * width,
    y: (Math.random() - 0.5) * height
  }))

  const k = Math.sqrt((width * height) / nodes.length)
  const repulsion = 10000
  const attraction = 0.01

  for (let iter = 0; iter < iterations; iter++) {
    positionedNodes.forEach(node => {
      let fx = 0
      let fy = 0

      positionedNodes.forEach(other => {
        if (node.id === other.id) return

        const dx = node.x - other.x
        const dy = node.y - other.y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1

        const force = repulsion / (distance * distance)
        fx += (dx / distance) * force
        fy += (dy / distance) * force
      })

      edges.forEach(edge => {
        if (edge.source === node.id) {
          const other = positionedNodes.find(n => n.id === edge.target)
          if (other) {
            const dx = other.x - node.x
            const dy = other.y - node.y
            const distance = Math.sqrt(dx * dx + dy * dy) || 1

            const force = attraction * distance * edge.weight
            fx += (dx / distance) * force
            fy += (dy / distance) * force
          }
        } else if (edge.target === node.id) {
          const other = positionedNodes.find(n => n.id === edge.source)
          if (other) {
            const dx = other.x - node.x
            const dy = other.y - node.y
            const distance = Math.sqrt(dx * dx + dy * dy) || 1

            const force = attraction * distance * edge.weight
            fx += (dx / distance) * force
            fy += (dy / distance) * force
          }
        }
      })

      const centeringForce = 0.001
      fx -= node.x * centeringForce
      fy -= node.y * centeringForce

      const maxForce = 50
      const force = Math.sqrt(fx * fx + fy * fy)
      if (force > maxForce) {
        fx = (fx / force) * maxForce
        fy = (fy / force) * maxForce
      }

      node.x += fx
      node.y += fy
    })
  }

  return positionedNodes
}

export function calculateCircularLayout(
  nodes: Node[],
  radius: number
): PositionedNode[] {
  return nodes.map((node, index) => {
    const angle = (index / nodes.length) * 2 * Math.PI - Math.PI / 2
    return {
      ...node,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    }
  })
}

export function calculateHierarchicalLayout(
  nodes: Node[],
  edges: Edge[],
  levelHeight: number = 150
): PositionedNode[] {
  const nodeLevels = new Map<string, number>()
  const visited = new Set<string>()

  const getLevel = (nodeId: string): number => {
    if (visited.has(nodeId)) {
      return nodeLevels.get(nodeId) || 0
    }
    visited.add(nodeId)

    const outgoingEdges = edges.filter(e => e.source === nodeId)
    if (outgoingEdges.length === 0) {
      nodeLevels.set(nodeId, 0)
      return 0
    }

    const childLevels = outgoingEdges.map(e => getLevel(e.target))
    const maxLevel = Math.max(...childLevels)
    nodeLevels.set(nodeId, maxLevel + 1)
    return maxLevel + 1
  }

  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      getLevel(node.id)
    }
  })

  const levelGroups = new Map<number, Node[]>()
  nodeLevels.forEach((level, nodeId) => {
    if (!levelGroups.has(level)) {
      levelGroups.set(level, [])
    }
    const node = nodes.find(n => n.id === nodeId)
    if (node) {
      levelGroups.get(level)!.push(node)
    }
  })

  const positionedNodes: PositionedNode[] = []
  levelGroups.forEach((nodesInLevel, level) => {
    const y = -level * levelHeight
    const width = 800
    const spacing = width / (nodesInLevel.length + 1)

    nodesInLevel.forEach((node, index) => {
      const x = -width / 2 + spacing * (index + 1)
      positionedNodes.push({
        ...node,
        x,
        y
      })
    })
  })

  return positionedNodes
}

export function getNodeDegree(
  nodeId: string,
  edges: Edge[]
): number {
  return edges.filter(e => e.source === nodeId || e.target === nodeId).length
}

export function getConnectedNodes(
  nodeId: string,
  edges: Edge[],
  nodes: Node[]
): Node[] {
  const connectedIds = edges
    .filter(e => e.source === nodeId || e.target === nodeId)
    .map(e => e.source === nodeId ? e.target : e.source)

  return nodes.filter(n => connectedIds.includes(n.id))
}

export function findShortestPath(
  startId: string,
  endId: string,
  edges: Edge[]
): string[] {
  const queue: string[] = [startId]
  const visited = new Set<string>([startId])
  const parent = new Map<string, string>()

  while (queue.length > 0) {
    const current = queue.shift()!

    if (current === endId) {
      const path: string[] = []
      let node: string | undefined = endId
      while (node) {
        path.unshift(node)
        node = parent.get(node)
      }
      return path
    }

    const neighbors = edges
      .filter(e => e.source === current || e.target === current)
      .map(e => e.source === current ? e.target : e.source)

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        parent.set(neighbor, current)
        queue.push(neighbor)
      }
    }
  }

  return []
}
