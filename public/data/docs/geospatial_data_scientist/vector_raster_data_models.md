# Vector & Raster Data Models: A Study Guide

Geospatial data models are fundamental to understanding and working with Geographic Information Systems (GIS). They dictate how real-world geographic features are represented digitally. The two primary data models are Vector and Raster.

## 1. Vector Data Model

Vector data represents geographic features using discrete geometric objects such as points, lines, and polygons. These objects are defined by their precise coordinates and topology.

### Characteristics:
*   **Discrete Features:** Represents distinct, identifiable geographic features with clear boundaries (e.g., roads, buildings, property lines).
*   **Spatial Precision:** Offers high spatial accuracy, as locations are defined by exact X,Y (and sometimes Z) coordinates.
*   **Attribute Tables:** Each feature in a vector dataset typically has an associated attribute table containing non-spatial information (e.g., population for a city, street name for a road).
*   **Topology:** Can store topological relationships between features (e.g., adjacency, connectivity, containment).
*   **Scalability:** Graphics scale well without loss of detail.

### Uses:
*   **Cadastral Mapping:** Property boundaries, land parcels.
*   **Network Analysis:** Road networks, utility lines, hydrological networks.
*   **Facility Management:** Locations of infrastructure (e.g., streetlights, hydrants).
*   **Thematic Mapping:** Political boundaries, demographic maps.

### Common File Formats:
*   **Shapefile (.shp, .shx, .dbf, .prj):** A widely used, multi-file format for storing vector data.
*   **GeoJSON (.geojson):** A lightweight, open standard format based on JSON for encoding geographic data structures.
*   **KML (.kml, .kmz):** Keyhole Markup Language, used for displaying geographic data in applications like Google Earth.
*   **GML (.gml):** Geographic Markup Language, an XML grammar for expressing geographic features.
*   **ESRI File Geodatabase (.gdb):** A proprietary container for storing various GIS datasets, including vector features.

## 2. Raster Data Model

Raster data represents geographic space as a regular grid of cells (pixels), where each cell holds a value representing a specific attribute of the area it covers.

### Characteristics:
*   **Continuous Phenomena:** Ideal for representing continuous spatial data (e.g., elevation, temperature, satellite imagery).
*   **Cell-based Structure:** Data is stored as a matrix of cells, each with a single value.
*   **Resolution:** The size of a single cell defines the spatial resolution of the raster. Smaller cells mean higher resolution and larger file sizes.
*   **Implicit Location:** The location of any pixel is implicit from its row and column index and the grid's origin and cell size.
*   **Simple Data Structure:** Easy to process and model spatial relationships through cell-by-cell operations.

### Uses:
*   **Satellite and Aerial Imagery:** Earth observation, land cover mapping.
*   **Digital Elevation Models (DEMs):** Representing terrain height and topography.
*   **Environmental Modeling:** Temperature maps, precipitation data, pollution dispersion.
*   **Land Cover/Land Use:** Classifying areas based on vegetation, water, urban development.

### Common File Formats:
*   **GeoTIFF (.tif, .tiff):** A standard image file format that includes embedded georeferencing information.
*   **JPEG 2000 (.jp2):** An image compression standard and coding system, often used for geospatial imagery due to its ability to handle large files efficiently.
*   **ERDAS Imagine (.img):** A proprietary format commonly used for satellite and aerial imagery.
*   **ASCII Grid (.asc):** A simple, text-based format for representing raster data, often used for data interchange.

## 3. Key Differences: Vector vs. Raster

| Feature           | Vector Data Model                                  | Raster Data Model                                     |
| :---------------- | :------------------------------------------------- | :---------------------------------------------------- |
| **Representation**| Points, lines, polygons                            | Grid of cells (pixels)                                |
| **Data Type**     | Discrete features with precise boundaries          | Continuous phenomena, surfaces                       |
| **Attributes**    | Stored in attribute tables                         | Cell value represents attribute                       |
| **Storage**       | Typically smaller for discrete features            | Can be very large for high-resolution, large areas    |
| **Precision**     | High positional accuracy                           | Resolution-dependent (cell size)                      |
| **Analysis**      | Network analysis, overlay of discrete features     | Surface analysis, image processing, continuous overlays|
| **Appearance**    | Clear, distinct lines and shapes                   | Pixelated appearance, especially when zoomed in       |

## 4. When to Use Which?

*   **Choose Vector when:** You need to represent distinct features with precise boundaries (e.g., property lines, roads, administrative areas) and require detailed attribute information and topological relationships.
*   **Choose Raster when:** You are working with continuous data (e.g., elevation, temperature, satellite imagery) or performing image processing and surface analysis. Raster is also good for representing phenomena that vary gradually across space.

## Conceptual Data Loading Snippet

While specific code varies by language and library, the conceptual approach to loading these data types highlights their differences. For instance, in Python with common geospatial libraries, you'd use different tools:

```python
# Conceptual example of loading different data types

# --- Loading Vector Data (e.g., with geopandas) ---
# import geopandas as gpd
# cities_gdf = gpd.read_file("path/to/cities.shp")
# print(cities_gdf.head()) # Shows attribute table for vector features

# --- Loading Raster Data (e.g., with rasterio) ---
# import rasterio
# with rasterio.open("path/to/elevation.tif") as src:
#     # Access raster properties like width, height, bounds, crs
#     print(f"Raster dimensions: {src.width}x{src.height}")
#     # Optionally read a band of data into a NumPy array
#     # elevation_array = src.read(1)
```

## Checklist/Exercises:

1.  **Identify Data Models:** For each of the following, determine whether it's best represented by a vector or raster data model and explain why: (a) A map of national parks, (b) A satellite image showing forest cover, (c) A dataset of global ocean temperatures.
2.  **Format Association:** Match the following file formats to their primary data model (Vector or Raster): Shapefile, GeoTIFF, KML, ASCII Grid.
3.  **Use Case Scenario:** You are tasked with mapping the precise locations of all fire hydrants in a city and associating them with maintenance schedules. Which data model would you choose and why, considering both spatial accuracy and attribute management?
