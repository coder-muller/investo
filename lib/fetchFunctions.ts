import axios from "axios";

const baseUrl = '/api';

export async function sendGetRequest<T>(url: string): Promise<T> {
    try {
        const response = await axios.get(`${baseUrl}${url}`)
        return response.data
    } catch (error) {
        console.error(error)
        if (axios.isAxiosError(error) && error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        throw error
    }
}

export async function sendPostRequest<T>(url: string, data: unknown): Promise<T> {
    try {
        const response = await axios.post(`${baseUrl}${url}`, data)
        return response.data
    } catch (error) {
        console.error(error)
        if (axios.isAxiosError(error) && error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        throw error
    }
}

export async function sendPutRequest<T>(url: string, data: unknown): Promise<T> {
    try {
        const response = await axios.put(`${baseUrl}${url}`, data)
        return response.data
    } catch (error) {
        console.error(error)
        if (axios.isAxiosError(error) && error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        throw error
    }
}

export async function sendDeleteRequest<T>(url: string): Promise<T> {
    try {
        const response = await axios.delete(`${baseUrl}${url}`)
        return response.data
    } catch (error) {
        console.error(error)
        if (axios.isAxiosError(error) && error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        throw error
    }
}
