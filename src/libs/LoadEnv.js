import env from "dotenv";

const LoadEnv = () => {
  const env_path =
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development";

  env.config({
    path: env_path,
  });
};

export default LoadEnv;
