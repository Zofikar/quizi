import * as jose from 'jose'

const secret = new TextEncoder().encode(
    'cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2',
  )
const alg = 'HS256'

export async function CreateJWT(){
    return await new jose.SignJWT().setProtectedHeader({alg}).setExpirationTime('1h').sign(secret)
}

export async function VerifyJWT(jwt:string):Promise<boolean>{
    return jose.jwtVerify(jwt, secret)
    .then(()=>true)
    .catch(()=>false)
}