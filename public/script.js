document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const swmmFileInput = document.getElementById('swmmFileInput');
    const runButton = document.getElementById('runButton');
    const statusDiv = document.getElementById('status');
    const resultsDiv = document.getElementById('results');

    let uploadedFileName = null;

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
                logStatus('Simulation finished!');
                resultsDiv.innerHTML = `<pre>${result.log}</pre>`;
            } else {
                throw new Error(result.details || result.error || 'Simulation failed');
            }
        } catch (error) {
            logStatus(`Simulation error: ${error.message}`, true);
        } finally {
            runButton.disabled = false;
        }
    });
});
