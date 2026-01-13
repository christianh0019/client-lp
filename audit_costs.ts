import { LocationCostService } from './src/services/LocationCostService';

async function testCostData() {
    const cities = ['Austin, TX', 'Nashville, TN', 'Seattle, WA', 'Miami, FL'];

    console.log("--- Location Cost Audit ---");
    for (const city of cities) {
        const data = await LocationCostService.getMarketData(city);
        console.log(`\nCity: ${city}`);
        if (data) {
            console.log(`Low: $${data.low}/sqft`);
            console.log(`High: $${data.high}/sqft`);
        } else {
            console.log("No data found.");
        }
    }
}

testCostData();
