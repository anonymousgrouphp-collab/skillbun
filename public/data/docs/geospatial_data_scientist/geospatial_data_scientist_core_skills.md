# Core Geospatial Data Analysis & Implementation

This study guide provides a foundational understanding and practical skills in handling, processing, analyzing, and visualizing both vector and raster geospatial data using leading Python libraries and spatial databases. Mastering these concepts is crucial for any Geospatial Data Scientist.

## 1. Introduction to Geospatial Data

Geospatial data refers to information that describes the location, shape, and relationships of features on the Earth. It typically falls into two main categories:

*   **Vector Data:** Represents discrete features as points, lines, or polygons. Each feature has a distinct boundary and associated attributes.
*   **Raster Data:** Represents continuous phenomena (e.g., temperature, elevation, satellite imagery) as a grid of cells (pixels), where each cell holds a value.

## 2. Working with Vector Data in Python

Python's `GeoPandas` library, built on `Pandas`, `Shapely`, and `Fiona`, is the cornerstone for vector data manipulation.

### Core Concepts

*   **`GeoDataFrame`**: A tabular data structure with a special `geometry` column that stores `Shapely` geometric objects (Points, LineStrings, Polygons).
*   **`GeoSeries`**: A vector column representing a collection of geometries.
*   **Coordinate Reference Systems (CRS)**: Defines how geographic coordinates relate to real-world locations. Crucial for spatial operations.

### Basic Operations

1.  **Loading Data**: From Shapefiles, GeoJSON, PostGIS, etc.
2.  **Accessing Attributes**: Similar to Pandas DataFrames.
3.  **Spatial Operations**:
    *   **Buffering**: Creating a polygon at a specified distance around a geometry.
    *   **Intersection/Union/Difference**: Combining or subtracting geometries.
    *   **Spatial Joins**: Joining two GeoDataFrames based on their spatial relationship (e.g., "within", "intersects").
4.  **Visualization**: Simple plots using `.plot()` method.

### Code Example: Loading and Plotting Vector Data

```python
import geopandas
import matplotlib.pyplot as plt

# Load a sample shapefile (e.g., naturalearth_lowres comes with geopandas)
# Replace with your own path if using local data:
# world = geopandas.read_file("path/to/your/shapefile.shp")
world = geopandas.read_file(geopandas.datasets.get_path('naturalearth_lowres'))

# Display the first few rows
print(world.head())

# Plot the data
world.plot(figsize=(10, 6))
plt.title("World Countries")
plt.show()

# Example: Filter for a specific country and plot
usa = world[world['name'] == 'United States']
usa.plot(figsize=(5, 5), color='blue', edgecolor='black')
plt.title("United States")
plt.show()
```

## 3. Working with Raster Data in Python

The `Rasterio` library provides a robust and efficient way to read, write, and manipulate raster datasets. It integrates with NumPy for numerical operations.

### Core Concepts

*   **Dataset Reader**: An object that provides access to raster data properties (CRS, transform, bounds, band count, data type).
*   **Bands**: Raster data often has multiple bands (e.g., Red, Green, Blue for imagery, or different time steps).
*   **Transform**: A matrix that maps pixel coordinates to geographic coordinates.

### Basic Operations

1.  **Loading Data**: From GeoTIFF, JPEG2000, etc.
2.  **Reading Bands**: Extracting pixel values into NumPy arrays.
3.  **Writing Data**: Saving processed raster data to new files.
4.  **Reprojection**: Changing the CRS of a raster.
5.  **Clipping**: Extracting a subset of a raster based on a bounding box or vector mask.

### Code Example: Loading and Plotting Raster Data

```python
import rasterio
from rasterio.plot import show
import matplotlib.pyplot as plt
import numpy as np
from rasterio.transform import from_origin

# For demonstration, we'll create dummy data if a file isn't found.
# For real-world use, replace 'sample_elevation.tif' with your actual raster file path.

try:
    with rasterio.open('sample_elevation.tif') as src:
        # Read the first band of the raster
        elevation = src.read(1)
        # Plot the raster
        fig, ax = plt.subplots(1, 1, figsize=(8, 8))
        show(elevation, transform=src.transform, ax=ax, cmap='terrain')
        ax.set_title("Sample Elevation Data (from file)")
        plt.show()
except rasterio.errors.RasterioIOError:
    print("Could not find 'sample_elevation.tif'. Generating dummy data for demonstration.")
    # Dummy data if file is not found
    height = 500
    width = 500
    # Simulate a gradient
    data = np.outer(np.linspace(0, 1, height), np.linspace(0, 1, width)) * 255
    data = data.astype(rasterio.uint8)

    # Define a transform
    transform = from_origin(-105.0, 40.0, 0.01, 0.01) # Example origin and pixel size

    # Plot the dummy raster
    fig, ax = plt.subplots(1, 1, figsize=(8, 8))
    show(data, transform=transform, ax=ax, cmap='viridis')
    ax.set_title("Sample Elevation Data (Dummy)")
    plt.show()
```

## 4. Advanced Geospatial Operations

### Vector Operations with GeoPandas

*   **Dissolving**: Merging polygons with common attribute values.
*   **Spatially Aggregating**: Performing statistical operations on geometries based on spatial relationships.
*   **Geometric Operations**: Calculating area, length, centroids.

### Raster Operations with Rasterio & GDAL

*   **Mosaic**: Merging multiple raster images into a single one.
*   **Band Math**: Performing arithmetic operations across different bands (e.g., calculating NDVI from Red and NIR bands).
*   **Zonal Statistics**: Calculating statistics (mean, min, max) for raster pixels within vector zones.
*   **Reprojecting and Resampling**: Changing CRS and resolution.

## 5. Geospatial Visualization

*   **Static Maps**: Using `matplotlib` directly or `geopandas.plot()` for quick visualizations.
*   **Interactive Maps**: `Folium` and `Leaflet` (via `folium`) allow creation of interactive web maps with layers, popups, and basemaps.

```python
import folium

# Create a base map centered at a specific location
m = folium.Map(location=[39.8283, -98.5795], zoom_start=4) # Center of USA

# Add a marker
folium.Marker([34.0522, -118.2437], popup='Los Angeles').add_to(m)

# Add a circle marker
folium.CircleMarker(
    location=[40.7128, -74.0060],
    radius=50,
    color='red',
    fill=True,
    fill_color='red',
    popup='New York City'
).add_to(m)

# Display the map (in a Jupyter Notebook or save to HTML)
# m # Uncomment in Jupyter to display in a notebook
# m.save("interactive_map.html") # Save to an HTML file
print("Interactive map created. Open 'interactive_map.html' in your browser if saved.")
```

## 6. Spatial Databases (PostGIS)

For large-scale geospatial data management and complex spatial queries, spatial databases like PostGIS (an extension for PostgreSQL) are indispensable.

*   **Benefits**: Efficient storage, indexing (GiST, SP-GiST) for fast spatial queries, robust spatial functions directly in SQL.
*   **Integration with Python**: Libraries like `SQLAlchemy` and `GeoAlchemy2` allow Python applications to interact seamlessly with PostGIS databases.

## Checklist / Exercises

1.  **Vector Data Challenge**: Load a GeoJSON file of city boundaries. Calculate the area of each city and identify the top 3 largest cities. Plot these cities.
2.  **Raster Data Challenge**: Given a GeoTIFF elevation model, clip it to a specific bounding box (e.g., your local region). Then, create a basic hillshade visualization from the clipped elevation data.
3.  **Integration Challenge**: Using both vector and raster skills, load a vector layer of protected areas and a raster layer of land cover. Calculate the percentage of forest cover within each protected area.