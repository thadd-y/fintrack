export interface AuthUser {
    id: string;
    email: string;
    token: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}