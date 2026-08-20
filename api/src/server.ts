import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { AppRoutes } from "./routes/routes";
import path from "path/win32";
const app = express();

// Cargar variables de entorno
dotenv.config();

// Puerto
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint raíz
app.get("/", (req, res) => {
  res.json({
    message: "API de FotoPro Marketplace funcionando correctamente",
    version: "1.0.0",
  });
});

// ---- Definir rutas ----

app.use(AppRoutes.routes);

// Acceso a imágenes/archivos multimedia

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
  console.log("Presione CTRL-C para detenerlo\n");
});

app.use("/images",express.static( 
path.join(path.resolve(),"assets/uploads")))
