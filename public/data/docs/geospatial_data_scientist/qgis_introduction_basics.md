## QGIS: Introduction & Basic Operations

QGIS (Quantum Geographic Information System) is a free and open-source desktop geographic information system application that supports viewing, editing, printing, and analysis of geospatial data. It's a powerful tool widely used by geospatial professionals, researchers, and hobbyists for various tasks, from simple map creation to complex spatial analysis.

This guide will introduce you to the QGIS interface, teach you how to load different types of geospatial data, navigate maps, interact with attribute tables, and perform basic geoprocessing operations.

### 1. The QGIS Interface

Upon launching QGIS, you'll be presented with a comprehensive interface designed for geospatial work. Key components include:

*   **Menu Bar:** Contains standard file operations, editing tools, view options, layer management, processing tools, and help.
*   **Toolbars:** Customizable bars providing quick access to frequently used functions like data loading, saving, navigation, selection, and editing.
*   **Map Canvas:** The central area where your geographic data is displayed. All layers are rendered here.
*   **Layers Panel:** Located typically on the left, it lists all active layers in your project. You can control visibility, order, and styling of layers here.
*   **Browser Panel:** Also on the left, allows you to browse local and network data sources (e.g., file system, databases, web services) and drag-and-drop them into the map canvas.
*   **Status Bar:** At the bottom, displays information such as the current map scale, coordinate system, mouse cursor coordinates, and processing status.

### 2. Loading Data

QGIS supports a vast array of geospatial data formats, both vector and raster.

#### Vector Data
Vector data represents geographic features as points, lines, or polygons. Common formats include Shapefiles (.shp), GeoJSON (.geojson), KML (.kml), and GPKG (GeoPackage).

**Steps to Load Vector Data:**
1.  Go to `Layer > Add Layer > Add Vector Layer...` or click the `Open Data Source Manager` button (often a folder icon with a plus sign).
2.  In the Data Source Manager, select "Vector" tab.
3.  Choose the `Source Type` (e.g., File).
4.  Click the `...` (browse) button next to "Vector Dataset(s)" and navigate to your data file (e.g., a `.shp` file).
5.  Click `Add` then `Close`.

#### Raster Data
Raster data represents geographic information as a grid of pixels, commonly used for imagery, elevation models, or thematic maps. Common formats include GeoTIFF (.tif), JPEG 2000 (.jp2), and ASCII Grid.

**Steps to Load Raster Data:**
1.  Go to `Layer > Add Layer > Add Raster Layer...` or use the `Open Data Source Manager`.
2.  In the Data Source Manager, select "Raster" tab.
3.  Click the `...` (browse) button next to "Raster Dataset(s)" and navigate to your raster file (e.g., a `.tif` file).
4.  Click `Add` then `Close`.

### 3. Basic Navigation

Once data is loaded, you can explore it using the navigation tools typically found in the "Map Navigation Toolbar":

*   **Pan Map:** Click and drag the map to move around.
*   **Zoom In/Out:** Use the zoom tools (magnifying glass icons) or your mouse scroll wheel.
*   **Zoom Full:** Zooms to the full extent of all layers in the project.
*   **Zoom to Layer(s):** Right-click on a layer in the Layers panel and select `Zoom to Layer` to focus on a specific layer's extent.
*   **Zoom Last/Next:** Navigates through previous map extents.

### 4. Attribute Tables

Vector data layers have an associated attribute table, which stores non-spatial information (attributes) about each geographic feature. For example, a layer of cities might have attributes like population, name, and administrative type.

**Steps to Access and Interact with Attribute Tables:**
1.  Right-click on a vector layer in the `Layers Panel`.
2.  Select `Open Attribute Table`.
3.  In the attribute table window, you can:
    *   **Sort:** Click on any column header to sort features by that attribute.
    *   **Filter:** Click the `Select Features using an Expression` button (an 'Epsilon' symbol) or `Filter Features` button to create complex queries.
    *   **Select:** Click on rows to select individual features. Selected features will also be highlighted on the map canvas.

### 5. Simple Geoprocessing Tools

QGIS offers a vast array of geoprocessing tools for spatial analysis. Let's look at a common example: creating a buffer.

**Buffer Tool:** Creates a polygon area at a specified distance around selected vector features (points, lines, or polygons).

**Example: Creating a Buffer around Points**

Let's assume you have a point layer representing schools and want to identify areas within a 500-meter radius of each school.

1.  Ensure your point layer (e.g., `schools.shp`) is loaded in QGIS.
2.  Go to `Processing > Toolbox` to open the Processing Toolbox panel.
3.  In the search bar of the Processing Toolbox, type "Buffer" and select the `Buffer` tool under `Vector geometry`.
4.  In the `Buffer` dialog:
    *   **Input layer:** Select your `schools` layer.
    *   **Distance:** Enter `500` (for 500 meters). Ensure the units are correct (usually detected from the layer's CRS).
    *   **Segments:** Keep default or adjust for smoother buffer edges.
    *   **Dissolve result:** Check this box if you want overlapping buffers to merge into a single polygon (e.g., if you want one combined 500m radius area for all schools).
    *   **Buffered:** Choose to save to a temporary layer or click `...` to save to a file (e.g., `schools_buffer.shp`).
5.  Click `Run`.

A new layer (`schools_buffer`) will be added to your Layers panel, showing the buffered areas around your schools.

### Checklist/Exercise

1.  Download a sample GeoJSON file (e.g., boundaries of your country's states/provinces) and load it into QGIS.
2.  Open the attribute table for the loaded layer and filter the features to show only those with a specific name or population range. Select one of the filtered features.
3.  Using the `Buffer` tool, create a 10 km buffer around your selected feature. Observe the new layer on the map canvas.