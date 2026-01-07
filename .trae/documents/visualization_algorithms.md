# Система визуализации связей и алгоритмы выявления закономерностей

## 1. Система визуализации связей

### 1.1 Технологический стек визуализации

**Frontend библиотеки**:
- **React Flow**: Интерактивная визуализация графов с зумом, панорамированием, drag-and-drop
- **D3.js**: Расширенные визуализации (force-directed, sankey, chord diagrams)
- **Recharts**: Статистические графики (bar, line, pie, scatter plots)
- **Three.js**: 3D визуализация больших графов (опционально)

**Backend библиотеки**:
- **NetworkX**: Графовые алгоритмы и метрики
- **Pyvis**: Интерактивная генерация графов для веба
- **Plotly**: Создание интерактивных графиков
- **Graph-tool**: Высокопроизводительные операции над графами (для больших данных)

### 1.2 Визуализация графов

#### 1.2.1 Force-Directed Layout

**Описание**: Вершины располагаются так, что связанные вершины притягиваются друг к другу

**Алгоритм**: Fruchterman-Reingold
```python
import networkx as nx
from pyvis.network import Network

def create_force_directed_layout(graph, output_file="graph.html"):
    net = Network(height="750px", width="100%", notebook=True)
    
    for node in graph.nodes():
        net.add_node(
            node,
            label=node,
            title=f"Type: {graph.nodes[node]['type']}\nDegree: {graph.degree(node)}",
            color=get_node_color(graph.nodes[node]['type']),
            size=get_node_size(graph.degree(node))
        )
    
    for edge in graph.edges():
        net.add_edge(
            edge[0], edge[1],
            title=f"Type: {graph.edges[edge]['type']}\nWeight: {graph.edges[edge]['weight']}",
            width=graph.edges[edge]['weight'],
            color=get_edge_color(graph.edges[edge]['type'])
        )
    
    net.force_atlas_2based()
    net.show(output_file)
```

**Функции интерактивности**:
- Zoom: колесико мыши
- Pan: drag на пустом пространстве
- Drag node: перетаскивание вершин
- Hover: tooltips с детальной информацией
- Click: выделение связанных вершин
- Filter: фильтрация по типам связей
- Search: поиск по имени сущности

#### 1.2.2 Слойная визуализация (Hierarchical Layout)

**Описание**: Визуализация иерархических структур (сигнальные каскады, метаболические пути)

**Алгоритм**: Sugiyama или Reingold-Tilford
```python
def create_hierarchical_layout(graph, root_node):
    # Создаем DAG (направленный ациклический граф)
    dag = nx.DiGraph()
    
    # Добавляем вершины и ребра
    for node in graph.nodes():
        dag.add_node(node)
    for edge in graph.edges():
        dag.add_edge(edge[0], edge[1])
    
    # Вычисляем слои
    layers = nx.topological_generations(dag)
    
    # Визуализируем с D3
    return create_d3_hierarchy(layers)
```

**Применение**:
- Сигнальные пути (MAPK, PI3K/Akt)
- Клеточный цикл
- Апоптоз
- Регуляция транскрипции

#### 1.2.3 Визуализация сообществ

**Описание**: Группировка вершин в сообщества с разными цветами

**Алгоритм**: После community detection (Louvain)
```python
def visualize_communities(graph, communities):
    color_map = assign_colors_to_communities(communities)
    
    net = Network(height="750px", width="100%")
    
    for node in graph.nodes():
        community_id = get_community_id(node, communities)
        net.add_node(
            node,
            label=node,
            color=color_map[community_id],
            title=f"Community: {community_id}"
        )
    
    # Добавляем границы вокруг сообществ
    for community in communities:
        add_community_border(net, community, color_map[community.id])
    
    net.show("communities.html")
```

**Метрики качества сообществ**:
- Modularity (0-1, выше лучше)
- Conductance (0-1, ниже лучше)
- Triangle participation ratio
- Internal vs external edges

#### 1.2.4 Временная визуализация (Dynamic Graph)

**Описание**: Визуализация изменений графа во времени

