document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const swmmFileInput = document.getElementById('swmmFileInput');
    const runButton = document.getElementById('runButton');
    const statusDiv = document.getElementById('status');
    const resultsDiv = document.getElementById('results');
    const mapDiv = document.getElementById('map');

    let uploadedFileName = null;
    let map = null;
    let mapLayer = null;

    // Initialize the map
    function initMap() {
        if (map) return;
        map = L.map(mapDiv).setView([40, -95], 4); // Default view
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }

    function logStatus(message, isError = false) {
        const p = document.createElement('p');
        p.textContent = message;
        if (isError) {
            p.style.color = 'red';
        }
        statusDiv.innerHTML = ''; // Clear previous status
        statusDiv.appendChild(p);
    }

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = swmmFileInput.files[0];
        if (!file) {
            logStatus('Please select a file to upload.', true);
            return;
        }

        const formData = new FormData();
        formData.append('swmmFile', file);

        logStatus('Uploading file...');
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                logStatus(`File uploaded successfully: ${result.file}`);
                uploadedFileName = result.file;
                runButton.disabled = false;
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error) {
            logStatus(`Upload error: ${error.message}`, true);
        }
    });

    runButton.addEventListener('click', async () => {
        if (!uploadedFileName) {
            logStatus('No file uploaded or upload was unsuccessful.', true);
            return;
        }

        logStatus(`Running simulation for ${uploadedFileName}...`);
        runButton.disabled = true;

        try {
            const response = await fetch('/api/run_swmm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ inputFile: uploadedFileName }),
            });

            const result = await response.json();

            if (response.ok) {
                logStatus('Simulation finished! Fetching report...');
                resultsDiv.innerHTML = `<h4>Simulation Log</h4><pre>${result.log}</pre>`;

                // Fetch and display the report file
                try {
                    const reportResponse = await fetch(`/api/results/${result.reportFile}`);
                    if (reportResponse.ok) {
                        const reportText = await reportResponse.text();
                        resultsDiv.innerHTML += `<h4>Report File (${result.reportFile})</h4><pre>${reportText}</pre>`;
                        logStatus('Simulation and report retrieval complete.');
                    } else {
                        throw new Error(`Failed to fetch report file: ${reportResponse.statusText}`);
                    }
                } catch (reportError) {
                     logStatus(`Error fetching report: ${reportError.message}`, true);
                }

                // Fetch and display map data
                logStatus('Fetching map data...');
                try {
                    const mapDataResponse = await fetch(`/api/mapdata/${uploadedFileName}`);
                    if (mapDataResponse.ok) {
                        const geojsonData = await mapDataResponse.json();
                        if (mapLayer) {
                            map.removeLayer(mapLayer);
                        }
                        mapLayer = L.geoJSON(geojsonData, {
                            onEachFeature: function (feature, layer) {
                                layer.bindPopup(feature.properties.name);
                            }
                        }).addTo(map);
                        if (geojsonData.features.length > 0) {
                            map.fitBounds(mapLayer.getBounds());
                        }
                        logStatus('Map data loaded.');
                    } else {
                         throw new Error(`Failed to fetch map data: ${mapDataResponse.statusText}`);
                    }
                } catch (mapError) {
                    logStatus(`Error fetching map data: ${mapError.message}`, true);
                }

            } else {
                throw new Error(result.details || result.error || 'Simulation failed');
            }
        } catch (error) {
            logStatus(`Simulation error: ${error.message}`, true);
        } finally {
            runButton.disabled = false;
        }
    });

    initMap();
});
