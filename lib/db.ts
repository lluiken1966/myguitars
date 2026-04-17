import "reflect-metadata";
import { DataSource } from "typeorm";
import { Guitar } from "@/entities/Guitar";
import { User } from "@/entities/User";
import { GuitarImage } from "@/entities/GuitarImage";
import { Amp } from "@/entities/Amp";
import { AmpImage } from "@/entities/AmpImage";
import { PasswordResetToken } from "@/entities/PasswordResetToken";

declare global {
  // eslint-disable-next-line no-var
  var _dataSource: DataSource | undefined;
}

function createDataSource() {
  return new DataSource({
    type: "mysql",
    host: process.env.MARIADB_HOST,
    port: parseInt(process.env.MARIADB_PORT || "3306"),
    username: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    database: process.env.MARIADB_DATABASE,
    extra: {
      connectionLimit: 4,
    },
    entities: [Guitar, User, GuitarImage, Amp, AmpImage, PasswordResetToken],
    synchronize: process.env.NODE_ENV === "development",
  });
}

let initializationPromise: Promise<DataSource> | null = null;

export async function getDataSource(): Promise<DataSource> {
  // Check if the cached DataSource is still valid (entity classes may change on hot reload)
  if (global._dataSource?.isInitialized) {
    try {
      global._dataSource.getMetadata(Guitar);
      global._dataSource.getMetadata(User);
      global._dataSource.getMetadata(GuitarImage);
      global._dataSource.getMetadata(Amp);
      global._dataSource.getMetadata(AmpImage);
      global._dataSource.getMetadata(PasswordResetToken);
      return global._dataSource;
    } catch {
      // Stale cache — entity classes were replaced by hot reload
      await global._dataSource.destroy();
      global._dataSource = undefined;
      initializationPromise = null;
    }
  }

  if (!initializationPromise) {
    initializationPromise = (async () => {
      const ds = createDataSource();
      await ds.initialize();
      global._dataSource = ds;
      return ds;
    })();
  }

  return initializationPromise;
}
