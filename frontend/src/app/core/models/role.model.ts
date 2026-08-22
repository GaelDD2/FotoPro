export enum Rol {
    ADMIN = 'ADMIN',
    CLIENTE = 'CLIENTE',
    PROFESIONAL='PROFESIONAL'
}

export interface RoleOption {
    value: Rol;
    label: string;
}