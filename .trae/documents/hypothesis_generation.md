# Механизмы автоматического обобщения и генерации гипотез

## 1. Автоматическое обобщение информации

### 1.1 Многоуровневое суммирование

#### 1.1.1 Иерархия обобщений

**Уровни абстракции**:
```
Level 0 (Raw): Оригинальный текст статей
Level 1 (Extracted): Извлеченные факты и сущности
Level 2 (Clustered): Группировка по темам/путям
Level 3 (Synthesized): Объединение перекрывающихся концепций
Level 4 (Abstracted): Высокоуровневые выводы и модели
```

#### 1.1.2 Алгоритм многоуровневого обобщения

```python
from typing import List, Dict
from collections import defaultdict

class MultiLevelSummarizer:
    def __init__(self, mimo_client):
        self.mimo = mimo_client
        self.levels = {}
    
    async def summarize_all_levels(self, articles: List[Article]):
        """Generate summaries at all abstraction levels"""
        
        # Level 1: Extract entities and facts
        level1 = await self.extract_facts(articles)
        self.levels[1] = level1
        
        # Level 2: Cluster by topics
        level2 = await self.cluster_topics(level1)
        self.levels[2] = level2
        
        # Level 3: Synthesize overlapping concepts
        level3 = await self.synthesize_concepts(level2)
        self.levels[3] = level3
        
        # Level 4: Abstract high-level insights
        level4 = await self.abstract_insights(level3)
        self.levels[4] = level4
        
        return {
            "level1": level1,
            "level2": level2,
            "level3": level3,
            "level4": level4
        }
    
    async def extract_facts(self, articles):
        """Extract entities and facts from articles"""
        prompt = """
        Extract biochemical facts from articles. For each fact:
        1. Identify the main entities (proteins, genes, metabolites)
        2. Extract the relationship between entities
        3. Note the context and conditions
        4. Record the evidence level (experimental, computational, hypothetical)
        Return as structured JSON.
        """
        
        facts = []
        for article in articles:
            result = await self.mimo.analyze(article.content, prompt)
            facts.extend(result["facts"])
        
        return {"facts": facts}
    
    async def cluster_topics(self, level1_data):
        """Cluster facts by biological topics/pathways"""
        prompt = """
        Group the extracted facts into coherent topics:
        1. Identify common biological processes (e.g., glycolysis, apoptosis)
        2. Group related interactions together
        3. Note the hierarchical relationships between topics
        4. For each topic, list key entities and findings
        Return as structured JSON with topic hierarchy.
        """
        
        result = await self.mimo.analyze(
            json.dumps(level1_data["facts"][:100]),
            prompt
        )
        return {"topics": result["topics"]}
    
    async def synthesize_concepts(self, level2_data):
        """Synthesize overlapping concepts across topics"""
        prompt = """
        Synthesize information across topics:
        1. Identify overlapping entities between topics
        2. Find complementary findings
        3. Resolve contradictions (if possible)
        4. Integrate into coherent understanding
        5. Highlight areas of uncertainty
        Return as synthesized knowledge with confidence levels.
        """
        
        result = await self.mimo.analyze(
            json.dumps(level2_data["topics"]),
            prompt
        )
        return {"synthesis": result["synthesis"]}
    
    async def abstract_insights(self, level3_data):
        """Generate high-level abstract insights"""
        prompt = """
        Generate high-level insights from synthesized knowledge:
        1. Identify fundamental principles
        2. Propose unifying models or mechanisms
        3. Highlight paradigm shifts or novel perspectives
        4. Suggest implications for the field
        5. Identify major research gaps
        Return as executive summary with bullet points.
        """
        
        result = await self.mimo.analyze(
            json.dumps(level3_data["synthesis"]),
            prompt
        )
        return {"insights": result["insights"]}
```

### 1.2 Кросс-статейное обобщение

#### 1.2.1 Сравнительный анализ

