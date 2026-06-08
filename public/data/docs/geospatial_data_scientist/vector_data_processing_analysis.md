# Vector Data Processing with GeoPandas

## Introduction to GeoPandas

GeoPandas is an open-source library that extends the popular pandas library to enable spatial operations on geometric types. It combines the data structures and data manipulation capabilities of pandas with the spatial capabilities of Shapely and the coordinate system management of Fiona and pyproj. This makes it an indispensable tool for working with geospatial vector data in Python.

Vector data represents geographic features as discrete geometric objects (points, lines, and polygons) with associated attributes. GeoPandas allows you to load, manipulate, and analyze these geometries and their attributes efficiently.

## Core Concepts

### GeoSeries and GeoDataFrame

-   **`GeoSeries`**: A `pandas.Series` object that holds geometric objects (from Shapely) and includes methods for spatial operations.
-   **`GeoDataFrame`**: A `pandas.DataFrame` that has a `GeoSeries` column named 'geometry' (by default). This `GeoSeries` is treated as the active geometry column, allowing direct spatial operations on the `GeoDataFrame` itself. A `GeoDataFrame` also stores coordinate reference system (CRS) information.

### Reading and Writing Vector Data

GeoPandas can read and write a variety of vector data formats, including Shapefiles, GeoJSON, KML, GPKG, and more, using the Fiona library under the hood.

```python
import geopandas

# Read a Shapefile
gdf = geopandas.read_file("path/to/your/shapefile.shp")

# Read a GeoJSON file
gdf_geojson = geopandas.read_file("path/to/your/data.geojson")

# Write to a Shapefile
gdf.to_file("output.shp")

# Write to GeoJSON
gdf.to_file("output.geojson", driver="GeoJSON")
```

### Working with Geometries

Accessing and manipulating geometries is central to GeoPandas. You can access the geometry column directly or create new geometries.

```python
# Access the geometry column
geometries = gdf.geometry

# Get the first geometry
first_geometry = gdf.geometry[0]

# Create a new point geometry
from shapely.geometry import Point
new_point = Point(1, 2)

# Add a new geometry column (example)
gdf['centroid'] = gdf.geometry.centroid
```

### Coordinate Reference Systems (CRS)

CRS defines how geographic coordinates are related to actual positions on Earth. GeoPandas handles CRS information, which is crucial for accurate spatial analysis.

```python
# Check the CRS of a GeoDataFrame
print(gdf.crs)

# Reproject to a new CRS (e.g., WGS 84 - EPSG:4326)
gdf_wgs84 = gdf.to_crs(epsg=4326)

# Reproject to a projected CRS (e.g., suitable for local analysis)
gdf_projected = gdf.to_crs("EPSG:3857") # Web Mercator
```

## Spatial Joins

Spatial joins combine two `GeoDataFrames` based on their spatial relationship (e.g., `intersects`, `within`, `contains`, `touches`). This is analogous to a database join but uses spatial predicates instead of common key columns.

The `geopandas.sjoin()` function performs spatial joins. Key parameters include `op` (the spatial predicate) and `how` (join type: `left`, `right`, `inner`).

```python
# Example: Join points to polygons to assign polygon attributes to points
# Assume 'points_gdf' and 'polygons_gdf' are two GeoDataFrames

# Find which polygon each point is within
points_with_polygon_attributes = geopandas.sjoin(
    points_gdf,
    polygons_gdf,
    how="inner",
    op="within"
)

# Example of using 'intersects' to find overlapping features
intersections = geopandas.sjoin(
    gdf1,
    gdf2,
    how="inner",
    op="intersects"
)
```

## Overlay Analysis

Overlay analysis involves combining geometries from two `GeoDataFrames` to create new geometries and attributes. Common overlay operations include union, intersection, difference, and symmetric difference.

GeoPandas provides the `overlay()` function for these operations.

-   `'intersection'`: Returns the areas where both geometries overlap.
-   `'union'`: Returns the combined area of both geometries.
-   `'difference'`: Returns the area of the first geometry that does not overlap with the second.
-   `'symmetric_difference'`: Returns the areas where geometries exist but do not overlap with each other.

```python
# Assume 'gdf_areas' and 'gdf_zones' are two GeoDataFrames with polygon geometries

# Intersection: Find the overlapping areas and combine attributes
intersected_areas = geopandas.overlay(gdf_areas, gdf_zones, how='intersection')

# Union: Combine all areas, creating new polygons where they overlap
unioned_areas = geopandas.overlay(gdf_areas, gdf_zones, how='union')

# Difference: Keep parts of gdf_areas that don't overlap with gdf_zones
differenced_areas = geopandas.overlay(gdf_areas, gdf_zones, how='difference')
```

## Advanced Geoprocessing Operations

GeoPandas offers several other powerful geoprocessing tools:

-   **`buffer(distance)`**: Creates a polygon at a specified distance around each geometry. Useful for creating proximity zones.
-   **`dissolve(by=None)`**: Aggregates geometries within a `GeoDataFrame` based on a common attribute. Merges adjacent or overlapping geometries sharing the same attribute value into a single (potentially multi-)geometry.
-   **`clip(mask)`**: Clips a `GeoDataFrame` using a polygon `mask`. It returns the portion of the input `GeoDataFrame` that falls within the extent of the mask polygon.

```python
# Assume 'roads_gdf' contains line geometries and 'city_boundary' is a single polygon GeoDataFrame

# Create a 100-meter buffer around roads (ensure CRS is projected for meaningful units)
buffered_roads = roads_gdf.to_crs("EPSG:3857").buffer(100)

# Dissolve polygons by a 'district' column
dissolved_districts = gdf.dissolve(by='district')

# Clip a GeoDataFrame of land parcels by a city boundary
clipped_parcels = geopandas.clip(parcels_gdf, city_boundary)
```

## Quick Checklist/Exercise

1.  **Read and Inspect**: Load a GeoJSON file into a `GeoDataFrame`. Print its CRS and the first 5 rows to understand its structure.
2.  **Spatial Join**: Given a `GeoDataFrame` of points (e.g., building locations) and a `GeoDataFrame` of polygons (e.g., administrative zones), perform a spatial join to assign the `zone_name` attribute from the polygons to each point that falls within a zone.
3.  **Buffer and Dissolve**: Select a subset of features from your GeoDataFrame (e.g., all parks). Create a 500-meter buffer around these features. Then, dissolve these buffered geometries into a single (potentially multi-)polygon, effectively merging overlapping buffer zones into one larger area.