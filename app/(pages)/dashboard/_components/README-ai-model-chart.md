# AI Model Comparison Chart

This component displays AI model usage data over time, showing how many images have been generated with different AI models. It's designed to receive data from an external desktop application via API and display it in a line chart.

## Features

- Displays AI model usage data in a line chart
- Automatically fetches data from the API
- Automatically removes data older than one month
- Supports receiving data from external applications via API
- Visual indicators for data status (real data vs. no data)
- Loading indicators and error handling
- Notification when new data is received
- Development testing controls for easy debugging
- Auto-refreshes data every 30 seconds

## How to Use

### In Your Web Application

The component is already set up to receive and display data. It will:

1. Fetch data from the API endpoint
2. Display the data in a line chart
3. Show status indicators for data source (real data vs. no data)
4. Show a notification when new data is received
5. Automatically refresh data every 30 seconds

### Sending Data from Your Desktop Application

The recommended way to send data from your desktop application is to use the API:

#### API Endpoints

- `GET /api/model-usage` - Fetch all model usage data
- `POST /api/model-usage` - Add new model usage data
- `DELETE /api/model-usage` - Clear all model usage data

#### JavaScript Example

```javascript
// Send data to the API
async function sendModelData(modelName, imageCount) {
  try {
    const response = await fetch('/api/model-usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        modelName,
        imageCount
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to add model data');
    }

    console.log('Data sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending model data:', error);
    throw error;
  }
}

// Example usage
sendModelData('Stable Diffusion', 25)
  .then(result => console.log('Success:', result))
  .catch(error => console.error('Error:', error));
```

#### Python Example

```python
import requests
import json

def send_model_data(model_name, image_count):
    """Send model usage data to the API."""
    try:
        url = 'http://your-website.com/api/model-usage'
        payload = {
            'modelName': model_name,
            'imageCount': image_count
        }

        response = requests.post(
            url,
            data=json.dumps(payload),
            headers={'Content-Type': 'application/json'}
        )

        result = response.json()

        if not result.get('success'):
            raise Exception(result.get('error', 'Failed to add model data'))

        print('Data sent successfully:', result)
        return result
    except Exception as e:
        print('Error sending model data:', str(e))
        raise

# Example usage
try:
    send_model_data('Stable Diffusion', 25)
except Exception as e:
    print('Failed:', str(e))
```

### Alternative Methods (Legacy Support)

The component also supports receiving data through browser methods for backward compatibility:

#### Using the Window Function

```javascript
// In your desktop application (using a WebView or similar)
// Assuming your web app is loaded in a WebView

// JavaScript to execute in the WebView context
const jsCode = `
  if (window.addAIModelData) {
    window.addAIModelData('${modelName}', ${imageCount});
  }
`;

// Execute this JavaScript in your WebView
webView.executeJavaScript(jsCode);
```

#### Using PostMessage

```javascript
// In your desktop application (using a WebView or similar)
// Assuming your web app is loaded in a WebView

// JavaScript to execute in the WebView context
const jsCode = `
  window.postMessage({
    type: 'ai-model-data',
    modelName: '${modelName}',
    imageCount: ${imageCount}
  }, '*');
`;

// Execute this JavaScript in your WebView
webView.executeJavaScript(jsCode);
```

### Data Format

The API expects data in the following format:

```json
{
  "modelName": "Stable Diffusion",
  "imageCount": 25
}
```

- `modelName`: String - The name of the AI model (e.g., "Stable Diffusion", "DALL-E", etc.)
- `imageCount`: Number - The number of images generated with this model

### Data Storage

The data is stored in memory on the server (for development purposes). In a production environment, you would want to store this data in a database. The data structure is:

```javascript
[
  {
    "modelName": "Stable Diffusion",
    "imageCount": 25,
    "timestamp": 1684123456789 // Unix timestamp
  },
  {
    "modelName": "DALL-E",
    "imageCount": 10,
    "timestamp": 1684123456790
  }
]
```

### Automatic Data Cleanup

The API automatically filters out data older than a month each time it's accessed. This ensures that the chart only displays recent data.

## Testing Your Integration

### Using the API Client Example

We've provided an example HTML file at `examples/api-client-example.html` that demonstrates how to use the API. To test your integration:

1. Open your web application in one browser tab
2. Open the API client example in another tab
3. Use the example page to send test data to the API
4. Observe the chart update in real-time

### Development Testing Controls

In development mode, the component displays testing controls at the bottom that allow you to:

- Add test data for different models directly from the component
- Clear all stored data
- Manually refresh the data from the API
- View API endpoint documentation

These controls are only visible in development mode and will not appear in production.

## Visual Indicators

The component includes several visual indicators to help you understand the current state:

- **Loading...** badge: Shown when data is being fetched from the API
- **No Data Available** badge: Shown when there is no data available
- **Using Real Data** badge: Shown when real data is being displayed
- **Error** badge: Shown when there's an error fetching or processing data
- **New Data Received!** notification: Appears briefly when new data is received
- **Last updated** timestamp: Shows when the data was last updated

## Customization

You can customize the component by modifying the following:

- Chart colors: Edit the `getModelColor` function to change the colors used for each model
- Chart height: Change the `h-[300px]` class in the chart container div
- Status indicators: Modify the badges and their styles in the component's JSX
- Testing controls: Add additional testing functionality in the development controls section
- Polling interval: Change the `30000` value in the `setInterval` call to adjust how often the data refreshes