**Алгоритм**: Time-sliced visualization
```python
def create_dynamic_visualization(time_slices):
    """time_slices: [{period, nodes, edges}, ...]"""
    
    # Создаем D3.js timeline visualization
    timeline_data = {
        "slices": []
    }
    
    for i, slice_data in enumerate(time_slices):
        timeline_data["slices"].append({
            "period": slice_data["period"],
            "nodes": slice_data["nodes"],
            "edges": slice_data["edges"],
            "changes": calculate_changes(
                time_slices[i-1] if i > 0 else None,
                slice_data
            )
        })
    
    return create_d3_timeline(timeline_data)
```

**Функции**:
- Play/Pause кнопки
- Slider для навигации по времени
- Highlight изменений (добавленные/удаленные элементы)
- Статистика для каждого среза

### 1.3 Визуализация метрик

#### 1.3.1 Распределение центральностей

**Типы графиков**:
- **Bar chart**: Top-N вершин по метрике
- **Histogram**: Распределение значений метрики
- **Scatter plot**: Сравнение двух метрик (degree vs betweenness)
- **Box plot**: Статистическое сравнение подграфов

```python
import plotly.express as px

def visualize_centrality_distribution(graph):
    # Вычисляем метрики
    degree_centrality = nx.degree_centrality(graph)
    betweenness_centrality = nx.betweenness_centrality(graph)
    
    # Создаем DataFrame
    df = pd.DataFrame({
        "node": list(graph.nodes()),
        "degree": list(degree_centrality.values()),
        "betweenness": list(betweenness_centrality.values()),
        "type": [graph.nodes[n]["type"] for n in graph.nodes()]
    })
    
    # Bar chart - Top 20 by degree
    fig1 = px.bar(
        df.nlargest(20, "degree"),
        x="degree",
        y="node",
        color="type",
        title="Top 20 Nodes by Degree Centrality"
    )
    
    # Scatter plot - Degree vs Betweenness
    fig2 = px.scatter(
        df,
        x="degree",
        y="betweenness",
        color="type",
        hover_data=["node"],
        title="Degree vs Betweenness Centrality"
    )
    
    return fig1, fig2
```

#### 1.3.2 Heatmap взаимодействий

**Описание**: Матрица связности между типами сущностей

```python
def create_interaction_heatmap(graph):
    # Собираем типы сущностей
    entity_types = set(
        graph.nodes[n]["type"] for n in graph.nodes()
    )
    
    # Создаем матрицу
    matrix = pd.DataFrame(0, index=entity_types, columns=entity_types)
    
    # Заполняем матрицу
    for edge in graph.edges():
        source_type = graph.nodes[edge[0]]["type"]
        target_type = graph.nodes[edge[1]]["type"]
        matrix.loc[source_type, target_type] += 1
    
    # Визуализируем
    fig = px.imshow(
        matrix,
        labels=dict(x="Target Type", y="Source Type"),
        color_continuous_scale="Blues",
        title="Interaction Type Heatmap"
    )
    
    return fig
```

#### 1.3.3 Chord Diagram

**Описание**: Визуализация связей между группами сущностей

```python
def create_chord_diagram(graph):
    # Группируем по типам
    type_connections = defaultdict(lambda: defaultdict(int))
    
    for edge in graph.edges():
        source_type = graph.nodes[edge[0]]["type"]
        target_type = graph.nodes[edge[1]]["type"]
        type_connections[source_type][target_type] += 1
    
    # Создаем chord diagram
    links = []
    for source, targets in type_connections.items():
        for target, count in targets.items():
            links.append({
                "source": source,
                "target": target,
                "value": count
            })
    
    return create_d3_chord(links)
```

### 1.4 Расширенная визуализация

#### 1.4.1 Фильтрация и управление

