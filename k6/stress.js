import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
    stages: [
        { duration: '2m', target: 100 }, // below normal load
        { duration: '5m', target: 100 },
        { duration: '2m', target: 200 }, // normal load
        { duration: '5m', target: 200 },
        { duration: '2m', target: 300 }, // around the breaking point
        { duration: '5m', target: 300 },
        { duration: '2m', target: 400 }, // beyond the breaking point
        { duration: '5m', target: 400 },
        { duration: '10m', target: 0 }, // scale down. Recovery stage.
    ],
};

let blogQuery = `
  query blogs {
    blogs {
      items {
        id
        title
      }
    }
  }`;

let userQuery = `
  query users {
    users {
        items {
          id
          username
          fullName
          age
          isActive
        }
      }
  }`;

let meQuery = `
query me {
    me {
      id
      fullName
      age
    }
  }
  `;

let blogUserQuery = `
  query users {
    blogs {
        items {
          id
          title
        }
      }
      users {
        items {
          id
          username
          fullName
          age
          isActive
        }
      }
  }`;

const accessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MDk3NDQzNzA1OTA0NjkzMjQ5IiwidXNlcm5hbWUiOiJ1c2VyMDEiLCJpYXQiOjE1OTI2NjY0NTAsImV4cCI6MTU5NTI1ODQ1MCwiYXVkIjpbImFwcCJdLCJpc3MiOiJ0aGVkdiJ9._4OU2aVZjB7VclTmMKP5SHUZ7V3H6HVktJNXhi_dWTA';
let headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
};

export default () => {
    const BASE_URL = 'http://localhost:4001/graphql'; // make sure this is not production

    let responses = http.batch([
        ['POST', BASE_URL, JSON.stringify({ query: blogQuery }), { tags: { name: 'blogQuery' } }],
        ['POST', BASE_URL, JSON.stringify({ query: userQuery }), { tags: { name: 'userQuery' } }],
        ['POST', BASE_URL, JSON.stringify({ query: blogUserQuery }), { tags: { name: 'blogUserQuery' } }],
        ['POST', BASE_URL, JSON.stringify({ query: meQuery }), { tags: { name: 'meQuery' }, headers }],
    ]);

    sleep(1);
};
