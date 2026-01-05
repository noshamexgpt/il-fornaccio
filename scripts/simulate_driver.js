// Native fetch is available in Node 18+

// Function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    const deviceId = '123456';
    console.log(`Starting driver simulation for Device ID: ${deviceId}`);

    // Path: From Grand Place to Cathedral
    const path = [
        { lat: 50.8467, lon: 4.3524 },
        { lat: 50.8470, lon: 4.3540 },
        { lat: 50.8472, lon: 4.3560 },
        { lat: 50.8474, lon: 4.3580 },
        { lat: 50.847556, lon: 4.360098 }
    ];

    for (const [index, point] of path.entries()) {
        const url = `http://localhost:3002/api/tracking/traccar?id=${deviceId}&lat=${point.lat}&lon=${point.lon}&timestamp=${Date.now()}`;

        try {
            console.log(`[${index + 1}/${path.length}] Sending update: ${point.lat}, ${point.lon}`);
            const response = await fetch(url);

            if (response.ok) {
                console.log(' -> Success:', await response.text());
            } else {
                console.error(' -> Failed:', response.status, await response.text());
            }
        } catch (error) {
            console.error(' -> Error:', error.message);
        }

        await delay(2000); // Wait 2 seconds between updates
    }
}

main();
