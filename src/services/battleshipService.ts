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
}