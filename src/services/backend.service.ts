import { Storage } from "@/common/storage";
import { createService, type ProxiedObject } from "@/common/messaging";

class BackendService extends Storage {}

const backendService = createService({
  context: BackendService,
  heartbeatTimeout: 60000,
  namespace: "BackendService",
});

namespace backendService {
  export type Instance = ProxiedObject<BackendService>;
}

export default backendService;