**UI компоненты**:
```typescript
interface GraphControlsProps {
  filters: {
    nodeTypes: string[];
    edgeTypes: string[];
    minWeight: number;
    maxWeight: number;
    minDegree: number;
    maxDegree: number;
  };
  layout: 'force' | 'hierarchical' | 'circular';
  showLabels: boolean;
  nodeSizeMetric: 'degree' | 'betweenness' | 'none';
  colorBy: 'type' | 'community' | 'centrality';
}

export function GraphControls({ filters, layout, ... }: GraphControlsProps) {
  return (
    <div className="controls-panel">
      {/* Filter Controls */}
      <FilterSection filters={filters} />
      
      {/* Layout Selector */}
      <LayoutSelector value={layout} onChange={setLayout} />
      
      {/* Display Options */}
      <DisplayOptions
        showLabels={showLabels}
        nodeSizeMetric={nodeSizeMetric}
        colorBy={colorBy}
      />
    </div>
  );
}
```

#### 1.4.2 Анимация процессов

**Типы анимаций**:
- **Propagation animation**: Распространение сигнала по путям
- **Community formation**: Пошаговое образование сообществ
- **Edge addition**: Постепенное добавление связей
- **Node highlighting**: Подсветка связанных вершин

```javascript
function animateSignalPropagation(graph, startNode, duration = 2000) {
  const visited = new Set();
  const queue = [startNode];
  const startTime = Date.now();
  
  function step() {
    const currentTime = Date.now();
    const progress = (currentTime - startTime) / duration;
    
    if (progress >= 1 || queue.length === 0) {
      return; // Animation complete
    }
    
    const currentLevel = [...queue];
    queue.length = 0;
    
    for (const node of currentLevel) {
      if (!visited.has(node)) {
        visited.add(node);
        highlightNode(node, progress);
        
        // Add neighbors to next level
        for (const neighbor of graph.neighbors(node)) {
          if (!visited.has(neighbor)) {
            queue.push(neighbor);
          }
        }
      }
    }
    
    requestAnimationFrame(step);
  }
  
  step();
}
```

#### 1.4.3 3D визуализация (опционально)

**Использование Three.js для больших графов**:
```typescript
import * as THREE from 'three';

function create3DGraph(graphData: GraphData) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
  );
  const renderer = new THREE.WebGLRenderer();
  
  // Create nodes
  const nodeGeometry = new THREE.SphereGeometry(0.1, 32, 32);
  const nodeMaterial = new THREE.MeshPhongMaterial({
    color: 0x44aaff,
    shininess: 100
  });
  
  const nodes = graphData.nodes.map(node => {
    const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
    mesh.position.set(node.x, node.y, node.z);
    mesh.userData = node;
    scene.add(mesh);
    return mesh;
  });
  
  // Create edges
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });
  const edges = graphData.edges.map(edge => {
    const points = [
      new THREE.Vector3(edge.source.x, edge.source.y, edge.source.z),
      new THREE.Vector3(edge.target.x, edge.target.y, edge.target.z)
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, edgeMaterial);
    scene.add(line);
    return line;
  });
  
  return { scene, camera, renderer, nodes, edges };
}
```

## 2. Алгоритмы автоматического выявления закономерностей

### 2.1 Выявление частых паттернов

#### 2.1.1 Motif Detection

**Описание**: Поиск повторяющихся подграфов (motifs) в большом графе

**Алгоритм**: ESU (Enumerate Subgraphs)
```python
from itertools import combinations

def find_motifs(graph, size=3):
    """Find all subgraphs of given size"""
    motifs = {}
    
    for node_combination in combinations(graph.nodes(), size):
        subgraph = graph.subgraph(node_combination)
        if subgraph.number_of_edges() > 0:
            # Canonical representation
            canonical = canonical_form(subgraph)
            motifs[canonical] = motifs.get(canonical, 0) + 1
    
    # Filter by frequency
    frequent_motifs = {
        motif: count for motif, count in motifs.items()
        if count >= MIN_FREQUENCY_THRESHOLD
    }
    
    return frequent_motifs

def canonical_form(graph):
    """Generate canonical representation of subgraph"""
    adjacency = nx.to_numpy_array(graph)
    # Use graph isomorphism to find canonical form
    return tuple(sorted(adjacency.flatten()))
```

