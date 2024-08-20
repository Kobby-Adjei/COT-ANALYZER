const axios = require('axios');
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: 'your-openai-api-key-here'
});

// Function to fetch COT report data
async function fetchCOTReport(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching COT report:', error);
    return null;
  }
}

// Function to process COT report data
function processCOTData(data) {
  // This is a simplified example. You'd need to adjust this based on the actual structure of your COT report
  const summary = {
    longPositions: 0,
    shortPositions: 0,
    totalPositions: 0
  };

  // Process the data
  data.forEach(entry => {
    summary.longPositions += entry.longPositions;
    summary.shortPositions += entry.shortPositions;
  });

  summary.totalPositions = summary.longPositions + summary.shortPositions;

  // Calculate percentages
  summary.longPercentage = (summary.longPositions / summary.totalPositions) * 100;
  summary.shortPercentage = (summary.shortPositions / summary.totalPositions) * 100;

  return summary;
}

// Function to generate a human-readable summary using OpenAI
async function generateSummary(data) {
  const prompt = `
    Summarize the following Commitment of Traders (COT) report data in a clear and concise manner:
    
    Long Positions: ${data.longPositions}
    Short Positions: ${data.shortPositions}
    Total Positions: ${data.totalPositions}
    Long Percentage: ${data.longPercentage.toFixed(2)}%
    Short Percentage: ${data.shortPercentage.toFixed(2)}%
    
    Please provide insights on market sentiment and any notable trends.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Unable to generate summary.';
  }
}

// Main function to run the AI
async function runCOTAI(reportUrl) {
  console.log('Fetching COT report...');
  const rawData = await fetchCOTReport(reportUrl);
  
  if (!rawData) {
    console.log('Failed to fetch COT report. Exiting.');
    return;
  }

  console.log('Processing COT data...');
  const processedData = processCOTData(rawData);

  console.log('Generating summary...');
  const summary = await generateSummary(processedData);

  console.log('\nCOT Report Summary:');
  console.log(summary);
}

// Example usage
const cotReportUrl = 'https://example.com/cot-report.json';
runCOTAI(cotReportUrl);
