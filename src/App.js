// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import ReactMapGL, { Marker } from "react-map-gl";
// import "./App.css";

// function App() {
//   const [noiseLevel, setNoiseLevel] = useState(50);
//   const [location, setLocation] = useState("");
//   const [manualLocation, setManualLocation] = useState("");
//   const [isManual, setIsManual] = useState(false);
//   const [currentDateTime, setCurrentDateTime] = useState("");
//   const [userLocation, setUserLocation] = useState({ lat: null, lon: null });
//   const [popupData, setPopupData] = useState(null);

//   const [viewport, setViewport] = useState({
//     latitude: 37.78,
//     longitude: -122.42,
//     zoom: 12,
//   });

//   const MAPBOX_TOKEN = "your-mapbox-token-here";

//   useEffect(() => {
//     const currentDate = new Date();
//     setCurrentDateTime(currentDate.toLocaleString());
//   }, []);

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setUserLocation({
//             lat: position.coords.latitude,
//             lon: position.coords.longitude,
//           });
//           setViewport({
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude,
//             zoom: 12,
//           });
//         },
//         (error) => {
//           console.error("Error getting location", error);
//           alert("Could not get your location. Please enter it manually.");
//         }
//       );
//     } else {
//       alert("Geolocation is not supported by this browser.");
//     }
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const finalLocation = isManual ? manualLocation : `${userLocation.lat}, ${userLocation.lon}`;
//     const data = {
//       noise_level: noiseLevel,
//       location: finalLocation,
//       date_time: currentDateTime,
//     };

//     try {
//       await axios.post("http://localhost:5000/report", data);
//       setPopupData(data);
//       alert("Data submitted successfully!");
//     } catch (error) {
//       console.error("Error submitting data:", error);
//       alert("There was an error submitting the data.");
//     }
//   };

//   return (
//     <div className="App">
//       <div className="header">
//         <h1>Welcome to NoiseNab</h1>
//         <p>Track and reduce noise pollution in urban areas.</p>
//       </div>

//       <form onSubmit={handleSubmit} className="form-container">
//         <div className="slider-container">
//           <label>Noise Level (dB):</label>
//           <div className="slider-wrapper">
//             <input
//               type="range"
//               min="0"
//               max="100"
//               value={noiseLevel}
//               onChange={(e) => setNoiseLevel(e.target.value)}
//             />
//             <div className="slider-labels">
//               <span>0 dB</span>
             
              
//             </div>
//           </div>
//           <span>{noiseLevel} dB</span>
//         </div>

//         <div className="location-container">
//           <label>Report location manually</label>
//           <input
//             type="checkbox"
//             checked={isManual}
//             onChange={() => setIsManual(!isManual)}
//           />
//           {!isManual ? (
//             <p>Your current location: {userLocation.lat}, {userLocation.lon}</p>
//           ) : (
//             <input
//               type="text"
//               placeholder="Enter location manually"
//               value={manualLocation}
//               onChange={(e) => setManualLocation(e.target.value)}
//             />
//           )}
//         </div>

//         <div className="current-datetime">
//           <p><strong>Current Date and Time:</strong> {currentDateTime}</p>
//         </div>

//         <button type="submit" className="submit-button">
//           Submit Report
//         </button>
//       </form>

//       <ReactMapGL
//         {...viewport}
//         width="100%"
//         height="400px"
//         mapboxApiAccessToken={MAPBOX_TOKEN}
//         onViewportChange={(nextViewport) => setViewport(nextViewport)}
//       >
//         {userLocation.lat && userLocation.lon && (
//           <Marker latitude={userLocation.lat} longitude={userLocation.lon}>
//             <div className="marker">You</div>
//           </Marker>
//         )}
//       </ReactMapGL>

//       {popupData && (
//         <div className="popup">
//           <h3>Report Submitted</h3>
//           <p><strong>Noise Level:</strong> {popupData.noise_level} dB</p>
//           <p><strong>Location:</strong> {popupData.location}</p>
//           <p><strong>Date and Time:</strong> {popupData.date_time}</p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Volume2, MapPin, Check, XCircle, Info, AlertTriangle } from "lucide-react";
import "./App.css";

// Noise level reference data
const noiseLevelReference = [
  { level: 10, description: "Breathing, Rustling Leaves", color: "#e0f7fa" },
  { level: 20, description: "Whisper, Quiet Library", color: "#b2ebf2" },
  { level: 30, description: "Soft Conversation", color: "#80deea" },
  { level: 40, description: "Quiet Office", color: "#4dd0e1" },
  { level: 50, description: "Moderate Rainfall", color: "#26c6da" },
  { level: 60, description: "Normal Conversation", color: "#00bcd4" },
  { level: 70, description: "Vacuum Cleaner, Busy Traffic", color: "#00acc1" },
  { level: 80, description: "Alarm Clock, Factory Machinery", color: "#0097a7" },
  { level: 90, description: "Motorcycle, Lawnmower", color: "#00838f" },
  { level: 100, description: "Jackhammer, Loud Concert", color: "#006064" }
];

// Component to update the map center when coordinates change
function SetViewOnChange({ coords }) {
  const map = useMap();
  map.setView(coords, map.getZoom());
  return null;
}

function App() {
  const [noiseLevel, setNoiseLevel] = useState(50);
  const [manualLocation, setManualLocation] = useState("");
  const [isManual, setIsManual] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [userLocation, setUserLocation] = useState({ lat: 51.505, lng: -0.09 }); // Default to London
  const [submissionStatus, setSubmissionStatus] = useState(null); // 'success', 'error', or null
  const [statusMessage, setStatusMessage] = useState("");
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [popupInfo, setPopupInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [mapReady, setMapReady] = useState(false);

  // Get current noise description and color
  const getCurrentNoiseInfo = () => {
    const nearest = noiseLevelReference.reduce((prev, curr) => {
      return Math.abs(curr.level - noiseLevel) < Math.abs(prev.level - noiseLevel) ? curr : prev;
    });
    return nearest;
  };

  const noiseInfo = getCurrentNoiseInfo();

  useEffect(() => {
    const updateDateTime = () => {
      const currentDate = new Date();
      setCurrentDateTime(currentDate.toLocaleString());
    };
    
    updateDateTime();
    // Update time every minute
    const interval = setInterval(updateDateTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setMapReady(true);
        },
        (error) => {
          console.error("Error getting location", error);
          setSubmissionStatus("error");
          setStatusMessage("Could not get your location. Please enter it manually.");
          setIsManual(true);
          setMapReady(true);
        }
      );
    } else {
      setSubmissionStatus("error");
      setStatusMessage("Geolocation is not supported by this browser.");
      setIsManual(true);
      setMapReady(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isManual && !manualLocation.trim()) {
      setSubmissionStatus("error");
      setStatusMessage("Please enter your location manually.");
      return;
    }
    
    if (!isManual && (!userLocation.lat || !userLocation.lng)) {
      setSubmissionStatus("error");
      setStatusMessage("Location data is not available. Please try again or enter location manually.");
      return;
    }
    
    const finalLocation = isManual ? manualLocation : `${userLocation.lat}, ${userLocation.lng}`;
    const data = {
      noise_level: noiseLevel,
      location: finalLocation,
      date_time: currentDateTime,
      notes: notes
    };

    setIsSubmitting(true);
    
    try {
      await axios.post("http://localhost:5000/report", data);
      setSubmissionStatus("success");
      setStatusMessage("Thank you for your contribution to mapping urban noise!");
      setPopupInfo({
        ...data,
        description: noiseInfo.description
      });
      setNotes(""); // Clear notes after successful submission
    } catch (error) {
      console.error("Error submitting data:", error);
      setSubmissionStatus("error");
      setStatusMessage("There was an error submitting your report. Please try again later.");
    } finally {
      setIsSubmitting(false);
      // Auto-hide the status after 5 seconds
      setTimeout(() => {
        setSubmissionStatus(null);
      }, 5000);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header" style={{ backgroundColor: noiseInfo.color }}>
        <div className="logo-container">
          <Volume2 size={36} />
          <h1>NoiseNab</h1>
        </div>
        <p className="tagline">Help create quieter, healthier cities</p>
      </header>

      <main className="main-content">
        <section className="map-section">
          <h2>Current Location</h2>
          <div className="map-container">
            {mapReady && (
              <MapContainer 
                center={[userLocation.lat, userLocation.lng]} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <SetViewOnChange coords={[userLocation.lat, userLocation.lng]} />
                <Marker position={[userLocation.lat, userLocation.lng]}>
                  {popupInfo && (
                    <Popup>
                      <div className="map-popup">
                        <h3>Noise Report</h3>
                        <p><strong>{popupInfo.noise_level} dB</strong> - {popupInfo.description}</p>
                        <p className="popup-datetime">{popupInfo.date_time}</p>
                        {popupInfo.notes && <p className="popup-notes">{popupInfo.notes}</p>}
                      </div>
                    </Popup>
                  )}
                </Marker>
              </MapContainer>
            )}
          </div>
        </section>

        <section className="form-section">
          <h2>Report Noise Level</h2>
          
          <form onSubmit={handleSubmit} className="noise-form">
            <div className="noise-slider-container">
              <div className="noise-value" style={{ color: noiseInfo.color }}>
                <span className="noise-number">{noiseLevel}</span>
                <span className="noise-unit">dB</span>
              </div>
              
              <div className="slider-wrapper">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={noiseLevel}
                  onChange={(e) => setNoiseLevel(e.target.value)}
                  className="noise-slider"
                  style={{ 
                    background: `linear-gradient(to right, ${noiseInfo.color} 0%, ${noiseInfo.color} ${noiseLevel}%, #e0e0e0 ${noiseLevel}%, #e0e0e0 100%)` 
                  }}
                />
                <div className="noise-description">
                  <p>{noiseInfo.description}</p>
                  <button 
                    type="button" 
                    className="info-button"
                    onClick={() => setShowInfoPopup(!showInfoPopup)}
                  >
                    <Info size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="location-container">
              <div className="location-header">
                <h3>Location</h3>
                <label className="manual-toggle">
                  <input
                    type="checkbox"
                    checked={isManual}
                    onChange={() => setIsManual(!isManual)}
                  />
                  <span>Enter manually</span>
                </label>
              </div>
              
              {!isManual ? (
                userLocation.lat && userLocation.lng ? (
                  <div className="current-location">
                    <MapPin size={16} />
                    <span>{userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</span>
                  </div>
                ) : (
                  <div className="location-loading">
                    <AlertTriangle size={16} />
                    <span>Waiting for location...</span>
                  </div>
                )
              ) : (
                <input
                  type="text"
                  placeholder="Enter address or coordinates"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  className="manual-location-input"
                />
              )}
            </div>

            <div className="notes-container">
              <h3>Additional Notes</h3>
              <textarea
                placeholder="Describe the noise source (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="notes-input"
                maxLength={200}
              />
              <div className="char-count">{notes.length}/200</div>
            </div>

            <div className="timestamp-container">
              <h3>Date and Time</h3>
              <div className="timestamp">{currentDateTime}</div>
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
              style={{ 
                backgroundColor: noiseInfo.color,
                opacity: isSubmitting ? 0.7 : 1 
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit Noise Report"}
            </button>
          </form>
        </section>
      </main>

      {submissionStatus && (
        <div className={`status-popup ${submissionStatus}`}>
          {submissionStatus === "success" ? (
            <Check size={20} />
          ) : (
            <XCircle size={20} />
          )}
          <p>{statusMessage}</p>
          <button onClick={() => setSubmissionStatus(null)}>×</button>
        </div>
      )}

      {showInfoPopup && (
        <div className="info-popup">
          <div className="info-popup-content">
            <h3>Understanding Noise Levels</h3>
            <button className="close-button" onClick={() => setShowInfoPopup(false)}>×</button>
            
            <div className="noise-scale">
              {noiseLevelReference.map((item) => (
                <div className="noise-scale-item" key={item.level}>
                  <div className="noise-scale-bar" style={{ backgroundColor: item.color }}></div>
                  <div className="noise-scale-details">
                    <span className="noise-scale-level">{item.level} dB</span>
                    <span className="noise-scale-desc">{item.description}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="noise-health-info">
              <h4>Health Impacts</h4>
              <p>Prolonged exposure to noise levels above 70dB can lead to hearing damage over time.</p>
              <p>Noise above 85dB requires hearing protection for workplace safety.</p>
              <p>Even lower levels (50-60dB) can cause stress, sleep disturbance, and decreased productivity.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;