import express from "express";
import mongoose from "mongoose";
import path from "path";
import dotenv from "dotenv";
import { menuRouter } from "./routes/menu-route.js";
import { loginRouter } from "./routes/login-route.js";
import { cargarDatosInicio } from "./models/datos-inicio.js";
import { docenteRouter } from "./routes/docente-route.js";
import { estudianteRouter } from "./routes/estudiante-route.js";
import { cursoRouter } from "./routes/curso-route.js";

dotenv.config();
const uri = process.env.MONGODB_URI;
//const uri = "mongodb+srv://tpback:tpback@cluster0.i9e4hxq.mongodb.net/tpback08?retryWrites=true&w=majority&appName=Cluster0";

console.log("MongoDB URI:", process.env.MONGODB_URI);
//console.log("MongoDB URI:", uri);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "pug");
app.set("views", "./views");

mongoose
  .connect(uri, {})
  .then(() => {
    console.log("Conectado a MongoDB");
    cargarDatosInicio();
  })
  .catch((error) => console.log("Error al conectar a MongoDB:", error));

// Middleware para garantizar que no se pueda acceder a las rutas sin haberse
// logueado, es decir accediendo a las página mediante el menu principal al
// cual se llega vía login.
app.use((req, res, next) => {
  let referer = req.headers.referer;

  if (req.url === "/") {
    next();
  } else {
    // deja entrar a la página si fue llamada desde otra página en localhost,
    // es decir del menú, si se intenta acceder directamente a una página  sin
    // haber pasado por el menú, redirige a 404
    if (referer && referer.startsWith("http://localhost") && req.url !== "/") {
      next();
    } else {
      res.status(404).render("404");
    }
  }
});

app.use(loginRouter);
app.use(menuRouter);
app.use("/docente", docenteRouter);
app.use("/estudiante", estudianteRouter);
app.use("/curso", cursoRouter);

app.use((req, res) => {
  res.status(404).render("404");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
