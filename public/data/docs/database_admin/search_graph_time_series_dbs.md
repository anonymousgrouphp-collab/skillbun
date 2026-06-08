# Search, Graph & Time-Series Databases: Study Guide

Specialized data stores handle niche access patterns like inverted indexes, network relationships, and sequential timestamp data.

## 1. Key Concepts

### Concept 1: Search Engines (Elasticsearch)
Utilizing inverted indexes for rapid full-text search, tokenization, stemming, and fuzzy string matching.

### Concept 2: Graph Databases (Neo4j)
Treating nodes and relationships as first-class citizens, enabling instant traversal of complex networks without deep joins.

### Concept 3: Time-Series Databases (InfluxDB)
Optimized for high-velocity write loops of timestamped metrics, supporting data retention policies and downsampling.

## 2. Practical Example

### Search, Graph & Time-Series Databases Example Setup
```javascript
Elasticsearch inverted index structure mapping tokens to document IDs for high-speed text searches.
```

## 3. Quick Check-Up

1. How does an inverted index speed up full-text search queries?
2. Why are relational databases slow at querying deep parent-child-friend relationship graphs?
3. Explain the purpose of data downsampling in time-series database management.
