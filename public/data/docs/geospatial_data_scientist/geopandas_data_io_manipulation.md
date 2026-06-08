# GeoPandas: Data I/O & Manipulation

GeoPandas extends the data types of pandas to allow spatial operations on geometric types. It simplifies working with geospatial data in Python, providing a `GeoDataFrame` that acts like a pandas `DataFrame` but with a dedicated `geometry` column containing geometric objects (points, lines, polygons). This guide focuses on reading, writing, and manipulating these vector data formats.

## 1. Reading Vector Data

GeoPandas makes reading various vector data formats incredibly straightforward using the `geopandas.read_file()` function. This function can automatically detect the file format and its Coordinate Reference System (CRS).

```python
import geopandas

# Example: Reading a Shapefile
gdf_shapefile = geopandas.read_file("path/to/your/data.shp")
print("Shapefile Head:")
print(gdf_shapefile.head())
print("Shapefile CRS:", gdf_shapefile.crs)

# Example: Reading a GeoJSON file
gdf_geojson = geopandas.read_file("path/to/your/data.geojson")
print("GeoJSON Head:")
print(gdf_geojson.head())

# Example: Reading a KML file (requires fiona and potentially pykml/lxml)
# KML support might require specific GDAL drivers. Explicitly setting driver helps:
# gdf_kml = geopandas.read_file("path/to/your/data.kml", driver="KML")
# print("KML Head:")
# print(gdf_kml.head())
```

**Note on KML:** GeoPandas relies on Fiona (which in turn uses GDAL/OGR) for I/O. KML support might require specific GDAL drivers to be installed and enabled on your system.

## 2. Writing Vector Data

Writing a `GeoDataFrame` to various vector formats is done using the `.to_file()` method. You can specify the output file path and, optionally, the `driver` to control the output format.

```python
# Assuming gdf_shapefile is already loaded from the previous step

# Example: Writing to a new Shapefile
gdf_shapefile.to_file("output_data.shp")

# Example: Writing to a GeoJSON file
gdf_shapefile.to_file("output_data.geojson", driver="GeoJSON")

# Example: Writing to a KML file (if driver is available)
# gdf_shapefile.to_file("output_data.kml", driver="KML")
```

When writing a Shapefile, GeoPandas automatically creates all necessary associated files (.dbf, .shx, .prj, etc.).

## 3. Basic Data Manipulation

Once data is loaded into a `GeoDataFrame`, you can leverage both pandas-like operations and specific geospatial manipulations.

### a. Column Selection and Filtering

You can select columns or filter rows based on attribute values, similar to pandas.

```python
# Select specific columns
selected_columns = gdf_shapefile[['name', 'population', 'geometry']]
print("Selected Columns Head:")
print(selected_columns.head())

# Filter rows based on an attribute (e.g., population > 100000)
high_population_areas = gdf_shapefile[gdf_shapefile['population'] > 100000]
print("High Population Areas Head:")
print(high_population_areas.head())
```

### b. Creating New Columns

Adding new attribute columns is just like adding a new column to a pandas DataFrame.

```python
# Create a new column 'area_sqkm' by calculating the area of each geometry
# Note: Area calculation accuracy depends on the CRS. Use a projected CRS for accurate area.
gdf_shapefile['area_sqkm'] = gdf_shapefile.geometry.area / 10**6 # Assuming CRS in meters or similar

print("GeoDataFrame with new 'area_sqkm' column:")
print(gdf_shapefile[['name', 'area_sqkm', 'geometry']].head())
```

### c. Coordinate Reference System (CRS) Transformation

One of the most powerful manipulation features is transforming the CRS of your geospatial data using the `.to_crs()` method. This is crucial for spatial analysis and consistent mapping.

```python
# Transform to a common geographic CRS (WGS84, EPSG:4326)
gdf_wgs84 = gdf_shapefile.to_crs(epsg=4326)
print("CRS after transformation (WGS84):", gdf_wgs84.crs)

# Transform to a projected CRS for accurate measurements (e.g., UTM Zone 31N, EPSG:25831)
# Ensure your data is within the region covered by the chosen projected CRS
# gdf_projected = gdf_shapefile.to_crs(epsg=25831)
# print("CRS after transformation (UTM):", gdf_projected.crs)
```

## Quick Checklist/Exercise

1.  Describe the primary function of `geopandas.read_file()` and `GeoDataFrame.to_file()`.
2.  How would you filter a `GeoDataFrame` called `cities_gdf` to only include cities with a population greater than 500,000?
3.  Explain why and when you might use the `.to_crs()` method on a `GeoDataFrame`.