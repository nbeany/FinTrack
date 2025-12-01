require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    await sequelize.sync({ alter: true });
    console.log("Models synchronized with database");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(" Unable to start server:", error);
    process.exit(1);
  }
}

startServer();
