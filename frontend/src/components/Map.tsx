"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "mapbox-gl/dist/mapbox-gl.css";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

// You'll need to add your Mapbox access token to environment variables
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface Rectangle {
  id: number;
  name: string;
  coordinates: {
    type: string;
    coordinates: number[][][];
  };
  center_coordinates: [number, number];
  created_at: string;
  updated_at: string;
}

interface MapProps {
  rectangles?: Rectangle[];
  onRectangleCreated?: (rectangle: { geometry: unknown }) => void;
  onRectangleDeleted?: (id: number) => void;
  onRectangleSelected?: (rectangle: Rectangle) => void;
  selectedRectangle?: Rectangle | null;
  showAllZones?: boolean;
}

export default function Map({
  rectangles = [],
  onRectangleCreated,
  onRectangleDeleted,
  onRectangleSelected,
  selectedRectangle,
  showAllZones = true,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Set Mapbox access token
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [29.032137, 41.107568], // Istanbul Sarıyer
      zoom: 12,
      attributionControl: false,
    });

    // Initialize draw controls
    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      styles: [
        // Active (being drawn) polygon
        {
          id: "gl-draw-polygon-fill-active",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          paint: {
            "fill-color": "#3bb2d0",
            "fill-outline-color": "#3bb2d0",
            "fill-opacity": 0.1,
          },
        },
        // Active polygon outline
        {
          id: "gl-draw-polygon-stroke-active",
          type: "line",
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#3bb2d0",
            "line-dasharray": [0.2, 2],
            "line-width": 2,
          },
        },
        // Inactive polygon
        {
          id: "gl-draw-polygon-fill-inactive",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
          paint: {
            "fill-color": "#3bb2d0",
            "fill-outline-color": "#3bb2d0",
            "fill-opacity": 0.1,
          },
        },
        // Inactive polygon outline
        {
          id: "gl-draw-polygon-stroke-inactive",
          type: "line",
          filter: ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#3bb2d0",
            "line-width": 2,
          },
        },
      ],
    });

    // Add draw controls to map
    map.current.addControl(draw.current);

    // Set up event listeners
    map.current.on("load", () => {
      setIsMapLoaded(true);

      // Restore saved map state if available
      const savedState = localStorage.getItem("mapState");
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          if (state.center && state.zoom) {
            map.current?.flyTo({
              center: state.center,
              zoom: state.zoom,
              duration: 1000,
            });
          }
        } catch (error) {
          // Handle error silently
        }
      }
    });

    // Wait for both load and style to be ready
    map.current.on("styledata", () => {
      setIsMapReady(true);
    });

    map.current.on("draw.create", (e) => {
      const data = draw.current?.getAll();
      if (data && data.features.length > 0) {
        const feature = data.features[data.features.length - 1];
        if (onRectangleCreated) {
          onRectangleCreated(feature);
        }
      }
    });

    map.current.on("draw.delete", (e) => {
      if (onRectangleDeleted) {
        // You might need to track which rectangle was deleted
        // This is a simplified version
        onRectangleDeleted(0);
      }
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [onRectangleCreated, onRectangleDeleted]);

  // Add saved rectangles to map
  useEffect(() => {
    if (!map.current || !isMapLoaded || !isMapReady) {
      return;
    }

    // Add a small delay to ensure style is fully loaded
    const timeoutId = setTimeout(() => {
      if (!map.current) return;

      // Remove existing rectangles
      if (map.current.getSource("rectangles")) {
        map.current.removeLayer("rectangles-fill");
        map.current.removeLayer("rectangles-stroke");
        map.current.removeSource("rectangles");
      }

      // Add new rectangles
      const safeRectangles = Array.isArray(rectangles) ? rectangles : [];
      let rectanglesToShow = safeRectangles;

      // If not showing all zones and there's a selected rectangle, show only that one
      if (!showAllZones && selectedRectangle) {
        rectanglesToShow = [selectedRectangle];

        // Center the map on the selected rectangle
        if (selectedRectangle.center_coordinates) {
          map.current?.flyTo({
            center: selectedRectangle.center_coordinates,
            zoom: 12,
            duration: 1000,
          });
        }
      }

      if (rectanglesToShow.length > 0) {
        const features = rectanglesToShow.map((rect) => ({
          type: "Feature" as const,
          properties: {
            id: rect.id,
            name: rect.name,
            created_at: rect.created_at,
          },
          geometry: rect.coordinates as any,
        }));

        map.current.addSource("rectangles", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features,
          },
        });

        // Add fill layer
        map.current.addLayer({
          id: "rectangles-fill",
          type: "fill",
          source: "rectangles",
          paint: {
            "fill-color": "#3bb2d0",
            "fill-opacity": 0.2,
          },
        });

        // Add stroke layer
        map.current.addLayer({
          id: "rectangles-stroke",
          type: "line",
          source: "rectangles",
          paint: {
            "line-color": "#3bb2d0",
            "line-width": 2,
          },
        });

        // Add click handler
        map.current.on("click", "rectangles-fill", (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const rectangle = rectangles.find(
              (r) => r.id === feature.properties?.id
            );
            if (rectangle && onRectangleSelected) {
              onRectangleSelected(rectangle);
            }
          }
        });

        // Add right-click handler for delete
        map.current.on("contextmenu", "rectangles-fill", (e) => {
          e.preventDefault();
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const rectangle = rectangles.find(
              (r) => r.id === feature.properties?.id
            );
            if (rectangle && onRectangleDeleted) {
              if (
                confirm(`Are you sure you want to delete "${rectangle.name}"?`)
              ) {
                onRectangleDeleted(rectangle.id);
              }
            }
          }
        });

        // Change cursor on hover
        map.current.on("mouseenter", "rectangles-fill", () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = "pointer";
          }
        });

        map.current.on("mouseleave", "rectangles-fill", () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = "";
          }
        });

        // Add hover effect for delete indication
        map.current.on("mouseenter", "rectangles-fill", () => {
          if (map.current) {
            map.current.setPaintProperty(
              "rectangles-fill",
              "fill-opacity",
              0.4
            );
          }
        });

        map.current.on("mouseleave", "rectangles-fill", () => {
          if (map.current) {
            map.current.setPaintProperty(
              "rectangles-fill",
              "fill-opacity",
              0.2
            );
          }
        });
      }
    }, 100); // 100ms delay

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    rectangles,
    selectedRectangle,
    showAllZones,
    isMapLoaded,
    isMapReady,
    onRectangleSelected,
    onRectangleDeleted,
  ]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />

      {/* Map controls overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
          <button
            onClick={() => draw.current?.changeMode("draw_polygon")}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors mr-1"
          >
            Draw
          </button>
          <button
            onClick={() => draw.current?.changeMode("simple_select")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors  "
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
