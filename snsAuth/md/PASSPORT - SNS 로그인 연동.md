# PASSPORT - SNS 로그인 연동



## app.js

  

**코드**  

```javascript
const flash = require('connect-flash');
const passport = require('passport');            // passport 모듈 임포트
require('dotenv').config();

const pageRouter = require('./routes/page');
const {Sequelize} = require('./models');
const passportConfig = require('./passport');    // ./passport/index.js 임포트 (함수 : fn(passport)로 작성했다.)

const app = express();
sequelize.sync();
passportConfig(passport);
...
app.use(
    session(
        {
            resave: true,
            saveUninitialized: false,
            secret: process.env.COOKIE_SECRET,
            cookie: {
                httpOnly: true,
                secure: false
            }
        }
);

...
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
...
```



```javascript
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const passportConfig = require('./passport');
// ...
app.use('/', pageRouter);
app.use('/auth', authRouter);
```

  

## ./passport/index.js

> 역할
>
> app.js에서 passport객체를 얻어와서

> - serializeUser(fn)
> - deserializeUser(fn)
> - local(passport)  , kakao(passport)  
  : Strategy 함수에 passport 객체를 넘겨주어 동작을 수행하도록 한다. 이때 localStrategy, kakaoStrategy순으로 수행하게 된다.

> 를 수행하게 된다.  



```javascript
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const {User} = require('../models');

module.exports = (passport) => {
    passport.serializeUser((user, done) => {    // passport 모듈의 serializeUser api 호출
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {    // passport 모듈의 deserializeUser api 호출
        User.find(where: {id})
            .then(user => done(null, user))
            .catch(err => done(err));
    });

    local(passport);    // ./localStrategy 내에서 passport.use(...)를 호출하도록 구성되어 있다.
    kakao(passport);
};
```


## localStrategy.js

>Passport 객체를 인자로 받는 함수를 모듈로 등록한다.  
>Passport 객체를 받아서 처리를 수행한다.  

passport는 두개의 인자를 취한다.  
첫번째 인자는 json 객체이다.  

- json 객체 내의 usernameField, passwordField에는 각각에 해당하는 req.body의 **속성명(변수값이 아니다. 주의)** 을 적어주면 된다.  

- 여기서는 req.body.email, req.body.password에 비밀번호가 있으므로 email과 password라는 문자열을 각각 넣어주었다.  



두번째 인자는 실제 전략을 실행하는 함수이다.  

- 보통 async 함수를 전달해준다.  
- 첫번째 인자로 넣었던 json객체에 있던 email, password는 async 함수의 첫번째, 두번째 매개변수가 된다.  
- 세번째 매개변수인 done 함수는 passport.athenticate의 callback함수이다.  
  

done 함수는  

- 첫번째 인자를 사용하는 경우는 서버쪽에서 에러가 발생했을때이다.
- 두번째 인자를 사용하는 경우는 비밀번호가 일치했을때 넘겨주는 사용자 정보이다.
- 세번쨰 인자를 사용하는 경우는 로그인 처리 과정에서 비밀번호가 일치하지 않거나, 존재하지 않는 회원일때 같은 사용자정의 에러가 발생했을때 이다.

```javascript
const LocalStorategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const {User} = require('../medels');

module.exports = (passport) => {
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'passord',
            }, 
            async (email, password, done)=>{
                try{
                    const exUser = await User.find({where : {email}});

                    if(exUser){
                        const result = await bcrypt.compare(password, exUser.password);
                        
                        if(result){
                            done(null, exUser);
                        }
                        else{
                            done(null, false, {message: '비밀번호가 일치하지 않습니다'}); 
                        }
                    }
                    else{
                        done(null, false, {message: '가입되지 않은 회원입니다.'});
                    }
                }
                catch(error){
                    console.error(error);
                    done(error);
                }
            }
        )
    );
};
```



## kakaoStrategy.js

Strategy를 passport-kakao 로부터 불러온다.  

```javascript
const KakaoStrategy = require('passport-kakao').Strategy;
const {User} = require('../models');

module.exports = (passport) => {
    passport.use(
        new KakaoStrategy(
            ClientID    : process.env.KAKAO_ID,
            callbackURL : '/auth/kakao/callback', 
        ),
        async (accessToken, refreshToken, profile, done) => {
            try {
                const exUser = await User.find({where : {snsId: profile..id, provider: 'kakao'}});
                if(exUser){
                    done(null, exUser);
                }
                else{
                    const newUser = await User.create(
                        {
                            email: profile._json && profile._json.kaccount_email,
                            nick: profile.displayName,
                            snsId: profile.id,
                            provider: 'kakao'
                        }
                    );

                    done(null, newUser);
                }
            }
            catch (error) {
                console.error(error);
                done(error);
            }
        }
    );
};
```


## auth.js - passport.authenticate(...); (./routes/auth.js)

>  kakaoStrategy에서 요청하는 
>
>  - /kakao/callback
>  - /kakao
>
>  에 대한 처리를 수행한다.
>
>  이때 passport 객체를 이용해 passport.authenticate('kakao');
>
>  와 같이 수행한다. passport-kakao가 아닌 passport모듈을 사용한다는 점에 유의하자.



```javascript
const passport = require('passport');
...

const router = express.Router();
...

router.get('/kakao', passport.authenticate('kakao'));

router.get(
    '/kakao/callback' , 
    passport.authenticate(
        'kakao',
        {
            failureRedirect: '/',
        }),
    (req, res) => {
        res.redirect('/');
    }
);

module.exports = router;
```









