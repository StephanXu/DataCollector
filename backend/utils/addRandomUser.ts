import request from 'request'

interface RegisterRequest {
    name: string;
    username: string;
    password: string;
    avatar: string;
    birthday: Date;
    telephone: string;
};

request('https://randomuser.me/api/', { json: true }, (err, res, body) => {
    let user = body.results[0];
    request({
        url: 'http://127.0.0.1:3000/api/user',
        method: 'post',
        json: true,
        body: <RegisterRequest>{
            name: `${user.name.first} ${user.name.last}`,
            username: user.email,
            password: user.login.password,
            telephone: user.phone,
            avatar: user.picture.large,
            birthday: user.dob.date
        }
    }, () => {
        console.log(`Add user: ${user.email}\t password:${user.login.password}`)
    });
});