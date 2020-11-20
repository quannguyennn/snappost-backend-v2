import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';

export let options = {
    vus: 1, // 1 user looping for 1 minute
    duration: '10s',

    thresholds: {
        http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    },
};

const BASE_URL = 'http://localhost:4001/graphql';
const USERNAME = 'user01';
const PASSWORD = '123456';

const loginMutation = `
    mutation login {
        login(username: "${USERNAME}", password: "${PASSWORD}") {
            accessToken
            user {
                id
                fullName
                username
                age
            }
        }
}`;

let meQuery = `
query me {
    me {
      id
      fullName
      username
      age
    }
  }`;

let headers = {
    'Content-Type': 'application/json',
};

export default () => {
    let loginRes = http.post(
        BASE_URL,
        JSON.stringify({
            query: loginMutation,
        }),
        { headers },
    );

    check(loginRes, { 'logged in successfully': (resp) => resp.json('data.login.user.username') === 'user01' });

    let authHeaders = {
        headers: {
            Authorization: `Bearer ${loginRes.json('data.login.accessToken')}`,
            'Content-Type': 'application/json',
        },
    };

    let meRes = http.post(
        BASE_URL,
        JSON.stringify({
            query: meQuery,
        }),
        authHeaders,
    );

    check(meRes, { 'retrieved user by token': (resp) => resp.json('data.me.username') === 'user01' });

    sleep(1);
};
