import http from 'k6/http';
import { sleep } from 'k6';
import { Trend, Counter, Gauge } from 'k6/metrics';

let myTrend = new Trend('waiting_time');
let myCounter = new Counter('my_counter');
let myGauge = new Gauge('my_gauge');

let query = `
  query blogs {
    blogs {
      items {
        id
        title
      }
    }
  }`;
let headers = {
    // Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
};

export const options = {
    vus: 100,
    duration: '10s',
};

export default () => {
    let res = http.post('http://localhost:4001/graphql', JSON.stringify({ query: query }), { headers: headers });
    myTrend.add(res.timings.waiting);
    myGauge.add(res.timings.duration);
};