```python
class CrossArticleSummarizer:
    def __init__(self, mimo_client):
        self.mimo = mimo_client
    
    async def compare_articles(self, articles: List[Article]):
        """Compare and synthesize information across articles"""
        
        # Extract key claims from each article
        claims = await self.extract_claims(articles)
        
        # Group claims by topic
        grouped_claims = self.group_by_topic(claims)
        
        # Compare claims within each topic
        comparisons = []
        for topic, topic_claims in grouped_claims.items():
            comparison = await self.compare_topic_claims(
                topic, topic_claims
            )
            comparisons.append(comparison)
        
        # Synthesize into consensus
        consensus = await self.build_consensus(comparisons)
        
        return {
            "comparisons": comparisons,
            "consensus": consensus
        }
    
    async def extract_claims(self, articles):
        """Extract key claims from articles"""
        prompt = """
        Extract key claims from the article. For each claim:
        1. State the claim clearly
        2. Identify supporting evidence
        3. Note the confidence level
        4. Record methodology (experimental, review, computational)
        Return as structured JSON.
        """
        
        claims = []
        for article in articles:
            result = await self.mimo.analyze(article.content, prompt)
            claims.append({
                "article_id": article.id,
                "title": article.title,
                "claims": result["claims"]
            })
        
        return claims
    
    async def compare_topic_claims(self, topic, claims):
        """Compare claims within a topic"""
        prompt = f"""
        Compare the following claims about {topic}:
        {json.dumps(claims)}
        
        For the comparison:
        1. Identify areas of agreement
        2. Identify contradictions or conflicts
        3. Note the quality of evidence
        4. Identify gaps in the claims
        5. Suggest resolution strategies for conflicts
        Return as structured comparison.
        """
        
        result = await self.mimo.analyze(json.dumps(claims), prompt)
        return result
    
    async def build_consensus(self, comparisons):
        """Build consensus from comparisons"""
        prompt = """
        Build a scientific consensus from the comparisons:
        1. Identify well-supported agreements
        2. Note areas of controversy or uncertainty
        3. Weigh evidence by quality and quantity
        4. Synthesize into coherent statements
        5. Identify which claims need further investigation
        Return as consensus with confidence levels.
        """
        
        result = await self.mimo.analyze(
            json.dumps(comparisons),
            prompt
        )
        return result
```

### 1.3 Временное обобщение

```python
class TemporalSummarizer:
    async def summarize_temporal_evolution(self, time_slices):
        """Summarize how understanding evolved over time"""
        
        prompt = """
        Analyze the temporal evolution of research:
        1. Identify key findings in each time period
        2. Note changes in understanding or paradigms
        3. Identify breakthrough discoveries
        4. Note contradictory findings over time
        5. Synthesize the trajectory of knowledge
        Return as chronological narrative with key milestones.
        """
        
        # Prepare temporal data
        temporal_data = []
        for slice_data in time_slices:
            temporal_data.append({
                "period": slice_data["period"],
                "key_findings": slice_data["findings"],
                "new_concepts": slice_data["new_entities"]
            })
        
        result = await self.mimo.analyze(
            json.dumps(temporal_data),
            prompt
        )
        
        return {
            "timeline": result["timeline"],
            "milestones": result["milestones"],
            "paradigm_shifts": result["paradigm_shifts"]
        }
```

## 2. Поиск скрытых зависимостей

### 2.1 Выявление косвенных связей

#### 2.1.1 Multi-hop Path Analysis

```python
class IndirectConnectionFinder:
    def __init__(self, graph):
        self.graph = graph
    
    def find_indirect_connections(self, source, target, max_hops=5):
        """Find all indirect paths between two entities"""
        
        # Find all paths up to max_hops
        all_paths = []
        for path in nx.all_simple_paths(
            self.graph, source, target, cutoff=max_hops
        ):
            if len(path) > 2:  # Exclude direct connections
                all_paths.append({
                    "path": path,
                    "length": len(path) - 1,
                    "confidence": self.calculate_path_confidence(path),
                    "intermediate_entities": path[1:-1]
                })
        
        # Rank by confidence and biological plausibility
        ranked_paths = self.rank_paths(all_paths)
        
        return ranked_paths[:TOP_K_PATHS]
    
    def calculate_path_confidence(self, path):
        """Calculate confidence based on edge weights"""
        if len(path) < 2:
            return 0
        
        product = 1.0
        for i in range(len(path) - 1):
            edge = (path[i], path[i+1])
            if edge in self.graph.edges():
                weight = self.graph.edges[edge].get("confidence", 0.5)
                product *= weight
        
        # Apply length penalty
        length_penalty = 0.9 ** (len(path) - 2)
        
        return product * length_penalty
    
    def rank_paths(self, paths):
        """Rank paths by multiple criteria"""
        for path in paths:
            # Calculate composite score
            path["composite_score"] = (
                path["confidence"] * 0.5 +
                (1.0 / path["length"]) * 0.3 +
                self.calculate_biological_plausibility(path["path"]) * 0.2
            )
        
        return sorted(paths, key=lambda x: x["composite_score"], reverse=True)
    
    def calculate_biological_plausibility(self, path):
        """Check if path is biologically plausible"""
        score = 1.0
        
        # Check for known pathway patterns
        path_sequence = [
            self.graph.nodes[n]["type"]
            for n in path
        ]
        
        # Penalize unlikely sequences
        if "metabolite" in path_sequence and "dna" in path_sequence:
            score *= 0.3  # Unlikely direct interaction
        
        # Reward known patterns
        if self.is_known_pattern(path_sequence):
            score *= 1.5
        
        return min(score, 1.0)
```