**Типы мотивов**:
- **Feed-forward loop**: A → B → C, A → C
- **Feedback loop**: A → B → C → A
- **Bi-fan**: A → B, A → C
- **Bi-parallel**: A → C, B → C
- **Regulatory cascade**: A → B → C → D

#### 2.1.2 Frequent Subgraph Mining

**Описание**: Поиск часто встречающихся подграфов больше размера

**Алгоритм**: gSpan (Graph-based Substructure pattern mining)
```python
from collections import defaultdict

def frequent_subgraph_mining(graphs, min_support=2):
    """
    Find frequent subgraphs across multiple graphs
    
    graphs: list of NetworkX graphs
    min_support: minimum number of graphs containing subgraph
    """
    # Initialize with single-edge patterns
    patterns = initialize_single_edge_patterns(graphs)
    
    # Iteratively extend patterns
    while patterns:
        new_patterns = []
        
        for pattern in patterns:
            # Extend pattern with one edge
            extended = extend_pattern(pattern, graphs)
            
            for ext in extended:
                # Calculate support
                support = calculate_support(ext, graphs)
                
                if support >= min_support:
                    new_patterns.append(ext)
        
        patterns = new_patterns
    
    return patterns

def calculate_support(pattern, graphs):
    """Count graphs containing pattern"""
    count = 0
    for graph in graphs:
        if subgraph_isomorphic(pattern, graph):
            count += 1
    return count
```

### 2.2 Выявление скрытых зависимостей

#### 2.2.1 Bridge Detection

**Описание**: Поиск ребер, которые соединяют разные сообщества

**Алгоритм**: Girvan-Newman или edge betweenness
```python
def find_bridges(graph):
    """Find edges that connect different communities"""
    bridges = []
    
    # Calculate edge betweenness
    edge_betweenness = nx.edge_betweenness_centrality(graph)
    
    # Find high-betweenness edges
    avg_betweenness = sum(edge_betweenness.values()) / len(edge_betweenness)
    threshold = avg_betweenness * BRIDGE_THRESHOLD_MULTIPLIER
    
    for edge, betweenness in edge_betweenness.items():
        if betweenness > threshold:
            # Check if removing edge increases number of components
            temp_graph = graph.copy()
            temp_graph.remove_edge(*edge)
            
            if nx.number_connected_components(temp_graph) > \
               nx.number_connected_components(graph):
                bridges.append({
                    "edge": edge,
                    "betweenness": betweenness,
                    "significance": betweenness / avg_betweenness
                })
    
    return sorted(bridges, key=lambda x: x["significance"], reverse=True)
```

#### 2.2.2 Indirect Path Analysis

**Описание**: Поиск непрямых связей между сущностями

**Алгоритм**: K-shortest paths или All-pairs shortest paths
```python
def find_indirect_connections(graph, source, target, max_length=5):
    """Find indirect paths between two nodes"""
    
    # Find all simple paths up to max_length
    paths = []
    
    for path in nx.all_simple_paths(
        graph, source, target, cutoff=max_length
    ):
        if len(path) > 2:  # Exclude direct connection
            paths.append({
                "path": path,
                "length": len(path) - 1,
                "confidence": calculate_path_confidence(graph, path)
            })
    
    # Sort by confidence
    return sorted(paths, key=lambda x: x["confidence"], reverse=True)

def calculate_path_confidence(graph, path):
    """Calculate confidence based on edge weights"""
    if len(path) < 2:
        return 0
    
    product = 1
    for i in range(len(path) - 1):
        edge = (path[i], path[i+1])
        weight = graph.edges[edge].get("confidence", 0.5)
        product *= weight
    
    return product ** (1 / (len(path) - 1))
```

#### 2.2.3 Correlation Analysis

**Описание**: Поиск корреляций между активностью сущностей

