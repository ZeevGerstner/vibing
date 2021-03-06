import axios from 'axios'
const BASE_URL = process.env.NODE_ENV !== 'development'
    ? ''
    : '//localhost:3000'

function login(user){
    return axios.put(`${BASE_URL}/login`,{ user })
    .then(res => res.data)
}

function signup(newUser){
    return axios.post(`${BASE_URL}/signup`,{ newUser })
    .then(res => res.data)
}

export default {
    login,
    signup
}