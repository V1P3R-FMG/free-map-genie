declare namespace Lib {
    type Axios = import("axios").Axios & Record<symbol, any>;
    type Toastr = typeof import("toastr");
}