**Алгоритм**: Pearson correlation или Mutual Information
```python
import numpy as np
from scipy import stats

def find_correlated_entities(graph, expression_data):
    """
    expression_data: {entity_id: [values]}
    """
    correlations = []
    
    entities = list(expression_data.keys())
    for i, entity1 in enumerate(entities):
        for entity2 in entities[i+1:]:
            # Calculate Pearson correlation
            corr, p_value = stats.pearsonr(
                expression_data[entity1],
                expression_data[entity2]
            )
            
            # Check significance
            if abs(corr) > MIN_CORRELATION and p_value < 0.05:
                correlations.append({
                    "entity1": entity1,
                    "entity2": entity2,
                    "correlation": corr,
                    "p_value": p_value,
                    "significant": p_value < 0.01
                })
    
    return sorted(correlations, key=lambda x: abs(x["correlation"]), reverse=True)
```

### 2.3 Выявление causal relationships

#### 2.3.1 Causal Inference

**Описание**: Определение причинно-следственных связей

**Алгоритм**: PC Algorithm или Do-Calculus
```python
from causallearn.search.ConstraintBased.PC import pc
from causallearn.utils.GraphUtils import GraphUtils

def infer_causal_graph(data, entities):
    """
    Infer causal relationships from observational data
    
    data: pandas DataFrame with entity activities
    entities: list of entity names
    """
    # Run PC algorithm
    cg = pc(data, alpha=0.05)
    
    # Convert to NetworkX graph
    causal_graph = GraphUtils.to_nx_graph(cg.G)
    
    # Annotate edges with direction
    for edge in causal_graph.edges():
        causal_graph.edges[edge]["type"] = "causal"
        causal_graph.edges[edge]["strength"] = estimate_edge_strength(
            data, edge[0], edge[1]
        )
    
    return causal_graph
```

#### 2.3.2 Temporal Causality

**Описание**: Поиск временных причинно-следственных связей

**Алгоритм**: Granger Causality
```python
from statsmodels.tsa.stattools import grangercausalitytests

def find_granger_causality(time_series, max_lag=5):
    """
    Find Granger-causal relationships
    
    time_series: {entity: [values]}
    max_lag: maximum lag for causality test
    """
    causality = []
    
    entities = list(time_series.keys())
    for i, cause in enumerate(entities):
        for effect in entities[i+1:]:
            # Prepare data
            data = pd.DataFrame({
                "cause": time_series[cause],
                "effect": time_series[effect]
            })
            
            # Test Granger causality
            test_result = grangercausalitytests(
                data, maxlag=max_lag, verbose=False
            )
            
            # Extract p-values
            min_p_value = min(
                test_result[i][1]["ssr_ftest"][0]
                for i in range(max_lag)
            )
            
            if min_p_value < 0.05:
                causality.append({
                    "cause": cause,
                    "effect": effect,
                    "p_value": min_p_value,
                    "lag": np.argmin(
                        [test_result[i][1]["ssr_ftest"][0]
                        for i in range(max_lag)
                    )
                })
    
    return causality
```

### 2.4 Кластеризация и классификация

#### 2.4.1 Node Embedding

**Описание**: Векторное представление вершин для кластеризации

**Алгоритм**: Node2Vec или GraphSAGE
```python
from node2vec import Node2Vec

def create_node_embeddings(graph, dimensions=128):
    """Create node embeddings using Node2Vec"""
    
    # Initialize Node2Vec
    node2vec = Node2Vec(
        graph,
        dimensions=dimensions,
        walk_length=30,
        num_walks=200,
        p=1,
        q=1,
        workers=4
    )
    
    # Fit and transform
    model = node2vec.fit(window=10, min_count=1)
    embeddings = model.wv
    
    return embeddings

def cluster_nodes(embeddings, n_clusters=5):
    """Cluster nodes using embeddings"""
    from sklearn.cluster import KMeans
    
    # Prepare data
    X = np.array([embeddings[str(node)] for node in embeddings.index2word.keys()])
    
    # K-means clustering
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    labels = kmeans.fit_predict(X)
    
    return {
        node: labels[i]
        for i, node in enumerate(embeddings.index2word.keys())
    }
```

#### 2.4.2 Graph Clustering

**Описание**: Разделение графа на кластеры (сообщества)

**Алгоритмы**:

