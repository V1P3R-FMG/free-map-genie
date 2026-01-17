import { Storage } from "@/common/storage";
import { createService, type ProxiedObject } from "@/common/messaging";

class BackendService extends Storage {}

const backendService = createService({
  context: BackendService,
  namespace: "BackendService",
  heartbeatTimeout: import.meta.env.SERVICE_TIMEOUT,
});

namespace backendService {
  export type Instance = ProxiedObject<BackendService>;
}

export default backendService;
