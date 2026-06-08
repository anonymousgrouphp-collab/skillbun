# Foundations of Geospatial Data Science

This study guide establishes a robust understanding of core GIS principles, geospatial data models, coordinate systems, and essential tools for setting up a modern geospatial development environment.

## 1. Introduction to GIS and Geospatial Data Science

*   **What is GIS?** Geographic Information System. A powerful framework for gathering, managing, analyzing, and visualizing geographically referenced data. GIS integrates various data types to help users understand patterns, relationships, and geographic context.
*   **Components of GIS:** Hardware, Software, Data, People, and Methods.
*   **Why Geospatial Data Science?** It combines traditional spatial analysis techniques with advanced data science methods (e.g., machine learning, statistics) to extract deeper insights from location-aware data, enabling better decision-making and predictive modeling.

## 2. Geospatial Data Models

Geospatial data represents real-world features digitally. Two primary models are fundamental:

### 2.1. Vector Data Model

*   Represents discrete features with precise, distinct boundaries (points, lines, or polygons).
*   **Points:** Used for features too small to be represented as areas or lines (e.g., individual trees, well locations, specific addresses).
*   **Lines:** Used for linear features (e.g., roads, rivers, utility lines).
*   **Polygons:** Used for area features (e.g., lakes, administrative boundaries, buildings).
*   Each geometric feature is linked to **attributes** (non-spatial descriptive data) stored in a tabular format.
*   **Examples:** Shapefiles (.shp), GeoJSON, KML.

### 2.2. Raster Data Model

*   Represents continuous phenomena as a grid of cells (pixels), similar to a digital image.
*   Each cell holds a specific value representing an attribute for that geographic location (e.g., elevation, temperature, spectral intensity from satellite imagery).
*   The **resolution** is defined by the cell size, determining the level of detail.
*   **Examples:** Satellite imagery, Digital Elevation Models (DEMs), aerial photographs, temperature maps.

## 3. Coordinate Systems and Projections

Understanding how locations are defined and mapped on Earth is crucial for accurate geospatial analysis.

### 3.1. Geographic Coordinate Systems (GCS)

*   Defines locations on a 3D spherical or ellipsoidal surface using angular units (latitude and longitude).
*   **Datum:** A reference system (comprising an ellipsoid and a set of control points) that precisely defines the shape and size of the Earth for GCS. Common datums include WGS84 (World Geodetic System 1984) and NAD83 (North American Datum 1983).
*   **Units:** Degrees.

### 3.2. Projected Coordinate Systems (PCS)

*   Transforms a GCS from a 3D curved surface (the Earth) to a 2D flat plane (a map).
*   Necessary for accurate measurements of distance, area, and direction, as well as for proper visualization on flat maps.
*   Involves **map projections**, which are mathematical transformations. All projections introduce some distortion (of shape, area, distance, or direction) and are chosen based on the intended use of the map.
*   **Units:** Linear (e.g., meters, feet).
*   **Examples:** UTM (Universal Transverse Mercator), State Plane Coordinate System.

### 3.3. EPSG Codes

*   **European Petroleum Survey Group (EPSG) codes** are unique numeric identifiers for coordinate reference systems (CRS), datums, units, and transformations.
*   They provide a standardized way to reference and manage different spatial references.
*   Common examples: `EPSG:4326` (WGS84 GCS), `EPSG:3857` (Web Mercator, widely used in web mapping platforms).

## 4. Essential Tools and Environment Setup

A modern geospatial development environment primarily leverages the Python programming language and a suite of powerful libraries.

### 4.1. Python for Geospatial

*   **Anaconda/Miniconda:** Highly recommended for managing Python environments and packages, especially for scientific and geospatial computing. It simplifies library installation and avoids dependency conflicts.
    ```bash
    # Create a new conda environment for geospatial projects
    conda create -n geo_env python=3.9

    # Activate the environment
    conda activate geo_env

    # Install core geospatial libraries
    conda install -c conda-forge geopandas fiona shapely rtree
    ```
*   **Key Python Libraries:**
    *   **GDAL/OGR:** (Geospatial Data Abstraction Library / OpenGIS Simple Features Reference Implementation) - The foundational library for reading, writing, and manipulating both raster and vector geospatial data. Many other libraries build upon it.
    *   **Fiona:** Provides a Pythonic interface for reading and writing vector data formats (e.g., Shapefile, GeoJSON, KML) by wrapping OGR functionalities.
    *   **Shapely:** A library for planar geometric objects (points, lines, polygons) and performing standard spatial operations (e.g., buffer, intersection, union, distance calculations).
    *   **GeoPandas:** Extends the popular Pandas DataFrames to work with geospatial data. It combines Fiona and Shapely to enable easy handling of vector data and execution of spatial operations in a data-frame-like structure.
        ```python
        import geopandas as gpd
        from shapely.geometry import Point

        # Create a sample GeoDataFrame
        data = {'city': ['New York', 'Los Angeles'],
                'population': [8419000, 3990000],
                'geometry': [Point(-74.0060, 40.7128), Point(-118.2437, 34.0522)]}
        cities_gdf = gpd.GeoDataFrame(data, crs="EPSG:4326")

        print(cities_gdf)
        # Example: Get the CRS of the GeoDataFrame
        print(f"CRS: {cities_gdf.crs}")
        ```
*   **Jupyter Notebooks/Lab:** An interactive computing environment that allows you to combine code, output, visualizations, and narrative text, making it ideal for geospatial data exploration and analysis workflows.

### 4.2. QGIS (Optional but Highly Recommended for Visualization)

*   **QGIS** is a free and open-source desktop GIS application that provides powerful tools for viewing, editing, analyzing, and publishing geospatial information. It complements programmatic approaches by offering a user-friendly interface for visual exploration and analysis.

## Checklist/Exercises

1.  Describe the primary differences between the vector and raster data models, providing two distinct real-world examples for when each would be most appropriate.
2.  Explain why `EPSG:4326` (WGS84 GCS) is suitable for global positioning but `EPSG:3857` (Web Mercator PCS) is often preferred for web maps, despite its inherent distortions.
3.  Using `conda`, set up a new Python environment named `my_first_gis` with Python 3.10. Install `geopandas` and `matplotlib` within this environment, and then verify the installations by importing them in a Python interpreter.