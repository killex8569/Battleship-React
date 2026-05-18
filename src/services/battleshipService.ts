import axios from 'axios';
import { type Ship } from '../types';

const axiosInstance = axios.create({
    baseURL: "http://localhost:8080/",
});

// Injecte le token JWT sur chaque requête
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default class BattleshipService {

    // ── Ships (existant) ──────────────────────────────────────────────────────
    static getShips(): Promise<Ship[]> {
        return axiosInstance.get('/api/ships').then(r => r.data).catch(e => Promise.reject(e));
    }

    static getShipByID(id: number): Promise<Ship> {
        return axiosInstance.get(`/api/ships/${id}`).then(r => r.data).catch(e => Promise.reject(e));
    }

    // ── Auth ──────────────────────────────────────────────────────────────────
    static login(name: string, password: string): Promise<any> {
        return axiosInstance
            .post('/api/auth/login', { name, password })
            .then((resp) => {
                const token = resp.data.token.access_token;
                localStorage.setItem("token", token);
                return resp.data;
            })
            .catch(e => Promise.reject(e));
    }

    // ── Lobby ─────────────────────────────────────────────────────────────────
    static createGame(gridSize: number, shipCount: number): Promise<any> {
        return axiosInstance
            .post('/api/game/create', { gridSize, shipCount })
            .then(r => r.data)
            .catch(e => Promise.reject(e));
    }

    static getGames(): Promise<any> {
        return axiosInstance.get('/api/games').then(r => r.data).catch(e => Promise.reject(e));
    }

    static joinGame(gameId: number): Promise<any> {
        return axiosInstance
            .post(`/api/game/${gameId}/join`)
            .then(r => r.data)
            .catch(e => Promise.reject(e));
    }

    // ── In-game ───────────────────────────────────────────────────────────────
    static getGameById(gameId: string): Promise<any> {
        return axiosInstance.get(`/api/game/${gameId}`).then(r => r.data).catch(e => Promise.reject(e));
    }

    static getMyBoard(gameId: string): Promise<any> {
        return axiosInstance.get(`/api/game/${gameId}/board/my`).then(r => r.data).catch(e => Promise.reject(e));
    }

    static getOpponentBoard(gameId: string): Promise<any> {
        return axiosInstance.get(`/api/game/${gameId}/board/opponent`).then(r => r.data).catch(e => Promise.reject(e));
    }

    static getMyShips(gameId: string): Promise<any> {
        return axiosInstance.get(`/api/game/${gameId}/ships/my`).then(r => r.data).catch(e => Promise.reject(e));
    }

    static getOpponentShips(gameId: string): Promise<any> {
        return axiosInstance.get(`/api/game/${gameId}/ships/opponent`).then(r => r.data).catch(e => Promise.reject(e));
    }

    static fire(gameId: string, row: number, col: number): Promise<any> {
        return axiosInstance
            .post(`/api/game/${gameId}/fire`, { row, col })
            .then(r => r.data)
            .catch(e => Promise.reject(e));
    }

    // ── Placement ─────────────────────────────────────────────────────────────
    static placeShip(gameId: string, shipId: number, row: number, col: number, orientation: 'H' | 'V'): Promise<any> {
        return axiosInstance
            .post(`/api/game/${gameId}/ships/place`, { shipId, row, col, orientation })
            .then(r => r.data)
            .catch(e => Promise.reject(e));
    }

    static ready(gameId: string): Promise<any> {
        return axiosInstance
            .post(`/api/game/${gameId}/ready`)
            .then(r => r.data)
            .catch(e => Promise.reject(e));
    }
}