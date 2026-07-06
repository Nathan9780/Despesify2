// src/hooks/useGooglePlaces.js
import { useState, useCallback } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const libraries = ["places"];

export const useGooglePlaces = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const searchPlaces = useCallback(
    (mapInstance, location, radius = 5000) => {
      setLoading(true);
      setError(null);

      // Simulando uma requisição de API de 1 segundo
      setTimeout(() => {
        const mockResults = [
          {
            id: "mock-1",
            name: "Depósito de Materiais Silva",
            address: "Av. Principal, 1000 - Centro",
            rating: 4.8,
            user_ratings_total: 124,
            distance: "1.2",
            lat: location.lat + 0.01,
            lng: location.lng + 0.01,
            isOpen: true,
          },
          {
            id: "mock-2",
            name: "Construmax Materiais",
            address: "Rua das Flores, 45",
            rating: 4.2,
            user_ratings_total: 89,
            distance: "3.5",
            lat: location.lat - 0.02,
            lng: location.lng + 0.01,
            isOpen: true,
          },
          {
            id: "mock-3",
            name: "Ferragens e Cia",
            address: "Av. Industrial, 500",
            rating: 3.9,
            user_ratings_total: 45,
            distance: "5.1",
            lat: location.lat + 0.03,
            lng: location.lng - 0.02,
            isOpen: false,
          },
          {
            id: "mock-4",
            name: "Tijolo & Cimento Express",
            address: "Rua do Comércio, 120",
            rating: 4.9,
            user_ratings_total: 312,
            distance: "2.0",
            lat: location.lat - 0.01,
            lng: location.lng - 0.01,
            isOpen: true,
          },
        ];

        setPlaces(mockResults.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)));
        setLoading(false);
      }, 1000);
    },
    []
  );

  return {
    isLoaded,
    loadError,
    places,
    loading,
    error,
    searchPlaces,
  };
};
