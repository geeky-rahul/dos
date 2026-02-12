import axios from "axios";

export const reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    // Validate query params
    if (!lat || !lng) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    // Call OpenStreetMap Nominatim Reverse Geocoding API
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat: lat,
          lon: lng,
          format: "json",
          addressdetails: 1,
        },
        headers: {
          "User-Agent": "DOS-App/1.0 (Discovery Of Shops)",
        },
      }
    );

    if (response.status !== 200 || !response.data.address) {
      return res.status(404).json({
        message: "Location not found",
      });
    }

    // Extract address from Nominatim response
    const address = response.data.address;
    
    // Get area: prefer suburb, then neighbourhood, then city_district
    const area = address.suburb || address.neighbourhood || address.city_district || "Unknown Area";
    
    // Get city: prefer city, then state_district, then state
    const city = address.city || address.state_district || address.state || "Unknown City";

    console.log("Location extracted:", { area, city });

    // Return the extracted location
    res.status(200).json({
      area: area,
      city: city,
    });
  } catch (error) {
    console.error("Geocoding error:", error.message);
    res.status(500).json({
      message: "Failed to retrieve location information",
    });
  }
};
