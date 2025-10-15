# Healthcare Analytics Platform Setup Guide

## Quick Start

1. **Open the application**: Open `index.html` in your browser
2. **Navigate through the prototype**:
   - Select an indication (e.g., Ovarian Cancer HER2+)
   - Choose an analysis type (e.g., Market Access Analysis)
   - Explore the dashboard with interactive charts and insights

## AI Chat Setup (Optional)

The chat functionality works with mock responses by default. To enable AI-powered responses using Google's Gemini Pro:

### Step 1: Get a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### Step 2: Configure the API Key

1. Open `gemini-config.js` in a text editor
2. Find this line:
   ```javascript
   // apiKey: 'YOUR_GEMINI_API_KEY_HERE', // Uncomment and add your API key
   ```
3. Replace it with:
   ```javascript
   apiKey: 'your-actual-api-key-here', // Replace with your real API key
   ```

### Step 3: Test the Integration

1. Refresh your browser
2. Navigate to any analysis dashboard
3. Try asking questions in the chat like:
   - "What are the main payer coverage patterns?"
   - "Explain the treatment pathway for this indication"
   - "What are the key market access barriers?"

## Features Overview

### 🏠 Landing Page (`index.html`)
- Welcome interface with indication selection
- Responsive design with healthcare branding
- Navigation to analysis selection

### 📊 Analysis Selection (`indication-analysis.html`)
- 6 analysis types to choose from:
  - Market Access Analysis
  - Referral Pattern Analysis
  - Care Gap Analysis
  - Treatment Pathway Analysis
  - Market Structure Analysis
  - Persistency Analysis
- Improved design with hover effects and icons

### 📈 Interactive Dashboard (`dashboard.html`)
- Real-time data visualizations using Chart.js
- Collapsible chat panel with AI assistant
- Collapsible insights panel with key findings
- Responsive layout with multiple chart types
- Mock data generation for realistic demos

### 🤖 AI Assistant Features
- Context-aware responses based on current analysis
- Healthcare-specific prompts and terminology
- Fallback to smart mock responses when API is not configured
- Support for complex healthcare analytics questions

## File Structure

```
healthcare-analytics-platform/
├── index.html              # Landing page
├── indication-analysis.html # Analysis type selection
├── dashboard.html           # Main analytics dashboard
├── gemini-config.js        # AI configuration (requires setup)
├── SETUP.md               # This setup guide
├── README.md              # Project documentation
└── .gitignore             # Git ignore rules
```

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS (CDN)
- **Charts**: Chart.js v4
- **Icons**: Font Awesome 6.4.0
- **AI**: Google Gemini Pro API (optional)

## Local Development

### Option 1: Direct Browser Opening
Simply double-click `index.html` to open in your browser.

### Option 2: Local Server (Recommended)
```bash
# Using Python (if installed)
python3 -m http.server 8000

# Using Node.js (if http-server is installed)
npx http-server

# Using Live Server in VS Code
# Install Live Server extension and right-click index.html -> "Open with Live Server"
```

Then navigate to `http://localhost:8000`

## Deployment

The application is deployment-ready for static hosting platforms:

- **Vercel**: Connect GitHub repo for automatic deployments
- **Netlify**: Drag and drop the project folder
- **GitHub Pages**: Enable in repository settings
- **AWS S3**: Upload files for static website hosting

## Customization

### Adding New Indications
1. Update indication cards in `index.html`
2. Add navigation logic in the `navigateToIndication()` function
3. Update session storage handling in subsequent pages

### Adding New Analysis Types
1. Modify the analysis cards in `indication-analysis.html`
2. Update the `navigateToAnalysis()` function
3. Add corresponding mock data in `dashboard.html`

### Modifying Charts
Charts are created using Chart.js in the `initializeCharts()` function in `dashboard.html`. You can:
- Change chart types (pie, bar, line, doughnut)
- Update data sets and labels
- Customize colors and styling
- Add new chart containers

### Enhancing AI Responses
1. Modify prompts in `gemini-config.js`
2. Update the `HEALTHCARE_CONTEXT` object for different analysis types
3. Enhance the mock response logic for offline functionality

## Troubleshooting

### Chat Not Working
- Check browser console for errors
- Ensure `gemini-config.js` is loaded properly
- Verify API key configuration if using Gemini Pro

### Charts Not Displaying
- Ensure Chart.js is loaded from CDN
- Check browser console for JavaScript errors
- Verify canvas elements exist in the DOM

### Styling Issues
- Ensure Tailwind CSS is loaded from CDN
- Check for conflicting CSS rules
- Verify responsive classes are applied correctly

## Support

For issues or questions:
1. Check the browser console for error messages
2. Ensure all CDN resources are loading properly
3. Test with different browsers for compatibility
4. Review the setup steps for proper configuration

## Next Steps

Once you have the basic prototype running, consider:
1. Integrating with real healthcare data sources
2. Adding user authentication and personalization
3. Implementing data export functionality
4. Adding more sophisticated AI analysis capabilities
5. Creating additional indication-specific workflows