#### 2.1.2 Cross-domain Connections

```python
class CrossDomainConnector:
    def __init__(self, graph):
        self.graph = graph
    
    def find_cross_domain_connections(self):
        """Find connections between different biological domains"""
        
        # Identify domains
        domains = self.identify_domains()
        
        # Find bridges between domains
        bridges = []
        for domain_a, domain_b in combinations(domains, 2):
            connections = self.find_domain_connections(
                domain_a, domain_b
            )
            
            if connections:
                bridges.append({
                    "domain_a": domain_a,
                    "domain_b": domain_b,
                    "connections": connections,
                    "significance": self.calculate_cross_domain_significance(
                        domain_a, domain_b, connections
                    )
                })
        
        return sorted(bridges, key=lambda x: x["significance"], reverse=True)
    
    def identify_domains(self):
        """Identify biological domains in the graph"""
        domains = defaultdict(set)
        
        for node in self.graph.nodes():
            node_type = self.graph.nodes[node].get("domain", "unknown")
            domains[node_type].add(node)
        
        return dict(domains)
    
    def find_domain_connections(self, domain_a, domain_b):
        """Find connections between two domains"""
        connections = []
        
        nodes_a = self.identify_nodes_by_domain(domain_a)
        nodes_b = self.identify_nodes_by_domain(domain_b)
        
        # Find shortest paths between domains
        for node_a in nodes_a:
            for node_b in nodes_b:
                try:
                    path = nx.shortest_path(
                        self.graph, node_a, node_b
                    )
                    
                    # Check if path is direct
                    if len(path) == 2:
                        connections.append({
                            "source": node_a,
                            "target": node_b,
                            "path": path,
                            "type": "direct_cross_domain"
                        })
                    elif len(path) <= 4:
                        connections.append({
                            "source": node_a,
                            "target": node_b,
                            "path": path,
                            "type": "indirect_cross_domain",
                            "intermediates": path[1:-1]
                        })
                except nx.NetworkXNoPath:
                    continue
        
        return connections
```

### 2.2 Выявление скрытых паттернов

#### 2.2.1 Recurrent Motif Discovery

```python
class RecurrentMotifFinder:
    def __init__(self, graphs: List[nx.Graph]):
        self.graphs = graphs
    
    def find_recurrent_motifs(self, min_support=3, motif_size=3):
        """Find motifs that appear across multiple graphs"""
        
        # Extract all subgraphs of given size
        all_motifs = defaultdict(int)
        
        for graph in self.graphs:
            motifs = self.extract_motifs(graph, motif_size)
            
            for motif in motifs:
                # Canonical representation
                canonical = self.canonicalize(motif)
                all_motifs[canonical] += 1
        
        # Filter by support
        frequent_motifs = {
            motif: count
            for motif, count in all_motifs.items()
            if count >= min_support
        }
        
        return frequent_motifs
    
    def extract_motifs(self, graph, size):
        """Extract all connected subgraphs of given size"""
        from itertools import combinations
        
        motifs = []
        for node_comb in combinations(graph.nodes(), size):
            subgraph = graph.subgraph(node_comb)
            
            if nx.is_connected(subgraph):
                motifs.append(subgraph)
        
        return motifs
    
    def canonicalize(self, graph):
        """Generate canonical representation of graph"""
        # Use graph6 string for canonical representation
        import graph6
        return graph6.from_networkx(graph).canon6()
```

#### 2.2.2 Temporal Pattern Mining

