/**
 * Load test for the search endpoint.
 * Run with: npx ts-node tests/load/search-load.ts
 *
 * Requires the server to be running on http://localhost:3001
 */
import autocannon from 'autocannon';

const instance = autocannon({
  url: 'http://localhost:3001/api/v1/search?q=doliprane&lat=35.76&lng=-5.83',
  connections: 10,
  duration: 10,
  headers: { 'Content-Type': 'application/json' },
  title: 'PharmaFind Search Endpoint Load Test',
}, (err, results) => {
  if (err) { console.error(err); process.exit(1); }
  console.log('\n--- Load Test Results ---');
  console.log(`Requests/sec avg: ${results.requests.average}`);
  console.log(`Latency avg: ${results.latency.average}ms`);
  console.log(`Latency p99: ${results.latency.p99}ms`);
  console.log(`Errors: ${results.errors}`);
  console.log(`Timeouts: ${results.timeouts}`);
  console.log('\nTest complete ✓');
});

autocannon.track(instance, { renderProgressBar: true });
