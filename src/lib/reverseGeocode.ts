export const reverseGeocode = async (lat: number, lng: number) => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            {
                headers: {
                    "User-Agent": "TripPlanner/1.0 (learning-project)",
                },
            }
        );

        const data = await res.json();

        // Check if data has display_name. The API structure might vary slightly but display_name is standard.
        // We use display_name directly if available.
        return (
            data.display_name ||
            `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        );
    } catch (err) {
        console.error("Reverse geocode failed", err);
        // Fallback to coordinates on error
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
};