```python
class TemporalPatternMiner:
    def __init__(self, time_slices):
        self.slices = time_slices
    
    def find_temporal_patterns(self):
        """Find patterns that evolve over time"""
        
        # Track entity activity over time
        entity_activity = self.track_entity_activity()
        
        # Find emerging entities
        emerging = self.find_emerging_entities(entity_activity)
        
        # Find declining entities
        declining = self.find_declining_entities(entity_activity)
        
        # Find stable relationships
        stable = self.find_stable_relationships()
        
        # Find evolving relationships
        evolving = self.find_evolving_relationships()
        
        return {
            "emerging_entities": emerging,
            "declining_entities": declining,
            "stable_relationships": stable,
            "evolving_relationships": evolving
        }
    
    def track_entity_activity(self):
        """Track how often each entity appears"""
        activity = defaultdict(lambda: defaultdict(int))
        
        for i, slice_data in enumerate(self.slices):
            period = slice_data["period"]
            
            for node in slice_data["nodes"]:
                activity[node][period] += 1
        
        return activity
    
    def find_emerging_entities(self, activity):
        """Find entities that increase in activity over time"""
        emerging = []
        
        for entity, periods in activity.items():
            # Calculate trend
            values = [periods.get(p, 0) for p in sorted(periods.keys())]
            
            if len(values) >= 3:
                # Check for increasing trend
                trend = self.calculate_trend(values)
                
                if trend > 0.5:  # Significant increase
                    emerging.append({
                        "entity": entity,
                        "trend": trend,
                        "activity": dict(periods)
                    })
        
        return sorted(emerging, key=lambda x: x["trend"], reverse=True)
```

### 2.3 Кластеризация для выявления зависимостей

```python
from sklearn.cluster import DBSCAN
from sklearn.decomposition import PCA
import numpy as np

class DependencyClusterer:
    def __init__(self, graph):
        self.graph = graph
    
    def find_dependency_clusters(self):
        """Find clusters of co-occurring entities"""
        
        # Create co-occurrence matrix
        cooccur_matrix = self.create_cooccurrence_matrix()
        
        # Cluster using DBSCAN
        clustering = DBSCAN(
            eps=0.5,
            min_samples=5,
            metric="precomputed"
        )
        
        # Use co-occurrence as distance metric
        distance_matrix = 1 - cooccur_matrix
        labels = clustering.fit_predict(distance_matrix)
        
        # Analyze clusters
        clusters = self.analyze_clusters(labels)
        
        return clusters
    
    def create_cooccurrence_matrix(self):
        """Create co-occurrence matrix from graph"""
        import pandas as pd
        
        nodes = list(self.graph.nodes())
        n = len(nodes)
        
        # Initialize matrix
        matrix = np.zeros((n, n))
        
        # Fill matrix with co-occurrence
        for edge in self.graph.edges():
            i = nodes.index(edge[0])
            j = nodes.index(edge[1])
            matrix[i][j] = 1
            matrix[j][i] = 1
        
        return matrix
    
    def analyze_clusters(self, labels):
        """Analyze clusters and identify dependencies"""
        clusters = defaultdict(list)
        
        for node_id, label in enumerate(labels):
            if label != -1:  # Ignore noise
                clusters[label].append(node_id)
        
        # Analyze each cluster
        cluster_analysis = []
        for cluster_id, members in clusters.items():
            subgraph = self.graph.subgraph(members)
            
            cluster_analysis.append({
                "cluster_id": cluster_id,
                "size": len(members),
                "density": nx.density(subgraph),
                "dominant_types": self.get_dominant_types(subgraph),
                "key_entities": self.find_key_entities(subgraph),
                "internal_connections": subgraph.number_of_edges(),
                "external_connections": self.count_external_edges(subgraph)
            })
        
        return cluster_analysis
```

## 3. Генерация гипотез

### 3.1 Фреймворк генерации гипотез

#### 3.1.1 Типы гипотез

```python
from enum import Enum
from typing import Dict, List

class HypothesisType(Enum):
    """Types of hypotheses"""
    CAUSAL = "causal"  # X causes Y
    CORRELATION = "correlation"  # X and Y are correlated
    MECHANISM = "mechanism"  # X acts through mechanism M
    THERAPEUTIC = "therapeutic"  # Targeting X treats Y
    EVOLUTIONARY = "evolutionary"  # X evolved from Y
    NETWORK = "network"  # X connects network modules A and B
    REGULATORY = "regulatory"  # X regulates Y

class HypothesisGenerator:
    def __init__(self, graph, mimo_client):
        self.graph = graph
        self.mimo = mimo_client
```

#### 3.1.2 Генерация на основе графовой структуры

