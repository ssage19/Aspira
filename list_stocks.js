// Temporary script to list all stocks
import fs from 'fs';

// Read the stock market stocks
const investmentsFile = fs.readFileSync('./client/src/lib/data/investments.ts', 'utf8');
const sp500File = fs.readFileSync('./client/src/lib/data/sp500Stocks.ts', 'utf8');

// Extract base stocks
console.log('=== BASE STOCK MARKET ===\n');
const stockMarketRegex = /export const stockMarket: Stock\[\] = \[([\s\S]*?)\];/;
const stockMarketMatch = investmentsFile.match(stockMarketRegex);

if (stockMarketMatch && stockMarketMatch[1]) {
  const stockEntries = stockMarketMatch[1].match(/{\s*id:[^}]*}/g);
  
  if (stockEntries) {
    stockEntries.forEach(entry => {
      const idMatch = entry.match(/id:\s*['"]([^'"]*)['"]/);
      const nameMatch = entry.match(/name:\s*['"]([^'"]*)['"]/);
      const symbolMatch = entry.match(/symbol:\s*['"]([^'"]*)['"]/);
      const sectorMatch = entry.match(/sector:\s*['"]([^'"]*)['"]/);
      
      if (idMatch && nameMatch && symbolMatch && sectorMatch) {
        console.log(`${nameMatch[1]} (${symbolMatch[1]}) - Sector: ${sectorMatch[1]}`);
      }
    });
  }
}

// Extract S&P 500 stocks
console.log('\n=== EXPANDED STOCK MARKET (S&P 500) ===\n');

// Technology stocks
console.log('\n-- TECHNOLOGY SECTOR --\n');
extractStocksByPattern(sp500File, 'technologyStocks');

// Finance stocks 
console.log('\n-- FINANCE SECTOR --\n');
extractStocksByPattern(sp500File, 'financeStocks');

// Healthcare stocks
console.log('\n-- HEALTHCARE SECTOR --\n');
extractStocksByPattern(sp500File, 'healthcareStocks');

// Energy stocks
console.log('\n-- ENERGY SECTOR --\n');
extractStocksByPattern(sp500File, 'energyStocks');

// Consumer stocks
console.log('\n-- CONSUMER SECTOR --\n');
extractStocksByPattern(sp500File, 'consumerStocks');

// Industrial stocks
console.log('\n-- INDUSTRIAL SECTOR --\n');
extractStocksByPattern(sp500File, 'industrialStocks');

// Communication stocks
console.log('\n-- COMMUNICATION SECTOR --\n');
extractStocksByPattern(sp500File, 'communicationStocks');

function extractStocksByPattern(fileContent, sectorVariable) {
  const sectorRegex = new RegExp(`const ${sectorVariable}.*?\\[([\\s\\S]*?)\\];`, 'g');
  const sectorMatch = sectorRegex.exec(fileContent);
  
  if (sectorMatch && sectorMatch[1]) {
    const createStockCalls = sectorMatch[1].match(/createStock\([^)]*\)/g);
    
    if (createStockCalls) {
      createStockCalls.forEach(call => {
        // Extract the parameters from the createStock call
        // Format: createStock('id', 'name', 'symbol', 'sector', price, 'volatility', 'description')
        const params = call.match(/createStock\(\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*([^,]+),\s*'([^']+)',/);
        
        if (params) {
          const [_, id, name, symbol, sector, price, volatility] = params;
          console.log(`${name} (${symbol}) - Sector: ${sector}, Volatility: ${volatility}, Base Price: ${price}`);
        }
      });
    }
  }
}