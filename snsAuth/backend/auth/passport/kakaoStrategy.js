const KakaoStrategy = require('passport-kakao').Strategy;
const {User} = require('../../../models');

module.exports = (passport) => {
    passport.use(
        new KakaoStrategy(
            {
                clientID: process.env.KAKAO_ID,
                callbackURL: '/auth/kakao/callback'
            },
            async (accessToken, refreshToken, profile, done)=>{
                try{
                    console.log('kakaoStrategy >>> ', User );

                    const exUser = await User.find(
                        {where: {snsId: profile.id+''}}
                    //    문자열로 넘겨야 한다. user 테이블의 snsId 항목을 STRING으로 했기 때문.
                    //    (카카오에서 넘겨주는 profile.id의 타입은 숫자 타입이다.)
                    //    http://database.sarang.net/?inc=read&aid=7859&criteria=pgsql&subcrit=&id=&limit=20&keyword=unix&page=1
                    );
                    // const exUser = await User.findAll({where: {snsId: profile.id, provider: 'kakao'} });

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
                catch(error){
                    console.error(error);
                    done(error);
                }
            }
        )
    );
};