import "reflect-metadata";
import { DataSource } from "typeorm";
import { Guitar } from "@/entities/Guitar";
import { User } from "@/entities/User";

declare global {
  // eslint-disable-next-line no-var
  var _dataSource: DataSource | undefined;
}

function createDataSource() {
  return new DataSource({
    type: "oracle",
    username: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_SERVICE,
    extra: {
      configDir: process.env.TNS_ADMIN,
      walletLocation: process.env.TNS_ADMIN,
      walletPassword: process.env.ORACLE_WALLET_PASSWORD,
    },
    entities: [Guitar, User],
    synchronize: process.env.NODE_ENV === "development",
  });
}

export async function getDataSource(): Promise<DataSource> {
  // Check if the cached DataSource is still valid (entity classes may change on hot reload)
  if (global._dataSource?.isInitialized) {
    try {
      global._dataSource.getMetadata(Guitar);
      global._dataSource.getMetadata(User);
      return global._dataSource;
    } catch {
      // Stale cache — entity classes were replaced by hot reload
      await global._dataSource.destroy();
      global._dataSource = undefined;
    }
  }

  const ds = createDataSource();
  await ds.initialize();

  if (process.env.NODE_ENV !== "production") {
    global._dataSource = ds;
  }

  return ds;
}
