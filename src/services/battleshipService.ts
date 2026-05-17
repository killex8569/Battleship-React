import axios from 'axios';
import { type Ship } from '../types';
const axiosInstance = axios.create({
    baseURL: "http://localhost:8080/", //TODO
})
export default class BattleshipService {
    static getShips(): Promise<Ship[]> {
        return axiosInstance
            .get('/api/ships')
            .then((resp) => {
                return resp.data;
            })
            .catch((e) => Promise.reject(e));
    }
    static getShipByID(id : number): Promise<Ship> {
        return axiosInstance
            .get(`/api/ships/${id}`)
            .then((resp) => {
                return resp.data;
            })
            .catch((e)=> Promise.reject(e));
    }
    static login(name: string, password: string): Promise<any> {
        return axiosInstance
            .post('/api/auth/login', {
                name,
                password
            })
            .then((resp) => {

                const token = resp.data.token.access_token ;

                // stockage
                localStorage.setItem("token", token);
                return resp.data;
            })
            .catch((e) => Promise.reject(e));
    }

    static createGame(gridSize: number, shipCount: number): Promise<any> {
        return axiosInstance.post('/api/game/create', {
            gridSize,
            shipCount
        })
        .then((resp) => {
            return resp.data;
        })
        .catch((e) => Promise.reject(e));
    }

    static getGames(): Promise<any> {
        return axiosInstance.get('/api/games')
        .then((resp) => {
            return resp.data;
        })
        .catch((e) => Promise.reject(e));
    }
}