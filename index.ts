import express, {
  type Response,
  type Request,
  type NextFunction,
} from "express";
import dotenv from "dotenv";
import userRouter from "./router/userRoute";
import morgan from "morgan";
import procurementItemRouter from "./router/procurementItem";
import ClubsRouter from "./router/ClubsRouter";
import grantsRouter from "./router/grantsRouter";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import cors from "cors";

dotenv.config();

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Procurement System SU",
      version: "1.0.0",
      description: "API Documentation",
      contact: {
        name: "Team backend",
        email: "rojapoomala@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
      {
        url: "https://procurementsystem-su-backend-1.onrender.com",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./router/*.ts"],
};

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/api/u", userRouter);
app.use("/api/p", procurementItemRouter);
app.use("/api/c", ClubsRouter);
app.use("/api/g", grantsRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Use a default port or an environment-specified port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
