# PostGIS: Spatial SQL Queries

PostGIS extends PostgreSQL with powerful spatial capabilities, allowing you to store, query, and manipulate geographic objects directly within your database. Spatial SQL queries are the foundation of geospatial analysis, enabling sophisticated operations on spatial data using standard SQL syntax enhanced with spatial functions. This guide focuses on writing advanced SQL queries utilizing key spatial functions like `ST_Contains`, `ST_Intersects`, and `ST_Buffer` to analyze and manipulate geometries.

## Core Concepts

### 1. Spatial Data Types
PostGIS introduces specialized geometric data types:
*   **`GEOMETRY`**: Represents features on a 2D Cartesian plane (e.g., points, lines, polygons). Calculations are typically planar and suitable for smaller areas or when precise geodesic calculations aren't critical.
*   **`GEOGRAPHY`**: Represents features on a spherical Earth (latitude/longitude). Calculations inherently account for the Earth's curvature, providing more accurate results for large-scale geographic data (e.g., distances between cities across continents).

### 2. Spatial Reference Systems (SRS) and SRID
A Spatial Reference System (SRS) defines how coordinates relate to real-world locations. Each SRS is identified by a unique Spatial Reference ID (SRID).
*   **WGS 84 (SRID 4326)**: The most widely used geographic coordinate system, employing latitude and longitude coordinates.
*   **Projected CRSs (e.g., UTM, State Plane)**: Often used for localized areas, these systems project the Earth's surface onto a 2D plane, providing accurate distance and area measurements within their defined zones. Examples include `EPSG:26918` for UTM Zone 18N (e.g., New York City).

**Consistency in SRID is critical**: For most spatial operations to work correctly, all input geometries must share the same SRID or be transformed to a common one using `ST_Transform()`.

### 3. Key Spatial Functions
PostGIS provides an extensive library of functions for various spatial operations. We'll focus on some essential categories:

#### a) Spatial Relationship Functions
These functions test how two geometries relate to each other, typically returning a boolean (TRUE/FALSE).

*   `ST_Intersects(geometry A, geometry B)`: Returns TRUE if geometry A spatially intersects geometry B (they touch, overlap, or one contains the other). This is a general test for any commonality.
*   `ST_Contains(geometry A, geometry B)`: Returns TRUE if geometry A completely contains geometry B. The interior and boundary of B must be fully contained within the interior of A.
*   `ST_Within(geometry A, geometry B)`: Returns TRUE if geometry A is completely within geometry B. This is the inverse of `ST_Contains(B, A)`.
*   `ST_Disjoint(geometry A, geometry B)`: Returns TRUE if geometry A does not spatially intersect geometry B at all (they have no points in common).
*   `ST_Touches(geometry A, geometry B)`: Returns TRUE if the geometries have at least one boundary point in common but no interior points in common.

#### b) Spatial Measurement Functions
These functions calculate spatial properties of geometries.

*   `ST_Area(geometry)`: Calculates the area of a polygon or multipolygon. The units depend on the geometry's SRID (e.g., square degrees for WGS 84, square meters for UTM).
*   `ST_Length(geometry)`: Calculates the length of a linestring or multilinestring. Units depend on the SRID.
*   `ST_Distance(geometry A, geometry B)`: Calculates the minimum 2D Cartesian distance between two geometries. Units depend on the SRID.

#### c) Spatial Processing/Manipulation Functions
These functions transform or modify geometries.

*   `ST_Buffer(geometry, radius)`: Generates a polygon representing the area within a specified distance (`radius`) of the input geometry. Units depend on the SRID. For accurate real-world buffers (e.g., in meters), it's often necessary to use a projected CRS.
*   `ST_Union(geometry A, geometry B)`: Merges two or more geometries into a single geometry. Often used with `ST_Collect` and aggregation functions to combine multiple geometries.
*   `ST_Transform(geometry, new_srid)`: Transforms a geometry from its current SRID to a `new_srid`. Essential for performing calculations in different coordinate systems or aligning datasets.

#### d) Geometry Constructor Functions
These functions create geometries from various inputs.

*   `ST_GeomFromText(WKT_string, srid)`: Creates a geometry from a Well-Known Text (WKT) representation (e.g., `'POINT(10 20)'`, `'POLYGON((0 0, 0 1, 1 1, 1 0, 0 0))'`).
*   `ST_SetSRID(geometry, srid)`: Assigns an SRID to a geometry. Use this if the geometry's SRID is unknown or incorrectly set.

## Practical Examples

Let's assume you have a PostGIS-enabled database. First, we'll create a table and insert some sample geometries using WGS 84 (SRID 4326).

```sql
CREATE TABLE spatial_data (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    geom GEOMETRY(Geometry, 4326) -- Stores any geometry type with SRID 4326
);

INSERT INTO spatial_data (name, geom) VALUES
('Central Park', ST_SetSRID(ST_GeomFromText('POLYGON((-73.982 40.768, -73.959 40.793, -73.949 40.785, -73.972 40.760, -73.982 40.768))'), 4326)),
('Times Square', ST_SetSRID(ST_GeomFromText('POINT(-73.9855 40.7580)'), 4326)),
('Broadway', ST_SetSRID(ST_GeomFromText('LINESTRING(-73.9960 40.7380, -73.9850 40.7560, -73.9800 40.7650)'), 4326)),
('Downtown Area', ST_SetSRID(ST_GeomFromText('POLYGON((-74.015 40.705, -73.990 40.705, -73.990 40.725, -74.015 40.725, -74.015 40.705))'), 4326));
```

### Example 1: Using `ST_Intersects`
Find all geometries that intersect with 'Central Park'.

```sql
SELECT
    sd2.name AS intersecting_geometry_name,
    ST_GeometryType(sd2.geom) AS geometry_type
FROM
    spatial_data sd1,
    spatial_data sd2
WHERE
    sd1.name = 'Central Park' AND ST_Intersects(sd1.geom, sd2.geom)
    AND sd1.id != sd2.id; -- Exclude the reference geometry itself
```

### Example 2: Using `ST_Contains`
Find all `POINT` geometries that are completely contained within the 'Downtown Area'.

```sql
SELECT
    sd_points.name
FROM
    spatial_data sd_polygons,
    spatial_data sd_points
WHERE
    sd_polygons.name = 'Downtown Area'
    AND ST_GeometryType(sd_points.geom) = 'ST_Point'
    AND ST_Contains(sd_polygons.geom, sd_points.geom);
```

### Example 3: Using `ST_Buffer` and `ST_Transform`
Create a 500-meter buffer around 'Times Square' and calculate its area in square meters. For accurate meter-based calculations, we transform to a suitable projected CRS (e.g., EPSG:26918 for NYC UTM Zone 18N) before buffering and calculating the area.

```sql
SELECT
    sd.name,
    ST_Area(ST_Buffer(ST_Transform(sd.geom, 26918), 500)) AS buffered_area_sq_meters -- 500 meter buffer
FROM
    spatial_data sd
WHERE
    sd.name = 'Times Square';
```

## Checklist / Exercises

1.  **Find Contained Lines:** Write an SQL query to find the names of all `LINESTRING` geometries from `spatial_data` that are completely within the 'Central Park' polygon.
2.  **Buffer and Intersect with Multiple Geometries:** Create a 0.002-degree buffer around 'Times Square'. Then, write a query to find all geometries in `spatial_data` (excluding 'Times Square' itself) that *intersect* this newly created buffer.
3.  **Disjoint Geometries:** Write an SQL query to find the names of all geometries in `spatial_data` that are `ST_Disjoint` (do not intersect) with 'Broadway'.
