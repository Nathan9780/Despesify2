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
      if (!isLoaded || loadError) {
        setError(loadError || new Error("Google Maps API não carregada."));
        return;
      }
      
      if (!mapInstance) {
        setError(new Error("Instância do mapa não fornecida."));
        return;
      }

      setLoading(true);
      setError(null);

      const service = new window.google.maps.places.PlacesService(mapInstance);

      const request = {
        location: new window.google.maps.LatLng(location.lat, location.lng),
        radius,
        keyword: "material de construção",
      };

      service.nearbySearch(request, (results, status) => {
        setLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          // Processar os resultados para adicionar a distância estimada
          const processedResults = results.map((place) => {
            // Calcular distância em linha reta apenas para estimativa (Haversine formula)
            const R = 6371; // Raio da Terra em km
            const dLat = (place.geometry.location.lat() - location.lat) * (Math.PI / 180);
            const dLon = (place.geometry.location.lng() - location.lng) * (Math.PI / 180);
            const a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(location.lat * (Math.PI/180)) * Math.cos(place.geometry.location.lat() * (Math.PI/180)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            const distance = R * c;

            return {
              id: place.place_id,
              name: place.name,
              address: place.vicinity,
              rating: place.rating || 0,
              user_ratings_total: place.user_ratings_total || 0,
              distance: distance.toFixed(1),
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              isOpen: place.opening_hours?.isOpen() || false,
            };
          });
          
          // Ordenar por distância
          processedResults.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
          setPlaces(processedResults);
        } else {
          setError(new Error(`Erro na busca: ${status}`));
          setPlaces([]);
        }
      });
    },
    [isLoaded, loadError]
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
