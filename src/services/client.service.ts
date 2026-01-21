import { Client } from "@/common/client";
import { createService } from "@/common/messaging";

export class ClientService {
  constructor(private readonly client: Client) {}

  public async importFromMapgenieAccount() {
    await this.client.importFromMapgenieAccount();
  }

  public async clearMap() {
    await this.client.clearMap();
  }

  public async clearGame() {
    await this.client.clearGame();
  }
}

const clientService = createService({
  context: ClientService,
  namespace: "ClientService",
  heartbeatTimeout: import.meta.env.SERVICE_TIMEOUT,
});

namespace clientService {
  export type Instance = createService.User<typeof ClientService>;
}

export default clientService;