```python
    def generate_hypotheses_from_graph(self):
        """Generate hypotheses based on graph structure"""
        
        hypotheses = []
        
        # 1. Bridge hypotheses
        bridges = self.find_bridges()
        for bridge in bridges:
            hypotheses.append(self.generate_bridge_hypothesis(bridge))
        
        # 2. Indirect connection hypotheses
        indirect = self.find_indirect_connections()
        for conn in indirect:
            hypotheses.append(self.generate_connection_hypothesis(conn))
        
        # 3. Community gap hypotheses
        gaps = self.find_community_gaps()
        for gap in gaps:
            hypotheses.append(self.generate_gap_hypothesis(gap))
        
        # 4. Hub disruption hypotheses
        hubs = self.find_critical_hubs()
        for hub in hubs:
            hypotheses.append(self.generate_hub_hypothesis(hub))
        
        return hypotheses
    
    def generate_bridge_hypothesis(self, bridge):
        """Generate hypothesis about a bridge connection"""
        source = bridge["edge"][0]
        target = bridge["edge"][1]
        
        prompt = f"""
        Analyze the potential biological significance of the connection between {source} and {target}:
        
        Context:
        - Source type: {self.graph.nodes[source]['type']}
        - Target type: {self.graph.nodes[target]['type']}
        - Bridge significance: {bridge['significance']:.2f}
        - Communities connected: {bridge['communities']}
        
        Generate a hypothesis that:
        1. Proposes a biological mechanism for this connection
        2. Explains why this connection might be important
        3. Suggests potential functional implications
        4. Identifies potential experiments to validate the hypothesis
        
        Return as structured hypothesis with confidence and impact scores.
        """
        
        result = await self.mimo.analyze(prompt)
        
        return {
            "type": HypothesisType.NETWORK,
            "text": result["hypothesis"],
            "entities": [source, target],
            "confidence": result["confidence"],
            "impact_score": result["impact"],
            "test_method": result["test_method"],
            "supporting_evidence": result.get("evidence", [])
        }
```

### 3.2 Гипотезы на основе паттернов

```python
    def generate_pattern_based_hypotheses(self, motifs, patterns):
        """Generate hypotheses based on discovered patterns"""
        
        hypotheses = []
        
        # 1. Motif-based hypotheses
        for motif, frequency in motifs.items():
            if frequency >= MIN_MOTIF_FREQUENCY:
                hypothesis = await self.generate_motif_hypothesis(
                    motif, frequency
                )
                hypotheses.append(hypothesis)
        
        # 2. Pattern-based hypotheses
        for pattern in patterns:
            hypothesis = await self.generate_pattern_hypothesis(pattern)
            hypotheses.append(hypothesis)
        
        return hypotheses
    
    async def generate_motif_hypothesis(self, motif, frequency):
        """Generate hypothesis based on a recurring motif"""
        prompt = f"""
        Analyze the biological significance of this recurring motif:
        
        Motif structure: {motif}
        Frequency: {frequency} occurrences
        
        Generate a hypothesis that:
        1. Explains the functional role of this motif
        2. Proposes why this motif might be conserved
        3. Suggests potential biological functions
        4. Identifies if disrupting this motif could have effects
        5. Proposes experimental validation strategies
        
        Consider:
        - What biological processes might this motif be involved in?
        - Could this motif represent a fundamental regulatory mechanism?
        - What would happen if this motif were disrupted?
        
        Return as structured hypothesis.
        """
        
        result = await self.mimo.analyze(prompt)
        
        return {
            "type": HypothesisType.MECHANISM,
            "text": result["hypothesis"],
            "motif": motif,
            "frequency": frequency,
            "confidence": result["confidence"],
            "impact_score": result["impact"],
            "test_method": result["test_method"]
        }
```

### 3.3 Гипотезы на основе пробелов в знаниях