1. **Louvain**:
```python
import community as community_louvain

def louvain_clustering(graph):
    """Detect communities using Louvain algorithm"""
    partition = community_louvain.best_partition(graph)
    
    # Calculate modularity
    modularity = community_louvain.modularity(
        partition, graph
    )
    
    return {
        "communities": partition,
        "modularity": modularity,
        "num_communities": len(set(partition.values()))
    }
```

2. **Girvan-Newman**:
```python
def girvan_newman_clustering(graph, k_communities=None):
    """Detect communities using Girvan-Newman algorithm"""
    
    communities_generator = nx.community.girvan_newman(graph)
    
    # Get communities at desired level
    if k_communities is None:
        # Choose based on modularity
        best_communities = None
        best_modularity = -1
        
        for communities in communities_generator:
            partition = {}
            for i, community in enumerate(communities):
                for node in community:
                    partition[node] = i
            
            modularity = community_louvain.modularity(partition, graph)
            if modularity > best_modularity:
                best_modularity = modularity
                best_communities = communities
        
        communities = best_communities
    else:
        # Get k communities
        for i, communities in enumerate(communities_generator):
            if len(communities) >= k_communities:
                break
    
    return communities
```

3. **Label Propagation**:
```python
def label_propagation_clustering(graph):
    """Detect communities using label propagation"""
    
    communities = nx.community.label_propagation_communities(graph)
    
    # Convert to partition format
    partition = {}
    for i, community in enumerate(communities):
        for node in community:
            partition[node] = i
    
    modularity = community_louvain.modularity(partition, graph)
    
    return {
        "communities": partition,
        "modularity": modularity,
        "num_communities": len(communities)
    }
```

### 2.5 Статистическая значимость

#### 2.5.1 Null Model Testing

**Описание**: Проверка значимости наблюдаемых паттернов

**Null-модели**:

1. **Erdős-Rényi**:
```python
def erdos_renyi_graph(n, p):
    """Generate random graph with n nodes and edge probability p"""
    G = nx.Graph()
    G.add_nodes_from(range(n))
    
    for i in range(n):
        for j in range(i+1, n):
            if np.random.random() < p:
                G.add_edge(i, j)
    
    return G
```

2. **Configuration Model**:
```python
def configuration_model(graph):
    """Generate random graph preserving degree sequence"""
    degree_sequence = [d for n, d in graph.degree()]
    return nx.configuration_model(degree_sequence)
```

3. **Switching Model**:
```python
def switching_model(graph, num_switches=1000):
    """Generate random graph preserving degree distribution"""
    G = graph.copy()
    
    for _ in range(num_switches):
        # Select two random edges
        edges = list(G.edges())
        edge1, edge2 = random.sample(edges, 2)
        
        # Swap endpoints
        a, b = edge1
        c, d = edge2
        
        # Remove old edges
        G.remove_edge(a, b)
        G.remove_edge(c, d)
        
        # Add new edges
        if not G.has_edge(a, c) and a != c:
            G.add_edge(a, c)
        if not G.has_edge(b, d) and b != d:
            G.add_edge(b, d)
    
    return G
```

#### 2.5.2 Significance Testing

```python
from scipy import stats

def test_clustering_significance(graph, observed_clustering, num_permutations=1000):
    """
    Test if observed clustering is significant
    
    observed_clustering: clustering coefficient or modularity
    """
    # Generate null models
    null_values = []
    for _ in range(num_permutations):
        null_graph = switching_model(graph, num_switches=1000)
        null_clustering = nx.average_clustering(null_graph)
        null_values.append(null_clustering)
    
    # Calculate p-value
    p_value = (sum(null_values >= observed_clustering) + 1) / \
              (num_permutations + 1)
    
    # Calculate z-score
    null_mean = np.mean(null_values)
    null_std = np.std(null_values)
    z_score = (observed_clustering - null_mean) / null_std
    
    return {
        "observed": observed_clustering,
        "null_mean": null_mean,
        "null_std": null_std,
        "z_score": z_score,
        "p_value": p_value,
        "significant": p_value < 0.05
    }
```

### 2.6 Инструменты сравнительного анализа

#### 2.6.1 Graph Comparison

