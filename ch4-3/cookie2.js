const http = require('http');
const url = require('url');
const qs = require('querystring');
const fs = require('fs').promises;

const parseCookies = (cookie = '') => 
    cookie.split(';')
    .map(str => str.split('='))
    .reduce((accm, [k, v]) => {
        accm[k.trim()] = decodeURIComponent(v);
        return accm;
    }, {});    

const session = {};

const createServerCallback = async (req, res) => {

    const cookies = parseCookies(req.headers.cookie);

    if(req.url.startsWith('/login')) {
        const { query } = url.parse(req.url);
        const { name } = qs.parse(query);
        const expires = new Date();

        expires.setMinutes(expires.getMinutes() + 5);
        const uniqueInt = Date.now();
        
        session[uniqueInt] = {
            name,
            expires
        };

        console.log(session);
        
        res.writeHead(302, 
            {
                'Location': '/',
                'Set-Cookie': `session=${uniqueInt}; Max-age=10; HttpOnly; Path=/`
            }
        );
        res.end();
    }

    else if(cookies.session && session[cookies.session].expires > new Date()) {
        res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end(`${session[cookies.session].name}님 안녕하세요`);
    }
    else {
        try {
            const data = await fs.readFile('./cookie2.html');
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(data);
        } catch(err) {
            res.writeHead(500, {'Content-Type' : 'text/plain; charset=utf-8'});
            res.end(err.message);
        }
    }
};

http.createServer(createServerCallback)
    .listen(8080, () => {
        console.log('8080번 포트에서 서버 실행');
    });