```python
    def generate_knowledge_gap_hypotheses(self, research_gaps):
        """Generate hypotheses to address research gaps"""
        
        hypotheses = []
        
        for gap in research_gaps:
            hypothesis = await self.generate_gap_filling_hypothesis(gap)
            hypotheses.append(hypothesis)
        
        return hypotheses
    
    async def generate_gap_filling_hypothesis(self, gap):
        """Generate hypothesis to address a research gap"""
        prompt = f"""
        Propose hypotheses to address this research gap:
        
        Research Gap: {gap['area']}
        Priority: {gap['priority']}
        Current Evidence: {gap['supporting_evidence']} studies
        Existing Recommendation: {gap['recommendation']}
        
        Generate multiple hypotheses that:
        1. Directly address the identified gap
        2. Are based on solid biochemical principles
        3. Propose testable predictions
        4. Consider alternative explanations
        5. Estimate feasibility and potential impact
        
        For each hypothesis, provide:
        - Clear statement
        - Proposed mechanism
        - Testable predictions
        - Required experiments
        - Expected outcomes
        - Potential implications if validated
        - Confidence and impact scores
        
        Return as structured list of hypotheses.
        """
        
        result = await self.mimo.analyze(prompt)
        
        return [
            {
                "type": HypothesisType.CAUSAL,
                "text": h["statement"],
                "gap_id": gap["id"],
                "mechanism": h.get("mechanism"),
                "predictions": h.get("predictions", []),
                "experiments": h.get("experiments", []),
                "confidence": h["confidence"],
                "impact_score": h["impact"],
                "feasibility": h.get("feasibility")
            }
            for h in result["hypotheses"]
        ]
```

### 3.4 Мета-анализ гипотез

```python
class HypothesisMetaAnalyzer:
    def __init__(self, graph, knowledge_base):
        self.graph = graph
        self.kb = knowledge_base
    
    def analyze_hypothesis_quality(self, hypotheses):
        """Analyze quality and prioritize hypotheses"""
        
        analyzed = []
        for hypothesis in hypotheses:
            # Check against known literature
            novelty = self.check_novelty(hypothesis)
            
            # Check biological plausibility
            plausibility = self.check_plausibility(hypothesis)
            
            # Check testability
            testability = self.check_testability(hypothesis)
            
            # Check potential impact
            impact = self.estimate_impact(hypothesis)
            
            # Calculate composite score
            composite = (
                novelty * 0.3 +
                plausibility * 0.3 +
                testability * 0.2 +
                impact * 0.2
            )
            
            analyzed.append({
                **hypothesis,
                "novelty": novelty,
                "plausibility": plausibility,
                "testability": testability,
                "impact": impact,
                "composite_score": composite
            })
        
        # Rank by composite score
        return sorted(analyzed, key=lambda x: x["composite_score"], reverse=True)
    
    def check_novelty(self, hypothesis):
        """Check if hypothesis is novel"""
        # Search knowledge base for similar hypotheses
        similar = self.kb.search_similar(hypothesis["text"])
        
        if similar:
            # Calculate novelty based on similarity
            max_similarity = max(similar, key=lambda x: x["similarity"])
            novelty = 1.0 - max_similarity["similarity"]
        else:
            novelty = 1.0
        
        return novelty
    
    def check_plausibility(self, hypothesis):
        """Check biological plausibility"""
        score = 1.0
        
        # Check if entities exist in knowledge base
        entities = hypothesis["entities"]
        for entity in entities:
            if not self.kb.entity_exists(entity):
                score *= 0.5  # Penalize unknown entities
        
        # Check if mechanism is known
        if "mechanism" in hypothesis:
            mechanism = hypothesis["mechanism"]
            if self.kb.mechanism_exists(mechanism):
                score *= 1.2  # Reward known mechanisms
            else:
                score *= 0.8  # Penalize unknown mechanisms
        
        return min(score, 1.0)
    
    def check_testability(self, hypothesis):
        """Check if hypothesis is testable"""
        score = 0.0
        
        # Check for testable predictions
        if "predictions" in hypothesis:
            score += 0.4
        
        # Check for proposed experiments
        if "experiments" in hypothesis:
            score += 0.3
        
        # Check if entities are accessible
        entities = hypothesis["entities"]
        if all(self.kb.is_accessible(entity) for entity in entities):
            score += 0.3
        
        return min(score, 1.0)
    
    def estimate_impact(self, hypothesis):
        """Estimate potential impact if validated"""
        impact = 0.0
        
        # Consider confidence of hypothesis
        impact += hypothesis.get("confidence", 0.5) * 0.3
        
        # Consider entities involved
        entities = hypothesis["entities"]
        entity_importance = sum(
            self.graph.degree(entity) for entity in entities
        )
        normalized_importance = entity_importance / max(entity_importance, 1)
        impact += normalized_importance * 0.4
        
        # Consider novelty
        if "novelty" in hypothesis:
            impact += hypothesis["novelty"] * 0.3
        
        return min(impact, 1.0)
```

### 3.5 Итеративная генерация гипотез