```python
def compare_graphs(graph1, graph2):
    """Compare two graphs"""
    
    # Jaccard similarity
    nodes1 = set(graph1.nodes())
    nodes2 = set(graph2.nodes())
    edges1 = set(graph1.edges())
    edges2 = set(graph2.edges())
    
    node_jaccard = len(nodes1 & nodes2) / len(nodes1 | nodes2)
    edge_jaccard = len(edges1 & edges2) / len(edges1 | edges2)
    
    # Graph Edit Distance
    ged = nx.graph_edit_distance(graph1, graph2)
    
    # Common subgraphs
    common = nx.compose(graph1, graph2)
    
    return {
        "node_jaccard": node_jaccard,
        "edge_jaccard": edge_jaccard,
        "graph_edit_distance": ged,
        "common_nodes": len(common.nodes()),
        "common_edges": len(common.edges()),
        "unique_to_g1": len(nodes1 - nodes2),
        "unique_to_g2": len(nodes2 - nodes1)
    }
```

#### 2.6.2 Temporal Comparison

```python
def compare_time_slices(slice1, slice2):
    """Compare two time slices"""
    
    # Added nodes
    added_nodes = set(slice2["nodes"]) - set(slice1["nodes"])
    
    # Removed nodes
    removed_nodes = set(slice1["nodes"]) - set(slice2["nodes"])
    
    # Added edges
    added_edges = set(slice2["edges"]) - set(slice1["edges"])
    
    # Removed edges
    removed_edges = set(slice1["edges"]) - set(slice2["edges"])
    
    # Changed centrality
    centrality_changes = calculate_centrality_changes(
        slice1, slice2
    )
    
    return {
        "added_nodes": len(added_nodes),
        "removed_nodes": len(removed_nodes),
        "added_edges": len(added_edges),
        "removed_edges": len(removed_edges),
        "centrality_changes": centrality_changes,
        "stability_score": calculate_stability(slice1, slice2)
    }
```

## 3. Сводка алгоритмов

| Алгоритм | Цель | Сложность | Применение |
|-----------|-------|------------|-------------|
| Force-Directed Layout | Визуализация | O(V²) | Интерактивная визуализация |
| Motif Detection | Паттерны | O(V³) | Выявление повторяющихся подграфов |
| Community Detection | Кластеризация | O(V log V) | Выявление функциональных модулей |
| Bridge Detection | Связи | O(VE) | Поиск критических связей |
| Causal Inference | Причинность | O(V²E) | Определение причинно-следственных связей |
| Node2Vec | Embeddings | O(V × W) | Векторное представление |
| Granger Causality | Временная причинность | O(T²) | Временной анализ |
| Null Model Testing | Значимость | O(P × N) | Статистическая валидация |

## 4. Интеграция с Frontend

### 4.1 API endpoints

```
POST /api/visualization/force-layout
POST /api/visualization/hierarchical-layout
POST /api/visualization/communities
POST /api/visualization/dynamic-graph
GET /api/visualization/metrics/:analysis_id
POST /api/patterns/detect-motifs
POST /api/patterns/indirect-connections
POST /api/patterns/causal-relationships
POST /api/comparison/compare-graphs
POST /api/comparison/compare-slices
```

### 4.2 Frontend компоненты

```typescript
// Graph Visualization Component
interface GraphVisualizationProps {
  graphData: GraphData;
  layoutType: LayoutType;
  interactive: boolean;
  onNodeClick: (node: Node) => void;
  onEdgeClick: (edge: Edge) => void;
}

export function GraphVisualization({
  graphData,
  layoutType,
  interactive,
  onNodeClick,
  onEdgeClick
}: GraphVisualizationProps) {
  const [controls, setControls] = useState<GraphControls>();
  
  return (
    <div className="graph-container">
      <GraphControls
        controls={controls}
        onChange={setControls}
      />
      <ReactFlow
        nodes={transformNodes(graphData.nodes, controls)}
        edges={transformEdges(graphData.edges, controls)}
        layout={getLayoutFunction(layoutType)}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        interactive={interactive}
      />
      <GraphStats stats={calculateStats(graphData)} />
    </div>
  );
}
```
