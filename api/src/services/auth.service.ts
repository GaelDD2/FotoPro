import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/app-error';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';
import { Rol } from '../../generated/prisma';

const JWT_SECRET = process.env.JWT_SECRET ?? 'secret_dev';
const JWT_EXPIRES = process.env.JWT_EXPIRES ?? '8h';

export const authService = {

    async login(data: LoginDto) {

        const usuario = await prisma.usuario.findUnique({
            where: {
                correo: data.correo
            }
        });

        if (!usuario) {
            throw new Error("Correo o contraseña incorrectos");
        }

        const isPasswordValid = await bcrypt.compare(
            data.contrasena,
            usuario.contrasenaHash
        );

        if (!isPasswordValid) {
            throw new Error("Correo o contraseña incorrectos");
        }

        const payload = {
            id: usuario.id,
            correo: usuario.correo,
            role: usuario.rol,
        };

        const secret: Secret = process.env.JWT_SECRET || "vj_utn_2026";

        const options: SignOptions = {
            expiresIn: "2h",
        };

        const token = jwt.sign(
            payload,
            secret,
            options
        );

        return {
            token
        };
    },

    async register(data: RegisterDto) {
        const existe = await prisma.usuario.findUnique({
            where: { correo: data.correo },
        });

        if (existe) {
            throw AppError.conflict('El correo ya está registrado');
        }

        const hash = await bcrypt.hash(data.contrasena, 10);

        const usuario = await prisma.usuario.create({
            data: {
                nombre: data.nombre,
                apellidos: data.apellidos,
                correo: data.correo,
                contrasenaHash: hash,
                telefono: data.telefono,
                rol: Rol.CLIENTE,
            },
            select: {
                id: true,
                nombre: true,
                apellidos: true,
                correo: true,
                rol: true,
                estado: true,
            },
        });

        const token = jwt.sign(
            {
                id: usuario.id,
                correo: usuario.correo,
                role: usuario.rol,
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES } as jwt.SignOptions
        );

        return { token, usuario };
    },

    async perfil(id: number) {
        const usuario = await prisma.usuario.findUnique({
            where: { id },
            select: {
                id: true,
                nombre: true,
                apellidos: true,
                correo: true,
                telefono: true,
                rol: true,
                estado: true,
                createdAt: true,
                perfilProfesional: {
                    select: { id: true, disponible: true, imagenPerfilUrl: true },
                },
            },
        });

        if (!usuario) {
            throw AppError.notFound('Usuario no encontrado');
        }

        return usuario;
    },
};