```python
class IterativeHypothesisGenerator:
    def __init__(self, generator, analyzer):
        self.generator = generator
        self.analyzer = analyzer
    
    async def iterative_generation(self, num_iterations=3):
        """Iteratively generate and refine hypotheses"""
        
        all_hypotheses = []
        current_context = {"iteration": 0}
        
        for i in range(num_iterations):
            print(f"Iteration {i+1}/{num_iterations}")
            
            # Generate hypotheses with current context
            hypotheses = await self.generator.generate_hypotheses(
                current_context
            )
            
            # Analyze and prioritize
            analyzed = self.analyzer.analyze_quality(hypotheses)
            
            # Select top hypotheses
            top_hypotheses = analyzed[:TOP_K]
            
            # Update context with top hypotheses
            current_context = {
                "iteration": i + 1,
                "previous_hypotheses": top_hypotheses,
                "refinement_suggestions": self.generate_refinement_suggestions(
                    top_hypotheses
                )
            }
            
            all_hypotheses.extend(top_hypotheses)
        
        # Final synthesis
        final_synthesis = await self.synthesize_final_hypotheses(
            all_hypotheses
        )
        
        return final_synthesis
    
    def generate_refinement_suggestions(self, hypotheses):
        """Generate suggestions for refining hypotheses"""
        prompt = f"""
        Analyze these hypotheses and suggest refinements:
        {json.dumps(hypotheses[:10])}
        
        For each hypothesis, suggest:
        1. How to make it more testable
        2. What additional evidence would strengthen it
        3. Alternative formulations
        4. Potential confounding factors
        5. Complementary hypotheses to consider
        
        Return as structured refinement suggestions.
        """
        
        result = await self.mimo.analyze(prompt)
        return result["suggestions"]
```

## 4. Интеграция с базой данных

### 4.1 Сохранение гипотез

```python
async def save_hypotheses(analysis_id, hypotheses):
    """Save generated hypotheses to database"""
    
    saved_hypotheses = []
    for hypothesis in hypotheses:
        # Prepare database record
        record = {
            "analysis_id": analysis_id,
            "hypothesis_text": hypothesis["text"],
            "hypothesis_type": hypothesis["type"].value,
            "confidence": hypothesis["confidence"],
            "supporting_evidence": hypothesis.get("supporting_evidence", []),
            "contradictory_evidence": hypothesis.get("contradictory_evidence", []),
            "test_method": hypothesis.get("test_method"),
            "feasibility": hypothesis.get("feasibility"),
            "impact_score": hypothesis.get("impact_score"),
            "novelty_score": hypothesis.get("novelty"),
            "research_priority": calculate_priority(hypothesis),
            "status": "proposed",
            "generated_by": "mimo-v2-flash",
            "generated_at": datetime.utcnow()
        }
        
        # Save to database
        saved = await db.insert("hypotheses", record)
        saved_hypotheses.append(saved)
    
    return saved_hypotheses

def calculate_priority(hypothesis):
    """Calculate research priority based on multiple factors"""
    
    # Weight factors
    weights = {
        "impact": 0.35,
        "feasibility": 0.25,
        "novelty": 0.20,
        "confidence": 0.20
    }
    
    # Calculate weighted score
    score = (
        hypothesis.get("impact_score", 0.5) * weights["impact"] +
        hypothesis.get("feasibility", 0.5) * weights["feasibility"] +
        hypothesis.get("novelty", 0.5) * weights["novelty"] +
        hypothesis.get("confidence", 0.5) * weights["confidence"]
    )
    
    # Convert to priority level
    if score >= 0.8:
        return "critical"
    elif score >= 0.6:
        return "high"
    elif score >= 0.4:
        return "medium"
    else:
        return "low"
```

### 4.2 API endpoints

