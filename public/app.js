const API_BASE = window.location.origin;

window.onload = function() {
    checkServerStatus();
};

async function checkServerStatus() {
    try {
        const response = await fetch(`${API_BASE}/api/health`);
        const data = await response.json();
        
        if (data.status === 'OK') {
            document.getElementById('status').className = 'status-indicator online';
            document.getElementById('status-text').textContent = 'Server Online';
        }
    } catch (error) {
        document.getElementById('status').className = 'status-indicator offline';
        document.getElementById('status-text').textContent = 'Server Offline';
    }
}

async function testEndpoint(endpoint, responseId) {
    const responseElement = document.getElementById(`response-${responseId}`);
    responseElement.style.display = 'block';
    responseElement.innerHTML = 'Loading...';
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        const data = await response.json();
        
        responseElement.innerHTML = `Status: ${response.status}\nResponse:\n${JSON.stringify(data, null, 2)}`;
        responseElement.style.color = response.ok ? '#28a745' : '#dc3545';
        
    } catch (error) {
        responseElement.innerHTML = `Error: ${error.message}`;
        responseElement.style.color = '#dc3545';
    }
}

async function testUserRegistration() {
    const responseElement = document.getElementById('response-register');
    responseElement.style.display = 'block';
    responseElement.innerHTML = 'Loading...';
    
    const userData = {
        name: 'Test User ' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        phone: '+977-9876543210'
    };
    
    try {
        const response = await fetch(`${API_BASE}/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        
        responseElement.innerHTML = `Status: ${response.status}\nRequest:\n${JSON.stringify(userData, null, 2)}\nResponse:\n${JSON.stringify(data, null, 2)}`;
        responseElement.style.color = response.ok ? '#28a745' : '#dc3545';
    } catch (error) {
        responseElement.innerHTML = `Error: ${error.message}`;
        responseElement.style.color = '#dc3545';
    }
}

async function testBookingCreation() {
    const responseElement = document.getElementById('response-booking');
    responseElement.style.display = 'block';
    responseElement.innerHTML = 'Loading...';
    
    const bookingData = {
        hotelId: '1',
        userId: Date.now().toString(),
        checkIn: '2024-02-15',
        checkOut: '2024-02-17',
        guests: 2
    };
    
    try {
        const response = await fetch(`${API_BASE}/api/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        const data = await response.json();
        
        responseElement.innerHTML = `Status: ${response.status}\nRequest:\n${JSON.stringify(bookingData, null, 2)}\nResponse:\n${JSON.stringify(data, null, 2)}`;
        responseElement.style.color = response.ok ? '#28a745' : '#dc3545';
    } catch (error) {
        responseElement.innerHTML = `Error: ${error.message}`;
        responseElement.style.color = '#dc3545';
    }
}