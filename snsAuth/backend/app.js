var createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

const passport = require('passport');
const passportConfig = require('./auth/passport');

// TODO :: 디렉터리 위치 찾을 것.
require('dotenv').config();

const demoRouter = require('./route/demo/demoPage');
const authRouter = require('./route/auth/auth');

/**
 * models 의 index.js 임포트
 *  - index.js에서는 /models에 정의한 각 모델들을 볼러들이고,
 *  - { User: sequelize1 , Post: sequelize2... } 와 같은 형식으로 객체를 만들어낸다.
 */
const {sequelize} = require('../models');

const app = express();
sequelize.sync();

console.log('app.js >>> ', sequelize.User);

passportConfig(passport);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 9999);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// TODO
app.use(express.urlencoded({extended: false}));

// TODO :: 디렉터리 위치 찾을 것.
// app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'snsAuthSecret',
    cookie: {
        httpOnly: true,
        secure: false
    },
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', demoRouter);
app.use('/auth', authRouter);

app.use(
    (req, res, next) => {
        const err = new Error('Not Found');
        err.status = '404';
        next(err);
    }
);

app.use(
    (err, req, res, next) => {
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        res.status(err.status || 500);
        res.render('error');
    }
);

app.listen(app.get('port'), () => {
   console.log(app.get('port'), '번 포트에서 대기중')
});