```python
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/hypotheses", tags=["hypotheses"])

@router.post("/generate")
async def generate_hypotheses(
    analysis_id: str,
    num_hypotheses: int = 10,
    types: List[str] = None
):
    """Generate hypotheses for an analysis"""
    
    # Load analysis data
    analysis = await db.get("analyses", analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Load graph data
    graph_data = await db.get("graph_data", analysis["graph_data_id"])
    graph = build_graph(graph_data)
    
    # Generate hypotheses
    generator = HypothesisGenerator(graph, mimo_client)
    
    if types:
        # Filter by requested types
        type_map = {
            "causal": HypothesisType.CAUSAL,
            "mechanism": HypothesisType.MECHANISM,
            # ... etc
        }
        generator.set_types([type_map[t] for t in types])
    
    hypotheses = await generator.generate_hypotheses(num_hypotheses)
    
    # Analyze and prioritize
    analyzer = HypothesisMetaAnalyzer(graph, knowledge_base)
    analyzed = analyzer.analyze_quality(hypotheses)
    
    # Save to database
    saved = await save_hypotheses(analysis_id, analyzed)
    
    return {
        "hypotheses": saved,
        "total_generated": len(hypotheses),
        "high_priority": len([h for h in saved if h["research_priority"] == "high" or h["research_priority"] == "critical"])
    }

@router.get("/{hypothesis_id}")
async def get_hypothesis(hypothesis_id: str):
    """Get details of a specific hypothesis"""
    
    hypothesis = await db.get("hypotheses", hypothesis_id)
    if not hypothesis:
        raise HTTPException(status_code=404, detail="Hypothesis not found")
    
    # Get related data
    supporting_articles = await get_supporting_articles(hypothesis)
    related_hypotheses = await get_related_hypotheses(hypothesis)
    
    return {
        **hypothesis,
        "supporting_articles": supporting_articles,
        "related_hypotheses": related_hypotheses
    }

@router.post("/{hypothesis_id}/validate")
async def validate_hypothesis(hypothesis_id: str, validation_result: dict):
    """Update validation status of a hypothesis"""
    
    update = {
        "status": validation_result["status"],  # "testing", "validated", "rejected"
        "validation_notes": validation_result.get("notes"),
        "validation_date": datetime.utcnow()
    }
    
    updated = await db.update("hypotheses", hypothesis_id, update)
    
    return updated

@router.post("/{hypothesis_id}/feedback")
async def submit_feedback(hypothesis_id: str, feedback: dict):
    """Submit user feedback on hypothesis"""
    
    record = {
        "hypothesis_id": hypothesis_id,
        "feedback_type": feedback["type"],  # "useful", "incorrect", "needs_refinement"
        "feedback_text": feedback.get("text"),
        "user_id": feedback.get("user_id"),
        "created_at": datetime.utcnow()
    }
    
    await db.insert("hypothesis_feedback", record)
    
    return {"status": "success"}
```

## 5. Сводка всех механизмов

| Механизм | Описание | Алгоритмы | Применение |
|-----------|-----------|-----------|-------------|
| Многоуровневое обобщение | Иерархическое суммирование информации | LLM-based summarization, Topic clustering | Executive summaries, Literature reviews |
| Кросс-статейное обобщение | Сравнение и синтез из множества источников | Claim extraction, Consensus building | Systematic reviews, Meta-analyses |
| Временное обобщение | Анализ эволюции знаний | Trend analysis, Milestone detection | Historical perspectives, Future directions |
| Косвенные связи | Поиск путей между сущностями | K-shortest paths, Cross-domain analysis | Hidden pathways, Novel interactions |
| Скрытые паттерны | Выявление повторяющихся структур | Motif detection, Temporal pattern mining | Conserved mechanisms, Regulatory patterns |
| Генерация гипотез | Создание тестируемых утверждений | Graph-based, Pattern-based, Gap-based | Novel research directions |
| Мета-анализ | Оценка качества гипотез | Novelty check, Plausibility check, Impact estimation | Prioritization, Quality control |

## 6. Пример использования

```python
# Complete workflow
async def complete_analysis_workflow(articles):
    # 1. Extract and structure data
    extractor = EntityExtractor()
    entities = await extractor.extract_entities(articles)
    graph = build_graph(entities)
    
    # 2. Generate multi-level summaries
    summarizer = MultiLevelSummarizer(mimo_client)
    summaries = await summarizer.summarize_all_levels(articles)
    
    # 3. Find hidden dependencies
    dependency_finder = DependencyClusterer(graph)
    clusters = dependency_finder.find_dependency_clusters()
    
    # 4. Generate hypotheses
    generator = HypothesisGenerator(graph, mimo_client)
    hypotheses = await generator.generate_hypotheses_from_graph()
    
    # 5. Analyze and prioritize
    analyzer = HypothesisMetaAnalyzer(graph, knowledge_base)
    prioritized = analyzer.analyze_quality(hypotheses)
    
    # 6. Save results
    analysis_id = await save_analysis(graph, summaries, clusters, prioritized)
    
    return {
        "analysis_id": analysis_id,
        "summaries": summaries,
        "clusters": clusters,
        "hypotheses": prioritized
    }
```
